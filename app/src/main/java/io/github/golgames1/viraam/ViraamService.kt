package io.github.golgames1.viraam

import android.accessibilityservice.AccessibilityService
import android.app.KeyguardManager
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.res.Configuration
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import org.json.JSONObject
import java.time.LocalTime
import kotlin.random.Random

/**
 * The timing brain. Watches only two things: which app is in front, and when
 * a scroll happens. It cannot read screen content.
 *
 * A "drift meter" fills while you scroll feed apps and drains when you do
 * something else or put the phone down. Once it passes a tipping point (set
 * a little differently each time), the next scroll in a feed app, the gap
 * between two reels, is when the interlude appears.
 */
class ViraamService : AccessibilityService() {

    companion object {
        var instance: ViraamService? = null
            private set

        // settings name -> app packages
        val APPS = mapOf(
            "Instagram" to listOf("com.instagram.android", "com.instagram.lite"),
            "YouTube" to listOf("com.google.android.youtube"),
            "X" to listOf("com.twitter.android"),
            "Facebook" to listOf("com.facebook.katana", "com.facebook.lite"),
            "Snapchat" to listOf("com.snapchat.android"),
            "Reddit" to listOf("com.reddit.frontpage"),
            "Moj & Josh" to listOf("in.mohalla.video", "com.eterno.shortvideos", "in.mohalla.sharechat"),
            "TikTok" to listOf("com.zhiliaoapp.musically", "com.ss.android.ugc.trill", "com.ss.android.ugc.tiktok.lite"),
            // every browser, not just Chrome: the feed is on the websites
            "Browsers" to listOf(
                "com.android.chrome", "com.sec.android.app.sbrowser", "org.mozilla.firefox",
                "com.brave.browser", "com.microsoft.emmx", "com.opera.browser", "com.opera.mini.native",
                "com.duckduckgo.mobile.android", "com.vivaldi.browser", "com.UCMobile.intl"
            )
        )
        private const val BROWSERS = "Browsers"

        private const val FEED_RATE = 4.2      // meter points per minute in a feed app
        private const val SLOW_RATE = 1.2      // browsing
        private const val DRAIN_OTHER = -3.0   // any other app
        private const val DRAIN_OFF = -6.0     // screen off
        const val COOLDOWN_MS = 20 * 60_000L
        private const val TYPING_WINDOW_MS = 8_000L
    }

    private val main = Handler(Looper.getMainLooper())
    private var pkg = ""
    private var meter = 0.0
    private var threshold = 100.0
    private var armedAt = 0L
    private var lastTick = 0L
    private var lastShown = 0L
    private var typingAt = 0L
    private val scrolls = ArrayDeque<Long>()
    private var overlay: Overlay? = null
    private var focusRequest: AudioFocusRequest? = null

    /* settings are read on every scroll event, so keep a short-lived copy */
    private var cached: JSONObject? = null
    private var cachedAt = 0L
    private fun prefs(): JSONObject {
        val now = System.currentTimeMillis()
        if (cached == null || now - cachedAt > 10_000) { cached = Prefs.json(this); cachedAt = now }
        return cached!!
    }
    fun forgetCache() { cached = null }

    private val tick = object : Runnable {
        override fun run() { update(); main.postDelayed(this, 15_000) }
    }
    private val screenReceiver = object : BroadcastReceiver() {
        override fun onReceive(c: Context, i: Intent) { update() }
    }

