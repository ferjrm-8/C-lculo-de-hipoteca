package com.example.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.PaymentEntity
import com.example.ui.theme.AmberAccent
import com.example.ui.theme.BlueLight
import com.example.ui.theme.EmeraldLight
import com.example.ui.theme.Owner1Color
import com.example.ui.theme.Owner2Color
import com.example.ui.theme.SurfaceCard
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextSecondary
import java.util.Locale

@Composable
fun AmortizationCurveChart(
    payments: List<PaymentEntity>,
    initialCapital: Double,
    modifier: Modifier = Modifier
) {
    if (payments.isEmpty()) return

    var selectedIndex by remember { mutableStateOf<Int?>(null) }
    val animatedProgress by animateFloatAsState(
        targetValue = 1f,
        animationSpec = tween(1000),
        label = "curveProgress"
    )

    val maxCap = initialCapital.coerceAtLeast(1000.0)

    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Evolución del Capital Pendiente",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "Curva de amortización en el tiempo",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary
                    )
                }

                selectedIndex?.let { idx ->
                    val p = payments.getOrNull(idx)
                    if (p != null) {
                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "${p.monthName} ${p.year}",
                                style = MaterialTheme.typography.labelMedium,
                                color = EmeraldLight,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = String.format(Locale.getDefault(), "%,.2f €", p.remainingBalance),
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color.White,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
            ) {
                Canvas(
                    modifier = Modifier
                        .fillMaxSize()
                        .pointerInput(payments) {
                            detectTapGestures { offset ->
                                val xRatio = offset.x / size.width
                                val idx = (xRatio * (payments.size - 1)).toInt().coerceIn(0, payments.size - 1)
                                selectedIndex = idx
                            }
                        }
                ) {
                    val w = size.width
                    val h = size.height
                    val stepX = w / (payments.size - 1).coerceAtLeast(1)

                    // Draw grid lines
                    val gridLines = 4
                    for (i in 0..gridLines) {
                        val y = h * i / gridLines
                        drawLine(
                            color = Color(0xFF22344D),
                            start = Offset(0f, y),
                            end = Offset(w, y),
                            strokeWidth = 1f
                        )
                    }

                    val path = Path()
                    val fillPath = Path()

                    payments.forEachIndexed { index, p ->
                        val x = index * stepX
                        val normY = (p.remainingBalance / maxCap).toFloat().coerceIn(0f, 1f)
                        val y = h - (normY * h * animatedProgress)

                        if (index == 0) {
                            path.moveTo(x, y)
                            fillPath.moveTo(x, h)
                            fillPath.lineTo(x, y)
                        } else {
                            val prevX = (index - 1) * stepX
                            val prevNormY = (payments[index - 1].remainingBalance / maxCap).toFloat().coerceIn(0f, 1f)
                            val prevY = h - (prevNormY * h * animatedProgress)
                            val controlX1 = prevX + (stepX / 2f)
                            val controlX2 = x - (stepX / 2f)
                            path.cubicTo(controlX1, prevY, controlX2, y, x, y)
                            fillPath.cubicTo(controlX1, prevY, controlX2, y, x, y)
                        }

                        if (index == payments.size - 1) {
                            fillPath.lineTo(x, h)
                            fillPath.close()
                        }
                    }

                    // Fill gradient
                    drawPath(
                        path = fillPath,
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                EmeraldLight.copy(alpha = 0.35f),
                                Color.Transparent
                            )
                        )
                    )

                    // Draw curve line
                    drawPath(
                        path = path,
                        color = EmeraldLight,
                        style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round)
                    )

                    // Draw selected dot
                    selectedIndex?.let { idx ->
                        if (idx in payments.indices) {
                            val selX = idx * stepX
                            val normY = (payments[idx].remainingBalance / maxCap).toFloat().coerceIn(0f, 1f)
                            val selY = h - (normY * h * animatedProgress)

                            drawLine(
                                color = EmeraldLight.copy(alpha = 0.5f),
                                start = Offset(selX, 0f),
                                end = Offset(selX, h),
                                strokeWidth = 1.5f
                            )

                            drawCircle(
                                color = Color.White,
                                radius = 6.dp.toPx(),
                                center = Offset(selX, selY)
                            )
                            drawCircle(
                                color = EmeraldLight,
                                radius = 4.dp.toPx(),
                                center = Offset(selX, selY)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                val startP = payments.firstOrNull()
                val endP = payments.lastOrNull()
                Text(
                    text = if (startP != null) "${startP.monthName} ${startP.year}" else "",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextMuted
                )
                Text(
                    text = if (endP != null) "${endP.monthName} ${endP.year}" else "",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextMuted
                )
            }
        }
    }
}

