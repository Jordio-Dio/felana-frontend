package com.hibacreation.app;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {

    /**
     * Rend {@code window.print()} fonctionnel même quand le code web déployé
     * est encore l'ancienne version (l'APK charge le site en ligne). Le script
     * est injecté à chaque chargement de page, avant que l'utilisateur clique.
     */
    private static final String PRINT_BRIDGE_JS =
            "(function(){" +
            "  if (window.__hibaPrintBridge || window.__hibaNativePrint) return;" +
            "  var cap = window.Capacitor;" +
            "  if (!cap) return;" +
            "  window.__hibaNativePrint = true;" +
            "  var printNative = function(jobName){" +
            "    if (typeof cap.nativePromise === 'function') {" +
            "      return cap.nativePromise('Print', 'print', { jobName: jobName });" +
            "    }" +
            "    if (typeof cap.registerPlugin === 'function') {" +
            "      var printer = cap.registerPlugin('Print');" +
            "      return printer.print({ jobName: jobName });" +
            "    }" +
            "    return Promise.reject(new Error('Print bridge unavailable'));" +
            "  };" +
            "  var originalPrint = window.print ? window.print.bind(window) : function(){};" +
            "  window.print = function(){" +
            "    try {" +
            "      printNative(document.title || 'Document').catch(function(){" +
            "        try { originalPrint(); } catch (e) {}" +
            "      });" +
            "    } catch (e) {" +
            "      try { originalPrint(); } catch (ignored) {}" +
            "    }" +
            "  };" +
            "})();";

    /**
     * L'APK charge le site déployé : on force ici un fond blanc à l'impression
     * pour éviter la bande grise du tableau de bord sur les anciennes versions
     * du site, même avant le redéploiement des styles d'impression.
     */
    private static final String PRINT_STYLE_JS =
            "(function(){" +
            "  if (document.getElementById('hiba-print-style')) return;" +
            "  var style = document.createElement('style');" +
            "  style.id = 'hiba-print-style';" +
            "  style.textContent = '@media print{" +
            "    html,body,#root,#root>div,#root>div>div{background:#fff!important;}" +
            "    body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}" +
            "    table,thead,tbody,tr,td,th{break-inside:avoid;page-break-inside:avoid;}" +
            "  }';" +
            "  (document.head || document.documentElement).appendChild(style);" +
            "})();";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Doit être déclaré AVANT super.onCreate() pour être enregistré dans le Bridge.
        registerPlugin(PrintPlugin.class);
        super.onCreate(savedInstanceState);

        Bridge bridge = getBridge();
        if (bridge == null) {
            return;
        }

        bridge.addWebViewListener(new WebViewListener() {
            @Override
            public void onPageLoaded(WebView webView) {
                super.onPageLoaded(webView);
                webView.evaluateJavascript(PRINT_STYLE_JS, null);
                webView.evaluateJavascript(PRINT_BRIDGE_JS, null);
            }
        });
    }

    /**
     * Le bouton retour Android doit revenir dans l'historique de l'application
     * au lieu de fermer l'APK immédiatement.
     */
    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        Bridge bridge = getBridge();
        WebView webView = bridge != null ? bridge.getWebView() : null;

        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }

        super.onBackPressed();
    }
}
