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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.MoneyOff
import androidx.compose.material.icons.filled.MoreTime
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.domain.MortgageCalculator
import com.example.data.local.LoanSettingsEntity
import com.example.data.local.PaymentEntity
import com.example.ui.dialogs.textFieldColors
import com.example.ui.theme.BlueLight
import com.example.ui.theme.DarkBg
import com.example.ui.theme.EmeraldLight
import com.example.ui.theme.SurfaceCard
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextSecondary
import java.util.Locale

@Composable
fun SimulatorScreen(
    payments: List<PaymentEntity>,
    settings: LoanSettingsEntity,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    val latestPayment = payments.lastOrNull()
    val currentBalance = latestPayment?.remainingBalance ?: settings.initialCapital
    val remainingMonths = (settings.totalTermMonths - payments.size).coerceAtLeast(12)

    var extraAmountInput by remember { mutableStateOf("5000") }
    val extraAmount = extraAmountInput.replace(',', '.').toDoubleOrNull() ?: 5000.0

    val (reduceTerm, reduceFee) = remember(currentBalance, settings.annualInterestRate, remainingMonths, extraAmount) {
        MortgageCalculator.simulateExtraAmortization(
            currentBalance = currentBalance,
            annualRatePercent = settings.annualInterestRate,
            remainingMonths = remainingMonths,
            extraAmount = extraAmount
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBg)
            .padding(horizontal = 16.dp)
            .verticalScroll(scrollState)
            .testTag("simulator_screen")
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Simulador de Amortización Anticipada",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )
        Text(
            text = "Compara la reducción de plazo vs. la reducción de cuota",
            style = MaterialTheme.typography.bodySmall,
            color = TextSecondary
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Input Card
        Card(
            modifier = Modifier.fillMaxWidth().testTag("simulator_input_card"),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Aportación Extraordinaria",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = extraAmountInput,
                    onValueChange = { extraAmountInput = it },
                    label = { Text("Importe a amortizar (€)") },
                    leadingIcon = { Icon(Icons.Default.Calculate, contentDescription = null, tint = EmeraldLight) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth().testTag("simulator_amount_input"),
                    colors = textFieldColors()
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Capital actual: %,.2f €".format(currentBalance),
                        style = MaterialTheme.typography.bodySmall,
                        color = TextMuted
                    )
                    Text(
                        text = "Plazo restante: ${remainingMonths / 12} años y ${remainingMonths % 12} meses",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextMuted
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Option 1: Reduce Term Card
        Card(
            modifier = Modifier.fillMaxWidth().testTag("reduce_term_card"),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(EmeraldLight.copy(alpha = 0.2f))
                            .padding(8.dp)
                    ) {
                        Icon(Icons.Default.MoreTime, contentDescription = null, tint = EmeraldLight)
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column {
                        Text(
                            text = "Opción 1: Reducción de Plazo",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = EmeraldLight
                        )
                        Text(
                            text = "Mantienes la cuota mensual y recortas la duración del préstamo",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text("Ahorro en Intereses", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                        Text(
                            text = String.format(Locale.getDefault(), "%,.2f €", reduceTerm.interestSaved),
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = EmeraldLight
                        )
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text("Tiempo Reducido", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                        Text(
                            text = "${reduceTerm.monthsSaved / 12} años y ${reduceTerm.monthsSaved % 12} meses",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "Cuota mensual se mantiene en %,.2f €/mes. Finalizarás la hipoteca en ${reduceTerm.newMonthsLeft / 12} años.".format(reduceTerm.originalMonthlyFee),
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Option 2: Reduce Monthly Fee Card
        Card(
            modifier = Modifier.fillMaxWidth().testTag("reduce_fee_card"),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(BlueLight.copy(alpha = 0.2f))
                            .padding(8.dp)
                    ) {
                        Icon(Icons.Default.MoneyOff, contentDescription = null, tint = BlueLight)
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column {
                        Text(
                            text = "Opción 2: Reducción de Cuota",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = BlueLight
                        )
                        Text(
                            text = "Mantienes la duración y bajas la cuota mensual a pagar",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text("Nueva Cuota Mensual", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                        Text(
                            text = String.format(Locale.getDefault(), "%,.2f €", reduceFee.newMonthlyFee),
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = BlueLight
                        )
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text("Ahorro Mensual", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                        Text(
                            text = String.format(Locale.getDefault(), "-%,.2f €/mes", reduceFee.feeReductionMonthly),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = EmeraldLight
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "Ahorro total en intereses: %,.2f €. El plazo se mantiene en ${reduceFee.newMonthsLeft / 12} años.".format(reduceFee.interestSaved),
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(80.dp))
    }
}