@Composable
fun MonthlyBreakdownChart(
    recentPayments: List<PaymentEntity>,
    modifier: Modifier = Modifier
) {
    if (recentPayments.isEmpty()) return

    val displayList = recentPayments.takeLast(12)

    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Desglose Mensual: Intereses vs Capital",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = "Últimos ${displayList.size} meses registrados",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Legend
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Start,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(EmeraldLight)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text("Capital Amortizado", style = MaterialTheme.typography.labelSmall, color = TextSecondary)

                Spacer(modifier = Modifier.width(16.dp))

                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(AmberAccent)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text("Intereses", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
            }

            Spacer(modifier = Modifier.height(16.dp))

            val maxVal = displayList.maxOfOrNull { it.totalFee + it.extraAmortization }?.coerceAtLeast(100.0) ?: 600.0

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                displayList.forEach { p ->
                    val total = p.principalAmortized + p.extraAmortization + p.interestPaid
                    val prinRatio = (p.principalAmortized + p.extraAmortization) / maxVal
                    val intRatio = p.interestPaid / maxVal

                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.weight(1f)
                    ) {
                        Column(
                            modifier = Modifier
                                .width(16.dp)
                                .fillMaxHeight(),
                            verticalArrangement = Arrangement.Bottom
                        ) {
                            if (intRatio > 0) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .fillMaxHeight(intRatio.toFloat())
                                        .clip(RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp))
                                        .background(AmberAccent)
                                )
                            }
                            if (prinRatio > 0) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .fillMaxHeight(prinRatio.toFloat())
                                        .clip(RoundedCornerShape(bottomStart = 4.dp, bottomEnd = 4.dp))
                                        .background(EmeraldLight)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = p.monthName.take(3),
                            style = MaterialTheme.typography.labelSmall,
                            fontSize = 9.sp,
                            color = TextMuted
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun OwnerContributionChart(
    owner1Name: String,
    owner2Name: String,
    owner1Total: Double,
    owner2Total: Double,
    modifier: Modifier = Modifier
) {
    val grandTotal = (owner1Total + owner2Total).coerceAtLeast(1.0)
    val owner1Pct = (owner1Total / grandTotal * 100)
    val owner2Pct = (owner2Total / grandTotal * 100)

    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Comparativa de Aportaciones entre Copropietarios",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = "Total aportado acumulado a la hipoteca",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Progress bar split
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(20.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF22344D))
            ) {
                if (owner1Pct > 0) {
                    Box(
                        modifier = Modifier
                            .fillMaxHeight()
                            .weight(owner1Pct.toFloat())
                            .background(Owner1Color)
                    )
                }
                if (owner2Pct > 0) {
                    Box(
                        modifier = Modifier
                            .fillMaxHeight()
                            .weight(owner2Pct.toFloat())
                            .background(Owner2Color)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(12.dp)
                                .clip(RoundedCornerShape(3.dp))
                                .background(Owner1Color)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(owner1Name, style = MaterialTheme.typography.bodyMedium, color = Color.White, fontWeight = FontWeight.Bold)
                    }
                    Text(
                        text = String.format(Locale.getDefault(), "%,.2f € (%.1f%%)", owner1Total, owner1Pct),
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(12.dp)
                                .clip(RoundedCornerShape(3.dp))
                                .background(Owner2Color)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(owner2Name, style = MaterialTheme.typography.bodyMedium, color = Color.White, fontWeight = FontWeight.Bold)
                    }
                    Text(
                        text = String.format(Locale.getDefault(), "%,.2f € (%.1f%%)", owner2Total, owner2Pct),
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary
                    )
                }
            }
        }
    }
}
