package com.example.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val FinancialDarkColorScheme = darkColorScheme(
    primary = EmeraldLight,
    onPrimary = DarkBg,
    primaryContainer = EmeraldDark,
    onPrimaryContainer = TextPrimary,
    secondary = BlueLight,
    onSecondary = DarkBg,
    secondaryContainer = BlueSecondary,
    onSecondaryContainer = TextPrimary,
    tertiary = AmberAccent,
    background = DarkBg,
    onBackground = TextPrimary,
    surface = SurfaceDark,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceCard,
    onSurfaceVariant = TextSecondary,
    outline = SurfaceBorder,
    error = RoseError
)

@Composable
fun HipotecaConjuntaTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = FinancialDarkColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = DarkBg.toArgb()
            window.navigationBarColor = DarkBg.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
