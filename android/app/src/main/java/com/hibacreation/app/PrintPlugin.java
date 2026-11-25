package com.hibacreation.app;

import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Pont natif vers le service d'impression Android.
 *
 * <p>Le WebView Android n'implémente pas {@code window.print()} : l'appel ne
 * fait rien et le bouton « Imprimer le reçu » semble mort dans l'APK. Ce plugin
 * ouvre le vrai dialogue d'impression Android (imprimante ou « Enregistrer en
 * PDF ») en utilisant l'adaptateur fourni par le WebView.</p>
 */
@CapacitorPlugin(name = "Print")
public class PrintPlugin extends Plugin {

    @PluginMethod
    public void print(PluginCall call) {
        final String jobName = call.getString("jobName", "Document");

        // PrintManager doit être appelé depuis le thread UI.
        getActivity().runOnUiThread(() -> {
            try {
                WebView webView = getBridge().getWebView();
                if (webView == null) {
                    call.reject("Le WebView n'est pas disponible.");
                    return;
                }

                PrintManager printManager =
                        (PrintManager) getContext().getSystemService(Context.PRINT_SERVICE);
                if (printManager == null) {
                    call.reject("Le service d'impression Android est indisponible.");
                    return;
                }

                PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(jobName);

                // Marges natives alignées avec @page (8 mm) pour éviter toute
                // coupe du reçu tout en conservant une mise en page A4 portrait.
                int marginMils = 315; // 8 mm
                PrintAttributes attributes = new PrintAttributes.Builder()
                        .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                        .setMinMargins(new PrintAttributes.Margins(
                                marginMils, marginMils, marginMils, marginMils))
                        .setColorMode(PrintAttributes.COLOR_MODE_COLOR)
                        .setResolution(new PrintAttributes.Resolution(
                                "a4-portrait-300dpi", "A4 portrait 300 DPI", 300, 300))
                        .build();

                printManager.print(jobName, adapter, attributes);
                call.resolve();
            } catch (Exception exception) {
                call.reject("Impression impossible : " + exception.getMessage(), exception);
            }
        });
    }
}