    override fun onServiceConnected() {
        instance = this
        lastTick = System.currentTimeMillis()
        // carry the drift and the cooldown across restarts and app updates
        val st = Prefs.state(this)
        meter = st.optDouble("meter", 0.0)
        lastShown = st.optLong("lastShown", 0L)
        threshold = st.optDouble("threshold", 0.0).takeIf { it > 10 } ?: newThreshold()
        main.post(tick)
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_OFF); addAction(Intent.ACTION_SCREEN_ON)
        }
        if (android.os.Build.VERSION.SDK_INT >= 33) registerReceiver(screenReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        else registerReceiver(screenReceiver, filter)
    }

    override fun onDestroy() {
        instance = null
        saveState()
        main.removeCallbacksAndMessages(null)
        try { unregisterReceiver(screenReceiver) } catch (_: Exception) {}
        overlay?.remove()
        super.onDestroy()
    }

    override fun onInterrupt() {}

    override fun onAccessibilityEvent(e: AccessibilityEvent) {
        val p = e.packageName?.toString() ?: return
        when (e.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                if (isKeyboard(p)) { typingAt = System.currentTimeMillis(); return }
                if (p == packageName || p == "com.android.systemui") return
                if (p != pkg) { update(); pkg = p }
            }
            AccessibilityEvent.TYPE_VIEW_SCROLLED -> {
                if (!isFeed(p)) return
                val now = System.currentTimeMillis()
                scrolls.addLast(now)
                while (scrolls.isNotEmpty() && now - scrolls.first() > 60_000) scrolls.removeFirst()
                // the tipping point was passed a moment ago; this swipe is the natural gap
                if (armedAt > 0 && now - armedAt > 1_000) maybeShow()
            }
        }
    }

    /* ---------- the drift meter ---------- */

    private fun watched(): Map<String, Boolean> {
        val apps = prefs().optJSONObject("apps") ?: JSONObject()
        return APPS.keys.associateWith { apps.optInt(it, 0) == 1 }
    }
    private fun group(p: String): String? = APPS.entries.firstOrNull { p in it.value }?.key
    private fun isFeed(p: String): Boolean {
        val g = group(p) ?: return false
        return watched()[g] == true
    }
    private fun isKeyboard(p: String) = p.contains("inputmethod") || p.contains("keyboard") || p.endsWith(".ime")

    private fun update() {
        val now = System.currentTimeMillis()
        val minutes = (now - lastTick) / 60_000.0
        lastTick = now
        val interactive = getSystemService(PowerManager::class.java).isInteractive
        val g = group(pkg)
        val rate = when {
            !interactive -> DRAIN_OFF
            g != null && watched()[g] == true && g != BROWSERS -> FEED_RATE * (if (scrolls.size >= 6) 1.3 else 1.0)
            g == BROWSERS && watched()[g] == true -> SLOW_RATE
            else -> DRAIN_OTHER
        }
        meter = (meter + rate * minutes).coerceIn(0.0, 200.0)
        if (meter >= threshold && armedAt == 0L) armedAt = now
        if (meter < threshold * 0.8) armedAt = 0L
        saveState()
    }

    private fun saveState() = Prefs.saveState(this, meter, lastShown, threshold)

    private fun newThreshold(): Double {
        val sens = when (prefs().optString("sens")) { "gentle" -> 1.4; "watchful" -> 0.75; else -> 1.0 }
        val h = LocalTime.now().hour
        val lateNight = if (h >= 22 || h < 2) 0.85 else 1.0
        return 100.0 * sens * lateNight * Random.nextDouble(0.85, 1.15)
    }

    private fun hhmm(s: String, fallback: LocalTime): LocalTime = try {
        val parts = s.split(":"); LocalTime.of(parts[0].toInt(), parts[1].toInt())
    } catch (e: Exception) { fallback }

    private fun quietNow(p: JSONObject): Boolean {
        if (p.optInt("quiet", 1) != 1) return false
        val from = hhmm(p.optString("quietFrom", "23:00"), LocalTime.of(23, 0))
        val to = hhmm(p.optString("quietTo", "07:30"), LocalTime.of(7, 30))
        val t = LocalTime.now()
        return if (from <= to) t >= from && t < to            // same day window
        else t >= from || t < to                               // crosses midnight
    }

    private fun landscape() = resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE

    /** Why an interlude can't happen right now, or null if it can. */
    private fun blockedBy(p: JSONObject, now: Long): String? {
        if (overlay != null) return "showing"
        if (p.optLong("pausedUntil", 0L) > now) return "paused"
        if (now - lastShown < COOLDOWN_MS) return "cooldown"
        if (Prefs.shownToday(this) >= p.optInt("maxDay", 6)) return "daily limit"
        if (quietNow(p)) return "quiet hours"
        if (getSystemService(KeyguardManager::class.java).isKeyguardLocked) return "locked"
        if (landscape()) return "sideways"
        val am = getSystemService(AudioManager::class.java)
        if (am.mode == AudioManager.MODE_IN_CALL || am.mode == AudioManager.MODE_IN_COMMUNICATION) return "on a call"
        if (now - typingAt < TYPING_WINDOW_MS) return "typing"
        return null
    }

    private fun maybeShow() {
        val now = System.currentTimeMillis()
        forgetCache()
        val p = prefs()
        if (blockedBy(p, now) != null) return
        show(null)
        Prefs.countShown(this)
        meter = 20.0            // not zero: straight back to scrolling brings the next one a bit sooner
        armedAt = 0L
        threshold = newThreshold()
        saveState()
    }

    /** For "Try it now" in settings: show after a delay, skipping the timing checks. */
    fun showIn(ms: Long, look: String?, quote: String? = null) {
        main.postDelayed({ if (overlay == null) show(look, quote) }, ms)
    }

    /** What the settings screen shows on its status card. */
    fun status(): JSONObject {
        val now = System.currentTimeMillis()
        forgetCache()
        val p = prefs()
        return JSONObject()
            .put("drift", (meter / threshold * 100).toInt().coerceIn(0, 100))
            .put("lastShown", lastShown)
            .put("nextPossible", if (lastShown == 0L) 0L else lastShown + COOLDOWN_MS)
            .put("today", Prefs.shownToday(this))
            .put("maxDay", p.optInt("maxDay", 6))
            .put("pausedUntil", p.optLong("pausedUntil", 0L))
            .put("blocked", blockedBy(p, now) ?: JSONObject.NULL)
    }

    /* ---------- showing it ---------- */

    private fun show(forceLook: String?, forceQuote: String? = null) {
        lastShown = System.currentTimeMillis()
        saveState()
        val p = prefs()
        val cfg = baseConfig(this, p, forceLook)
        if (forceQuote != null) cfg.put("forceQuote", forceQuote)
        val hush = p.optString("strength") != "whisper"
        PauseService.start(this)
        overlay = Overlay(this, WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY, null,
            onBegin = { if (hush) hushOtherAudio() },     // the reel goes quiet the moment the look appears
            onFinished = { overlay = null; releaseAudio(); PauseService.stop(this) }
        ).also { it.show(cfg) }
    }

    private fun hushOtherAudio() {
        val am = getSystemService(AudioManager::class.java)
        val req = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()
            )
            .setOnAudioFocusChangeListener { }
            .build()
        am.requestAudioFocus(req)
        focusRequest = req
    }

    private fun releaseAudio() {
        focusRequest?.let { getSystemService(AudioManager::class.java).abandonAudioFocusRequest(it) }
        focusRequest = null
    }
}

