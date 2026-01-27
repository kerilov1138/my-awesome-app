package com.universal.app
import android.os.Bundle
import android.webkit.*
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewAssetLoader.AssetsPathHandler

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        webView = WebView(this)
        
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            loadWithOverviewMode = true
            useWideViewPort = true
            javaScriptCanOpenWindowsAutomatically = true
            mediaPlaybackRequiresUserGesture = false
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        // Sanal sunucu ayarları: Beyaz ekran sorununu çözen asıl kısım burasıdır.
        // Bu yapı sayesinde 'index.html' içindeki '/assets/...' gibi yollar bozulmadan çalışır.
        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", AssetsPathHandler(this))
            .build()

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? {
                // İstekleri yakalar ve assets/www içindeki dosyalara yönlendirir
                return assetLoader.shouldInterceptRequest(request.url)
            }

            override fun onReceivedError(
                view: WebView,
                request: WebResourceRequest,
                error: WebResourceError
            ) {
                // Hataları kontrol etmek için burası kullanılabilir
                super.onReceivedError(view, request, error)
            }
        }

        webView.webChromeClient = WebChromeClient()
        
        // Uygulamayı güvenli bir HTTPS domaini üzerinden yüklüyoruz.
        // Bu sayede modern JS kütüphaneleri (React/Vue) hata vermez.
        webView.loadUrl("https://appassets.androidplatform.net/assets/www/index.html")
        
        setContentView(webView)
    }

    override fun onBackPressed() {
        if (::webView.isInitialized && webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}