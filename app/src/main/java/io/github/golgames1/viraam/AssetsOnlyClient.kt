package io.github.golgames1.viraam

import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient

/**
 * The looks and the settings screen are local HTML. This refuses anything that
 * isn't one of the app's own asset files, so the Android bridge inside those
 * pages can never be reached by outside content. (The app also has no internet
 * permission, so this is a second lock on the same door.)
 */
private const val ASSETS = "file:///android_asset/"

class AssetsOnlyClient : WebViewClient() {
    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean =
        !(request.url?.toString()?.startsWith(ASSETS) ?: false)

    override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
        if (request.url?.toString()?.startsWith(ASSETS) == true) null
        else WebResourceResponse("text/plain", "utf-8", null)   // blocked
}
