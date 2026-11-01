package pl.matma.app;

import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Systemowy dialog druku dla bieżącej strony WebView (style @media print) – stąd „Zapisz jako PDF” albo drukarka.
 * WebView nie obsługuje window.print(), dlatego aplikacja woła to przez src/lib/print.ts.
 */
@CapacitorPlugin(name = "Print")
public class PrintPlugin extends Plugin {

    @PluginMethod
    public void print(PluginCall call) {
        String name = call.getString("name", "Matma");
        getActivity().runOnUiThread(() -> {
            try {
                PrintManager manager = (PrintManager) getContext().getSystemService(Context.PRINT_SERVICE);
                PrintDocumentAdapter adapter = getBridge().getWebView().createPrintDocumentAdapter(name);
                PrintAttributes attributes = new PrintAttributes.Builder()
                    .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                    .build();
                manager.print(name, adapter, attributes);
                call.resolve();
            } catch (Exception e) {
                call.reject("Nie udało się otworzyć drukowania", e);
            }
        });
    }
}
