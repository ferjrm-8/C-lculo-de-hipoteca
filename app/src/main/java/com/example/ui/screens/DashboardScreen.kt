package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.HomeWork
import androidx.compose.material.icons.filled.Handshake
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.local.LoanSettingsEntity
import com.example.data.local.PaymentEntity
import com.example.ui.components.AmortizationCurveChart
import com.example.ui.components.MetricGrid
import com.example.ui.components.MonthlyBreakdownChart
import com.example.ui.components.OwnerContributionChart
import com.example.ui.components.SyncBanner
import com.example.ui.theme.DarkBg
import com.example.ui.theme.EmeraldLight
import com.example.ui.theme.Owner1Color
import com.example.ui.theme.Owner2Color
import com.example.ui.theme.SurfaceCard
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextSecondary
import java.util.Locale

@Composable
fun DashboardScreen(
    payments: List<PaymentEntity>,
    settings: LoanSettingsEntity,
    onAddPayment: () -> Unit,
    onOpenSyncSettings: () -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    val initialCapital = settings.initialCapital
    val latestPayment = payments.lastOrNull()
    val remainingBalance = latestPayment?.remainingBalance ?: initialCapital
    val amortizedCapital = (initialCapital - remainingBalance).coerceAtLeast(0.0)
    val amortizedPercent = if (initialCapital > 0) (amortizedCapital / initialCapital * 100) else 0.0

    val currentFee = latestPayment?.totalFee ?: 513.81
    val co1Contrib = latestPayment?.coOwner1Contribution ?: 283.63
    val co2Contrib = latestPayment?.coOwner2Contribution ?: (currentFee - co1Contrib)

    val totalInterestPaid = payments.sumOf { it.interestPaid }
    val totalExtraAmortized = payments.sumOf { it.extraAmortization }

    val owner1Total = payments.sumOf { it.coOwner1Contribution }
    val owner2Total = payments.sumOf { it.coOwner2Contribution }

    val estimatedSavings = totalExtraAmortized * 0.42
    val latestAccountBalance = latestPayment?.accountBalance ?: 26.15

    Box(modifier = modifier.fillMaxSize().background(DarkBg)) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
                .verticalScroll(scrollState)
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Header Banner
            Card(
                modifier = Modifier.fillMaxWidth().testTag("dashboard_header_card"),
                colors = CardDefaults.cardColors(containerColor = SurfaceCard),
                shape = RoundedCornerShape(20.dp)
            ) {
                Row(
                    modifier = Modifier.padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(EmeraldLight.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.HomeWork,
                            contentDescription = "Hipoteca Conjunta",
                            tint = EmeraldLight,
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    Column {
                        Text(
                            text = "Hipoteca Conjunta",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "Seguimiento & Cuadro de Amortización",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            SyncBanner(
                syncCode = settings.sharedSyncCode,
                onOpenSyncSettings = onOpenSyncSettings,
                modifier = Modifier.testTag("sync_banner")
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Joint Account and Internal Debt Card (from spreadsheet)
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = SurfaceCard),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Handshake, contentDescription = null, tint = EmeraldLight)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Acuerdo y Saldos entre Cotitulares",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.AccountBalanceWallet, contentDescription = null, tint = EmeraldLight, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Cuenta: %,.2f €".format(latestAccountBalance),
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = if (latestAccountBalance >= 0) EmeraldLight else Color(0xFFEF4444)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Pnd. Pago a ${settings.coOwner1Name}", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                            Text(
                                text = String.format(Locale.getDefault(), "%,.2f €", settings.internalDebtLaura),
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = Owner1Color
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text("Pnd. Pago a ${settings.coOwner2Name}", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                            Text(
                                text = String.format(Locale.getDefault(), "%,.2f €", settings.internalDebtRak),
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = Owner2Color
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            MetricGrid(
                remainingBalance = remainingBalance,
                initialCapital = initialCapital,
                amortizedPercent = amortizedPercent,
                currentMonthlyFee = currentFee,
                coOwner1Contrib = co1Contrib,
                coOwner2Contrib = co2Contrib,
                coOwner1Name = settings.coOwner1Name,
                coOwner2Name = settings.coOwner2Name,
                totalInterestPaid = totalInterestPaid,
                totalExtraAmortized = totalExtraAmortized,
                estimatedSavings = estimatedSavings
            )

            Spacer(modifier = Modifier.height(16.dp))

            AmortizationCurveChart(
                payments = payments,
                initialCapital = initialCapital
            )

            Spacer(modifier = Modifier.height(16.dp))

            MonthlyBreakdownChart(recentPayments = payments)

            Spacer(modifier = Modifier.height(16.dp))

            OwnerContributionChart(
                owner1Name = settings.coOwner1Name,
                owner2Name = settings.coOwner2Name,
                owner1Total = owner1Total,
                owner2Total = owner2Total
            )

            Spacer(modifier = Modifier.height(80.dp))
        }

        FloatingActionButton(
            onClick = onAddPayment,
            containerColor = EmeraldLight,
            contentColor = Color.Black,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(20.dp)
                .testTag("add_payment_fab")
        ) {
            Icon(imageVector = Icons.Default.Add, contentDescription = "Añadir Mes")
        }
    }
}
