package io.github.golgames1.viraam

import android.annotation.SuppressLint
import android.app.Activity
import android.content.ComponentName
import android.content.ContentValues
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.provider.Settings
import android.view.WindowInsets
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.Toast
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

/** Settings and first-run setup, drawn by assets/settings.html. */
class MainActivity : Activity() {

    companion object {
        /** so a stray app can't make quotes appear; only our own testing uses this */
        private const val TEST_KEY = "interlude-dev-7h2q"
        private const val PICK_IMPORT = 41
    }

    private lateinit var root: FrameLayout
    private lateinit var web: WebView
    private var preview: Overlay? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        root = FrameLayout(this)
        root.setBackgroundColor(Color.parseColor("#F1F3F0"))
        web = WebView(this)
        web.setBackgroundColor(Color.parseColor("#F1F3F0"))
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.allowFileAccess = true            // the bundled fonts live next to the page
        web.addJavascriptInterface(Bridge(), "Android")
        web.webViewClient = AssetsOnlyClient()
        root.addView(web, FrameLayout.LayoutParams(-1, -1))
        setContentView(root)

        // keep the page clear of the status and navigation bars
        root.setOnApplyWindowInsetsListener { v, insets ->
            val lp = web.layoutParams as FrameLayout.LayoutParams
            if (Build.VERSION.SDK_INT >= 30) {
                val bars = insets.getInsets(WindowInsets.Type.systemBars() or WindowInsets.Type.ime())
                lp.setMargins(bars.left, bars.top, bars.right, bars.bottom)
            } else {
                @Suppress("DEPRECATION")
                lp.setMargins(insets.systemWindowInsetLeft, insets.systemWindowInsetTop, insets.systemWindowInsetRight, insets.systemWindowInsetBottom)
            }
            web.requestLayout()
            insets
        }
        web.loadUrl("file:///android_asset/settings.html")
        debugTest(intent)
    }

    // testing only: adb shell am start -n io.github.golgames1.viraam.debug/io.github.golgames1.viraam.MainActivity --ei test 3 --es key <key>
    override fun onNewIntent(intent: Intent) { super.onNewIntent(intent); debugTest(intent) }
    private fun debugTest(i: Intent?) {
        if (!BuildConfig.DEBUG) return                      // never in a released build
        if (i?.getStringExtra("key") != TEST_KEY) return
        val s = i.getIntExtra("test", -1)
        if (s >= 0) { ViraamService.instance?.showIn(s * 1000L, i.getStringExtra("look"), i.getStringExtra("quote")); moveTaskToBack(true) }
    }

    override fun onResume() {
        super.onResume()
        web.evaluateJavascript("window.refreshStatus && refreshStatus()", null)
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (preview != null) { preview?.remove(); return }
        @Suppress("DEPRECATION") super.onBackPressed()
    }

    private fun serviceOn(): Boolean {
        val enabled = Settings.Secure.getString(contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES) ?: return false
        val me = ComponentName(this, ViraamService::class.java).flattenToString()
        return enabled.split(':').any { it.equals(me, ignoreCase = true) }
    }

    /* ---------- backup: your own lines and kept lines ---------- */

    private fun backupJson(): String {
        val p = Prefs.json(this)
        return JSONObject()
            .put("app", "Viraam").put("saved", System.currentTimeMillis())
            .put("mine", p.optJSONArray("mine") ?: JSONArray())
            .put("kept", p.optJSONArray("kept") ?: JSONArray())
            .toString(2)
    }

    private fun writeToDownloads(name: String, text: String): String {
        return if (Build.VERSION.SDK_INT >= 29) {
            val values = ContentValues().apply {
                put(MediaStore.Downloads.DISPLAY_NAME, name)
                put(MediaStore.Downloads.MIME_TYPE, "application/json")
            }
            val uri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                ?: return "Could not save"
            contentResolver.openOutputStream(uri)?.use { it.write(text.toByteArray()) }
            "Saved to Downloads as $name"
        } else {
            @Suppress("DEPRECATION")
            val f = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), name)
            f.writeText(text)
            "Saved to ${f.absolutePath}"
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        @Suppress("DEPRECATION") super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != PICK_IMPORT || resultCode != RESULT_OK) return
        val uri: Uri = data?.data ?: return
        try {
            val text = contentResolver.openInputStream(uri)?.bufferedReader()?.readText() ?: return
            val backup = JSONObject(text)
            val p = Prefs.json(this)
            var added = 0
            // merge, never replace: anything already there stays
            for (key in listOf("mine", "kept")) {
                val have = p.optJSONArray(key) ?: JSONArray()
                val texts = (0 until have.length()).map { have.getJSONObject(it).optString("t") }.toMutableSet()
                val incoming = backup.optJSONArray(key) ?: JSONArray()
                for (i in 0 until incoming.length()) {
                    val o = incoming.getJSONObject(i)
                    if (texts.add(o.optString("t"))) { have.put(o); added++ }
                }
                p.put(key, have)
            }
            Prefs.save(this, p.toString())
            Toast.makeText(this, if (added > 0) "Added $added lines" else "Nothing new to add", Toast.LENGTH_LONG).show()
            web.reload()
        } catch (e: Exception) {
            Toast.makeText(this, "That file didn't look like a Viraam backup", Toast.LENGTH_LONG).show()
        }
    }

    inner class Bridge {
        @JavascriptInterface fun getPrefs(): String = Prefs.json(this@MainActivity).toString()
        @JavascriptInterface fun setPrefs(json: String) {
            Prefs.save(this@MainActivity, json)
            ViraamService.instance?.forgetCache()
        }
        @JavascriptInterface fun serviceOn(): Boolean = this@MainActivity.serviceOn()

        /** which of the watched groups are actually installed on this phone */
        @JavascriptInterface fun installedApps(): String {
            val pm = packageManager
            val out = JSONObject()
            ViraamService.APPS.forEach { (group, pkgs) ->
                out.put(group, pkgs.any {
                    try { pm.getPackageInfo(it, 0); true } catch (e: Exception) { false }
                })
            }
            return out.toString()
        }

        /** everything the status card needs, as JSON */
        @JavascriptInterface fun status(): String {
            val s = ViraamService.instance ?: return JSONObject().put("off", true).toString()
            return s.status().toString()
        }

        /** "Not now": pause for a number of minutes, or 0 to resume */
        @JavascriptInterface fun pauseFor(minutes: Int) = runOnUiThread {
            val p = Prefs.json(this@MainActivity)
            p.put("pausedUntil", if (minutes <= 0) 0L else System.currentTimeMillis() + minutes * 60_000L)
            Prefs.save(this@MainActivity, p.toString())
            ViraamService.instance?.forgetCache()
        }

        @JavascriptInterface fun openAccessibility() = runOnUiThread {
            startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        }

        /** Show a real interlude over whatever app you switch to. */
        @JavascriptInterface fun testIn(seconds: Int) = runOnUiThread {
            val s = ViraamService.instance
            if (s == null) {
                Toast.makeText(this@MainActivity, "Turn Viraam on first", Toast.LENGTH_SHORT).show()
            } else {
                s.showIn(seconds * 1000L, null)
                Toast.makeText(this@MainActivity, "Go to any app. It will appear in $seconds seconds.", Toast.LENGTH_LONG).show()
            }
        }

        /** Play one look right here, over the settings screen. */
        @JavascriptInterface fun preview(look: String) = runOnUiThread {
            if (preview != null) return@runOnUiThread
            val p = Prefs.json(this@MainActivity)
            // previews always play their sound unless sound is switched off entirely
            val cfg: JSONObject = baseConfig(this@MainActivity, p, look).put("preview", true)
                .put("sound", p.optString("sound") != "off")
            preview = Overlay(this@MainActivity, null, root, onFinished = { preview = null }).also { it.show(cfg) }
        }

        @JavascriptInterface fun share(text: String) = runOnUiThread {
            val i = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text)
            startActivity(Intent.createChooser(i, "Share this line"))
        }

        @JavascriptInterface fun exportData() = runOnUiThread {
            val msg = try { writeToDownloads("interlude-backup.json", backupJson()) } catch (e: Exception) { "Could not save: ${e.message}" }
            Toast.makeText(this@MainActivity, msg, Toast.LENGTH_LONG).show()
        }

        @JavascriptInterface fun importData() = runOnUiThread {
            val i = Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*")
            @Suppress("DEPRECATION") startActivityForResult(i, PICK_IMPORT)
        }
    }
}
