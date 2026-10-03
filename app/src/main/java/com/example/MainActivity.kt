package com.example

import android.annotation.SuppressLint
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class AndroidNetworkBridge {
    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .build()

    private val executor = java.util.concurrent.Executors.newCachedThreadPool()

    @JavascriptInterface
    fun httpRequest(url: String, method: String, headersJson: String, body: String?): String {
        return try {
            val future = executor.submit(java.util.concurrent.Callable {
                val reqBuilder = Request.Builder().url(url)

                if (headersJson.isNotEmpty() && headersJson != "{}") {
                    val headersObj = JSONObject(headersJson)
                    for (key in headersObj.keys()) {
                        reqBuilder.header(key, headersObj.getString(key))
                    }
                }

                val upperMethod = method.uppercase()
                when (upperMethod) {
                    "GET" -> reqBuilder.get()
                    "POST" -> {
                        val mediaType = "application/json; charset=utf-8".toMediaTypeOrNull()
                        val reqBody = (body ?: "").toRequestBody(mediaType)
                        reqBuilder.post(reqBody)
                    }
                    "PUT" -> {
                        val mediaType = "application/json; charset=utf-8".toMediaTypeOrNull()
                        val reqBody = (body ?: "").toRequestBody(mediaType)
                        reqBuilder.put(reqBody)
                    }
                    "DELETE" -> reqBuilder.delete()
                    else -> reqBuilder.get()
                }

                val response = client.newCall(reqBuilder.build()).execute()
                val respBody = response.body?.string() ?: ""
                val result = JSONObject()
                result.put("status", response.code)
                result.put("statusText", response.message)
                result.put("body", respBody)
                result.toString()
            })

            future.get(15, TimeUnit.SECONDS)
        } catch (e: Exception) {
            val errResult = JSONObject()
            errResult.put("status", 0)
            errResult.put("statusText", e.message ?: "Network Error")
            errResult.put("body", "")
            errResult.toString()
        }
    }
}

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val webViewRef = remember { arrayOfNulls<WebView>(1) }

            BackHandler {
                val wv = webViewRef[0]
                if (wv != null && wv.canGoBack()) {
                    wv.goBack()
                } else {
                    finish()
                }
            }

            WebContainer(
                onWebViewCreated = { wv ->
                    webViewRef[0] = wv
                }
            )
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebContainer(
    onWebViewCreated: (WebView) -> Unit
) {
    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                setBackgroundColor(Color.parseColor("#090d16"))

                // Use software layer to prevent emulator Mesa DRI render node failure
                setLayerType(View.LAYER_TYPE_SOFTWARE, null)

                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    databaseEnabled = true
                    allowFileAccess = true
                    allowContentAccess = true
                    allowFileAccessFromFileURLs = true
                    allowUniversalAccessFromFileURLs = true
                    loadWithOverviewMode = false
                    useWideViewPort = true
                    textZoom = 100
                    builtInZoomControls = false
                    displayZoomControls = false
                    cacheMode = WebSettings.LOAD_DEFAULT
                    mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                }

                addJavascriptInterface(AndroidNetworkBridge(), "AndroidBridge")

                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                    }
                }

                webChromeClient = object : WebChromeClient() {
                    override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                        android.util.Log.d("WebViewConsole", "${consoleMessage?.message()} -- Line ${consoleMessage?.lineNumber()}")
                        return true
                    }
                }

                loadUrl("file:///android_asset/www/index.html")
                onWebViewCreated(this)
            }
        }
    )
}
