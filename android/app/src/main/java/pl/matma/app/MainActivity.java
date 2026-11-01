package pl.matma.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // własne wtyczki rejestrujemy przed super.onCreate – wtedy most JS już je zna
        registerPlugin(PrintPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