/** Everything the overlay page needs to choose and play one interlude. */
fun baseConfig(ctx: Context, p: JSONObject, forceLook: String?): JSONObject {
    val am = ctx.getSystemService(AudioManager::class.java)
    val nm = ctx.getSystemService(NotificationManager::class.java)
    // "Follow phone" = play unless Do Not Disturb is on or the media volume is down.
    // (Our sound is media, like a video, so the ringer switch alone shouldn't silence it.)
    val dnd = try { nm.currentInterruptionFilter != NotificationManager.INTERRUPTION_FILTER_ALL } catch (e: Exception) { false }
    val mediaOn = am.getStreamVolume(AudioManager.STREAM_MUSIC) > 0
    val sound = when (p.optString("sound")) {
        "on" -> true
        "off" -> false
        else -> mediaOn && !dnd
    }
    val vibrate = p.optString("sound") != "off" && !sound &&
        am.ringerMode != AudioManager.RINGER_MODE_SILENT
    return JSONObject()
        .put("prefs", p)
        .put("history", Prefs.history(ctx))
        .put("hour", LocalTime.now().hour)
        .put("forceLook", forceLook ?: JSONObject.NULL)
        .put("strength", p.optString("strength", "nudge"))
        .put("sound", sound)
        .put("vibrate", vibrate)
}
