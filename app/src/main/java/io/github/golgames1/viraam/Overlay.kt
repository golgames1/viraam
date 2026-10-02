package io.github.golgames1.viraam

import android.animation.ValueAnimator
import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import org.json.JSONObject

/**
 * One interlude on screen: a transparent WebView that plays a look from
 * assets/overlay.html, then removes itself when the page says it is done.
 *
 * Shown either as a system-wide window (from the accessibility service) or,
 * for previews, inside the settings screen.
 */
class Overlay(
    private val ctx: Context,
    private val windowType: Int?,          // null = add to [host] instead of a system window
    private val host: ViewGroup? = null,
    private val onBegin: () -> Unit = {},
    private val onFinished: () -> Unit = {}
) {
    private val main = Handler(Looper.getMainLooper())
    private val wm = ctx.getSystemService(WindowManager::class.java)
    private var web: WebView? = null
    private var lp: WindowManager.LayoutParams? = null
    private var blurAnim: ValueAnimator? = null
    private var finished = false
    private var configJson = "{}"
    private var begun = false

    /**
     * On some phones a WebView in an overlay window doesn't start producing frames
     * until something pokes it (a touch did). Until the page reports that its first
     * frame is on screen, keep nudging it: a redraw, then a harmless cancelled touch.
     */
    private val nudge = object : Runnable {
        var n = 0
        override fun run() {
            val w = web ?: return
            if (begun || finished) return
            w.invalidate()
            if (n++ >= 2) {
                val t = android.os.SystemClock.uptimeMillis()
                val down = android.view.MotionEvent.obtain(t, t, android.view.MotionEvent.ACTION_DOWN, 1f, 1f, 0)
                val cancel = android.view.MotionEvent.obtain(t, t + 5, android.view.MotionEvent.ACTION_CANCEL, 1f, 1f, 0)
                w.dispatchTouchEvent(down); w.dispatchTouchEvent(cancel)
                down.recycle(); cancel.recycle()
            }
            main.postDelayed(this, 250)
        }
    }

    val canBlur: Boolean
        get() = windowType != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && wm.isCrossWindowBlurEnabled

    @SuppressLint("SetJavaScriptEnabled")
    fun show(config: JSONObject) {
        val touchable = config.optString("strength") != "whisper"
        config.put("blur", canBlur)
        configJson = config.toString()

        val w = WebView(ctx)
        w.setBackgroundColor(Color.TRANSPARENT)
        w.settings.javaScriptEnabled = true
        w.settings.mediaPlaybackRequiresUserGesture = false
        w.settings.domStorageEnabled = true
        w.settings.allowFileAccess = true            // the bundled fonts live next to the page
        w.settings.cacheMode = android.webkit.WebSettings.LOAD_NO_CACHE   // always the freshest look files
        w.isVerticalScrollBarEnabled = false
        // keep the page's renderer at full priority even though our app isn't the one in front
        w.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false)
        w.isHorizontalScrollBarEnabled = false
        w.addJavascriptInterface(Bridge(), "Android")
        // the page asks for its config itself as soon as it's parsed (see Bridge.config).
        // Nothing but our own asset files may ever load here, so the bridge below can
        // only be reached by code shipped inside the app.
        w.webViewClient = AssetsOnlyClient()
        w.webChromeClient = object : android.webkit.WebChromeClient() {
            override fun onConsoleMessage(m: android.webkit.ConsoleMessage): Boolean {
                android.util.Log.i("Viraam", "js: ${m.message()} @${m.lineNumber()}"); return true
            }
        }
        web = w

        if (windowType != null) {
            var flags = WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS or
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
            if (!touchable) flags = flags or WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
            if (canBlur) flags = flags or WindowManager.LayoutParams.FLAG_BLUR_BEHIND
            val p = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.MATCH_PARENT,
                windowType, flags, PixelFormat.TRANSLUCENT
            )
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P)
                p.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
            if (canBlur && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) p.blurBehindRadius = 0
            lp = p
            wm.addView(w, p)
        } else {
            host?.addView(w, ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        }
        w.clearCache(true)          // never show yesterday's copy of a look
        w.onResume()
        w.resumeTimers()
        w.loadUrl("file:///android_asset/overlay.html")
        main.postDelayed(nudge, 300)

        // safety net: never leave anything on screen if the page misbehaves
        main.postDelayed({ remove() }, 45_000)
    }

    fun remove() {
        if (finished) return
        finished = true
        blurAnim?.cancel()
        main.removeCallbacksAndMessages(null)
        web?.let { w ->
            try {
                if (windowType != null) wm.removeView(w) else host?.removeView(w)
            } catch (_: Exception) {}
            w.destroy()
        }
        web = null
        onFinished()
    }

    /** Frost: fog the real screen behind the glass (Android 12+ with blur support). */
    private fun animateBlur(on: Boolean, ms: Long) {
        if (!canBlur || Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return
        val p = lp ?: return
        val w = web ?: return
        blurAnim?.cancel()
        blurAnim = ValueAnimator.ofInt(p.blurBehindRadius, if (on) 90 else 0).apply {
            duration = ms
            addUpdateListener {
                p.blurBehindRadius = it.animatedValue as Int
                try { wm.updateViewLayout(w, p) } catch (_: Exception) {}
            }
            start()
        }
    }

    inner class Bridge {
        @JavascriptInterface fun config(): String = configJson
        /** the look has actually started on screen */
        @JavascriptInterface fun begin() { main.post { begun = true; onBegin() } }
        @JavascriptInterface fun done() { main.post { remove() } }
        @JavascriptInterface fun chosen(look: String, id: String) { Prefs.recordShown(ctx, look, id) }
        @JavascriptInterface fun keep(item: String) { Prefs.addKept(ctx, item) }
        @JavascriptInterface fun blur(on: Boolean, ms: Int) { main.post { animateBlur(on, ms.toLong()) } }
        @JavascriptInterface fun vibrate(ms: Int) {
            val v = ctx.getSystemService(Vibrator::class.java) ?: return
            v.vibrate(VibrationEffect.createOneShot(ms.toLong(), 60))
        }
    }
}
