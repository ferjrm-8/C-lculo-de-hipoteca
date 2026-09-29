package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.AutoGraph
import androidx.compose.material.icons.filled.Paid
import androidx.compose.material.icons.filled.Percent
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.AmberAccent
import com.example.ui.theme.BlueLight
import com.example.ui.theme.EmeraldLight
import com.example.ui.theme.SurfaceCard
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextSecondary
import java.util.Locale

@Composable
fun MetricCard(
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector,
    iconColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelMedium,
                    color = TextSecondary,
                    fontWeight = FontWeight.Medium
                )

                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(iconColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = title,
                        tint = iconColor,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = value,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = TextMuted,
                fontSize = 11.sp
            )
        }
    }
}

@Composable
fun MetricGrid(
    remainingBalance: Double,
    initialCapital: Double,
    amortizedPercent: Double,
    currentMonthlyFee: Double,
    coOwner1Contrib: Double,
    coOwner2Contrib: Double,
    coOwner1Name: String,
    coOwner2Name: String,
    totalInterestPaid: Double,
    totalExtraAmortized: Double,
    estimatedSavings: Double,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            MetricCard(
                title = "Capital Pendiente",
                value = String.format(Locale.getDefault(), "%,.2f €", remainingBalance),
                subtitle = "De %,.0f € iniciales".format(initialCapital),
                icon = Icons.Default.AccountBalance,
                iconColor = EmeraldLight,
                modifier = Modifier.weight(1f)
            )

            MetricCard(
                title = "% Amortizado",
                value = "%.1f%%".format(amortizedPercent),
                subtitle = "%,.2f € pagados".format(initialCapital - remainingBalance),
                icon = Icons.Default.Percent,
                iconColor = BlueLight,
                modifier = Modifier.weight(1f)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            MetricCard(
                title = "Cuota Mensual",
                value = String.format(Locale.getDefault(), "%,.2f €", currentMonthlyFee),
                subtitle = "$coOwner1Name: %,.2f€ | $coOwner2Name: %,.2f€".format(coOwner1Contrib, coOwner2Contrib),
                icon = Icons.Default.Paid,
                iconColor = EmeraldLight,
                modifier = Modifier.weight(1f)
            )

            MetricCard(
                title = "Intereses Acumulados",
                value = String.format(Locale.getDefault(), "%,.2f €", totalInterestPaid),
                subtitle = "Total pagado al banco",
                icon = Icons.Default.AutoGraph,
                iconColor = AmberAccent,
                modifier = Modifier.weight(1f)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            MetricCard(
                title = "Amortizado Extra",
                value = String.format(Locale.getDefault(), "%,.2f €", totalExtraAmortized),
                subtitle = "Aportaciones adicionales",
                icon = Icons.Default.Savings,
                iconColor = EmeraldLight,
                modifier = Modifier.weight(1f)
            )

            MetricCard(
                title = "Ahorro Estimado",
                value = String.format(Locale.getDefault(), "%,.2f €", estimatedSavings),
                subtitle = "En intereses futuros",
                icon = Icons.Default.ArrowDownward,
                iconColor = BlueLight,
                modifier = Modifier.weight(1f)
            )
        }
    }
}
