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
import com.example.data.local.LoanSettingsEntity
import com.example.data.local.PaymentEntity
import com.example.ui.theme.EmeraldLight
import com.example.ui.theme.RoseError
import com.example.ui.theme.SurfaceCard
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextSecondary

@Composable
fun EditPaymentDialog(
    payment: PaymentEntity,
    settings: LoanSettingsEntity,
    onDismiss: () -> Unit,
    onSave: (PaymentEntity) -> Unit,
    onDelete: (Long) -> Unit
) {
    var totalFeeText by remember { mutableStateOf(String.format("%.2f", payment.totalFee)) }
    var co1ContribText by remember { mutableStateOf(String.format("%.2f", payment.coOwner1Contribution)) }
    var co2ContribText by remember { mutableStateOf(String.format("%.2f", payment.coOwner2Contribution)) }
    var interestText by remember { mutableStateOf(String.format("%.2f", payment.interestPaid)) }
    var principalText by remember { mutableStateOf(String.format("%.2f", payment.principalAmortized)) }
    var extraAmortText by remember { mutableStateOf(String.format("%.2f", payment.extraAmortization)) }
    var depositText by remember { mutableStateOf(String.format("%.2f", payment.coOwner1Deposit)) }
    var communityText by remember { mutableStateOf(String.format("%.2f", payment.communityExpense)) }
    var electricityText by remember { mutableStateOf(String.format("%.2f", payment.electricityExpense)) }
    var insuranceText by remember { mutableStateOf(String.format("%.2f", payment.insuranceExpense)) }
    var ibiText by remember { mutableStateOf(String.format("%.2f", payment.ibiExpense)) }
    var notesText by remember { mutableStateOf(payment.notes) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier.fillMaxWidth().testTag("edit_payment_dialog")
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Editar Mes",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "${payment.monthName} ${payment.year}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = EmeraldLight,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    TextButton(
                        onClick = { onDelete(payment.id) },
                        modifier = Modifier.testTag("delete_payment_button")
                    ) {
                        Text("Eliminar", color = RoseError)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = totalFeeText,
                    onValueChange = { totalFeeText = it },
                    label = { Text("Recibo Banco Total (€)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    colors = textFieldColors()
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = co1ContribText,
                        onValueChange = { co1ContribText = it },
                        label = { Text("Cuota ${settings.coOwner1Name} (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    OutlinedTextField(
                        value = co2ContribText,
                        onValueChange = { co2ContribText = it },
                        label = { Text("Cuota ${settings.coOwner2Name} (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
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
                        modifier = Modifier.weight(1f),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    OutlinedTextField(
                        value = principalText,
                        onValueChange = { principalText = it },
                        label = { Text("Capital Amortizado (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        colors = textFieldColors()
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = extraAmortText,
                    onValueChange = { extraAmortText = it },
                    label = { Text("Amortización Extraordinaria (€)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    colors = textFieldColors()
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = depositText,
                        onValueChange = { depositText = it },
                        label = { Text("Ingreso en Cuenta (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    OutlinedTextField(
                        value = communityText,
                        onValueChange = { communityText = it },
                        label = { Text("Comunidad (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        colors = textFieldColors()
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = electricityText,
                        onValueChange = { electricityText = it },
                        label = { Text("Luz (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    OutlinedTextField(
                        value = insuranceText,
                        onValueChange = { insuranceText = it },
                        label = { Text("Seguro (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        colors = textFieldColors()
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = ibiText,
                    onValueChange = { ibiText = it },
                    label = { Text("IBI (€)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    colors = textFieldColors()
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = notesText,
                    onValueChange = { notesText = it },
                    label = { Text("Concepto / Notas") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = textFieldColors()
                )

                Spacer(modifier = Modifier.height(20.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f).testTag("cancel_edit_button")
                    ) {
                        Text("Cancelar", color = TextMuted)
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Button(
                        onClick = {
                            val fee = totalFeeText.replace(',', '.').toDoubleOrNull() ?: payment.totalFee
                            val c1 = co1ContribText.replace(',', '.').toDoubleOrNull() ?: payment.coOwner1Contribution
                            val c2 = co2ContribText.replace(',', '.').toDoubleOrNull() ?: payment.coOwner2Contribution
                            val intr = interestText.replace(',', '.').toDoubleOrNull() ?: payment.interestPaid
                            val prin = principalText.replace(',', '.').toDoubleOrNull() ?: payment.principalAmortized
                            val extra = extraAmortText.replace(',', '.').toDoubleOrNull() ?: payment.extraAmortization
                            val dep = depositText.replace(',', '.').toDoubleOrNull() ?: payment.coOwner1Deposit
                            val com = communityText.replace(',', '.').toDoubleOrNull() ?: payment.communityExpense
                            val luz = electricityText.replace(',', '.').toDoubleOrNull() ?: payment.electricityExpense
                            val seg = insuranceText.replace(',', '.').toDoubleOrNull() ?: payment.insuranceExpense
                            val ibi = ibiText.replace(',', '.').toDoubleOrNull() ?: payment.ibiExpense

                            val updated = payment.copy(
                                totalFee = fee,
                                coOwner1Contribution = c1,
                                coOwner2Contribution = c2,
                                interestPaid = intr,
                                principalAmortized = prin,
                                extraAmortization = extra,
                                coOwner1Deposit = dep,
                                communityExpense = com,
                                electricityExpense = luz,
                                insuranceExpense = seg,
                                ibiExpense = ibi,
                                notes = notesText,
                                updatedAt = System.currentTimeMillis()
                            )
                            onSave(updated)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldLight),
                        modifier = Modifier.weight(1f).testTag("save_edit_button")
                    ) {
                        Text("Guardar Cambios", color = Color.Black, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
