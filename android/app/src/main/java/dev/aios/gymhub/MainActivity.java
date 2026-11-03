package dev.aios.gymhub;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.graphics.Color;
import androidx.core.view.WindowCompat;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setNavigationBarColor(Color.rgb(26, 26, 26));
        getWindow().setStatusBarColor(Color.rgb(26, 26, 26));
        getWindow().getDecorView().setSystemUiVisibility(0);
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView()).setAppearanceLightStatusBars(false);
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView()).setAppearanceLightNavigationBars(false);
    }
}
