package io.github.golgames1.viraam

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate

/**
 * All settings live in one JSON blob, shared as-is with the settings page and
 * the overlay page, so both sides always agree on the shape.
 */
object Prefs {
    private const val FILE = "viraam"

    // Keep in step with the defaults in assets/settings.js
    private val DEFAULTS = """
        {
          "onboarded": false,
          "on": {"ink":1,"breath":1,"frost":1,"ripple":1,"candle":1,"drift":1,"stars":1},
          "fav": {"candle":1},
          "mode": "rotate",
          "timeOfDay": 1,
          "genres": {"Poetry":1,"Bhakti & Sufi":1,"Zen & Tao":1,"Nature":1},
          "w": {"en":2},
          "showTr": 1,
          "mine": [],
          "freq": "sometimes",
          "strength": "nudge",
          "sens": "balanced",
          "apps": {"Instagram":1,"YouTube":1,"X":1,"Facebook":1,"Snapchat":1,"Reddit":1,"Moj & Josh":1,"TikTok":1,"Browsers":0},
          "quiet": 1,
          "quietFrom": "23:00",
          "quietTo": "07:30",
          "pausedUntil": 0,
          "maxDay": 6,
          "sound": "follow",
          "kept": []
        }
    """.trimIndent()

    private fun sp(ctx: Context) = ctx.getSharedPreferences(FILE, Context.MODE_PRIVATE)

    fun json(ctx: Context): JSONObject {
        val base = JSONObject(DEFAULTS)
        val saved = sp(ctx).getString("prefs", null) ?: return base
        return try {
            val s = JSONObject(saved)
            s.keys().forEach { base.put(it, s.get(it)) }   // saved values win, new keys get defaults
            migrateApps(base)
            base
        } catch (e: Exception) { base }
    }

    /** keep the watched-app list in step when entries are renamed or added */
    private fun migrateApps(p: JSONObject) {
        val apps = p.optJSONObject("apps") ?: return
        if (apps.has("Chrome & websites")) {              // renamed: it was never only Chrome
            if (!apps.has("Browsers")) apps.put("Browsers", apps.optInt("Chrome & websites", 0))
            apps.remove("Chrome & websites")
        }
        val defaults = JSONObject(DEFAULTS).optJSONObject("apps") ?: return
        defaults.keys().forEach { if (!apps.has(it)) apps.put(it, defaults.optInt(it)) }
    }

    fun save(ctx: Context, raw: String) {
        try { JSONObject(raw); sp(ctx).edit().putString("prefs", raw).apply() } catch (_: Exception) {}
    }

    fun addKept(ctx: Context, item: String) {
        val p = json(ctx)
        val kept = p.optJSONArray("kept") ?: JSONArray()
        try {
            val o = JSONObject(item).put("at", System.currentTimeMillis())
            // don't keep the same line twice
            for (i in 0 until kept.length()) if (kept.getJSONObject(i).optString("t") == o.optString("t")) return
            kept.put(o)
            p.put("kept", kept)
            sp(ctx).edit().putString("prefs", p.toString()).apply()
        } catch (_: Exception) {}
    }

    /* recently shown looks and lines, so nothing repeats too soon */
    fun history(ctx: Context): JSONObject =
        try { JSONObject(sp(ctx).getString("history", "{}")!!) } catch (e: Exception) { JSONObject() }

    fun recordShown(ctx: Context, look: String, id: String) {
        val h = history(ctx)
        val recent = h.optJSONArray("recent") ?: JSONArray()
        val list = mutableListOf<String>()
        for (i in 0 until recent.length()) list.add(recent.getString(i))
        list.remove(id); list.add(id)
        while (list.size > 25) list.removeAt(0)
        h.put("recent", JSONArray(list)).put("lastLook", look)
        sp(ctx).edit().putString("history", h.toString()).apply()
    }

    /* drift level and cooldown, kept across restarts */
    fun state(ctx: Context): JSONObject =
        try { JSONObject(sp(ctx).getString("state", "{}")!!) } catch (e: Exception) { JSONObject() }

    fun saveState(ctx: Context, meter: Double, lastShown: Long, threshold: Double) {
        val o = JSONObject().put("meter", meter).put("lastShown", lastShown).put("threshold", threshold)
        sp(ctx).edit().putString("state", o.toString()).apply()
    }

    /* how many interludes today, for the daily limit */
    fun shownToday(ctx: Context): Int {
        val s = sp(ctx)
        return if (s.getString("day", "") == LocalDate.now().toString()) s.getInt("count", 0) else 0
    }

    fun countShown(ctx: Context) {
        val s = sp(ctx)
        val today = LocalDate.now().toString()
        val n = if (s.getString("day", "") == today) s.getInt("count", 0) else 0
        s.edit().putString("day", today).putInt("count", n + 1).apply()
    }
}
