package com.example.ui.dialogs

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.example.data.domain.MortgageCalculator
import com.example.data.local.LoanSettingsEntity
import com.example.data.local.PaymentEntity
import com.example.ui.theme.EmeraldLight
import com.example.ui.theme.SurfaceCard
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextSecondary

@Composable
fun AddPaymentDialog(
    latestPayment: PaymentEntity?,
    settings: LoanSettingsEntity,
    onDismiss: () -> Unit,
    onSave: (PaymentEntity) -> Unit
) {
    val nextYear = if (latestPayment == null) settings.startDateYear else {
        if (latestPayment.month == 12) latestPayment.year + 1 else latestPayment.year
    }
    val nextMonthInt = if (latestPayment == null) settings.startDateMonth else {
        if (latestPayment.month == 12) 1 else latestPayment.month + 1
    }
    val nextMonthName = MortgageCalculator.MONTH_NAMES.getOrElse(nextMonthInt - 1) { "Enero" }

    val lastBal = latestPayment?.remainingBalance ?: settings.initialCapital
    val autoInterest = MortgageCalculator.calculateMonthlyInterest(lastBal, settings.annualInterestRate)
    val defaultFee = 513.81
    val autoPrincipal = (defaultFee - autoInterest).coerceAtLeast(0.0)

    val co1Pct = settings.coOwner1Percentage / 100.0
    val co2Pct = settings.coOwner2Percentage / 100.0

    var totalFeeText by remember { mutableStateOf(String.format("%.2f", defaultFee)) }
    var co1ContribText by remember { mutableStateOf(String.format("%.2f", 283.63)) }
    var co2ContribText by remember { mutableStateOf(String.format("%.2f", defaultFee - 283.63)) }
    var interestText by remember { mutableStateOf(String.format("%.2f", autoInterest)) }
    var principalText by remember { mutableStateOf(String.format("%.2f", autoPrincipal)) }
    var extraAmortText by remember { mutableStateOf("0.00") }
    var depositText by remember { mutableStateOf("500.00") }
    var communityText by remember { mutableStateOf("81.00") }
    var electricityText by remember { mutableStateOf("35.00") }
    var notesText by remember { mutableStateOf("Cuota ordinaria") }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier.fillMaxWidth().testTag("add_payment_dialog")
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = "Registrar Pago - $nextMonthName $nextYear",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Detección automática de amortización y gastos",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = totalFeeText,
                    onValueChange = { totalFeeText = it },
                    label = { Text("Recibo Banco Total (€)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth().testTag("input_total_fee"),
                    colors = textFieldColors()
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = co1ContribText,
                        onValueChange = { co1ContribText = it },
                        label = { Text("Cuota ${settings.coOwner1Name} (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f).testTag("input_co1_fee"),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    OutlinedTextField(
                        value = co2ContribText,
                        onValueChange = { co2ContribText = it },
                        label = { Text("Cuota ${settings.coOwner2Name} (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f).testTag("input_co2_fee"),
                        colors = textFieldColors()
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = interestText,
                        onValueChange = { interestText = it },
                        label = { Text("Intereses (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f).testTag("input_interest"),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    OutlinedTextField(
                        value = principalText,
                        onValueChange = { principalText = it },
                        label = { Text("Capital Amortizado (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f).testTag("input_principal"),
                        colors = textFieldColors()
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = extraAmortText,
                    onValueChange = { extraAmortText = it },
                    label = { Text("Amortización Extraordinaria (€)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth().testTag("input_extra_amort"),
                    colors = textFieldColors()
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = depositText,
                        onValueChange = { depositText = it },
                        label = { Text("Ingreso en Cuenta (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f).testTag("input_deposit"),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    OutlinedTextField(
                        value = communityText,
                        onValueChange = { communityText = it },
                        label = { Text("Comunidad (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f).testTag("input_community"),
                        colors = textFieldColors()
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = electricityText,
                    onValueChange = { electricityText = it },
                    label = { Text("Recibo de Luz (€)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth().testTag("input_electricity"),
                    colors = textFieldColors()
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = notesText,
                    onValueChange = { notesText = it },
                    label = { Text("Concepto / Notas") },
                    modifier = Modifier.fillMaxWidth().testTag("input_notes"),
                    colors = textFieldColors()
                )

                Spacer(modifier = Modifier.height(20.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f).testTag("cancel_payment_button")
                    ) {
                        Text("Cancelar", color = TextMuted)
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Button(
                        onClick = {
                            val fee = totalFeeText.replace(',', '.').toDoubleOrNull() ?: defaultFee
                            val c1 = co1ContribText.replace(',', '.').toDoubleOrNull() ?: (fee * co1Pct)
                            val c2 = co2ContribText.replace(',', '.').toDoubleOrNull() ?: (fee * co2Pct)
                            val intr = interestText.replace(',', '.').toDoubleOrNull() ?: autoInterest
                            val prin = principalText.replace(',', '.').toDoubleOrNull() ?: autoPrincipal
                            val extra = extraAmortText.replace(',', '.').toDoubleOrNull() ?: 0.0
                            val dep = depositText.replace(',', '.').toDoubleOrNull() ?: 500.0
                            val com = communityText.replace(',', '.').toDoubleOrNull() ?: 81.0
                            val luz = electricityText.replace(',', '.').toDoubleOrNull() ?: 35.0

                            val payment = PaymentEntity(
                                year = nextYear,
                                month = nextMonthInt,
                                monthName = nextMonthName,
                                totalFee = fee,
                                coOwner1Contribution = c1,
                                coOwner2Contribution = c2,
                                interestPaid = intr,
                                principalAmortized = prin,
                                extraAmortization = extra,
                                interestRatePercent = settings.annualInterestRate,
                                remainingBalance = (lastBal - (prin + extra)).coerceAtLeast(0.0),
                                communityExpense = com,
                                electricityExpense = luz,
                                coOwner1Deposit = dep,
                                notes = notesText,
                                updatedAt = System.currentTimeMillis()
                            )
                            onSave(payment)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldLight),
                        modifier = Modifier.weight(1f).testTag("submit_payment_button")
                    ) {
                        Text("Guardar", color = Color.Black, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun textFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = EmeraldLight,
    unfocusedBorderColor = Color(0xFF22344D),
    focusedLabelColor = EmeraldLight,
    unfocusedLabelColor = TextSecondary,
    focusedTextColor = Color.White,
    unfocusedTextColor = Color.White
)
