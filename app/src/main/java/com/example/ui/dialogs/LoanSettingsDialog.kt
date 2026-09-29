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
import com.example.ui.theme.EmeraldLight
import com.example.ui.theme.SurfaceCard
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextSecondary

@Composable
fun LoanSettingsDialog(
    settings: LoanSettingsEntity,
    onDismiss: () -> Unit,
    onSave: (LoanSettingsEntity) -> Unit
) {
    var capitalText by remember { mutableStateOf(String.format("%.2f", settings.initialCapital)) }
    var termYearsText by remember { mutableStateOf((settings.totalTermMonths / 12).toString()) }
    var interestRateText by remember { mutableStateOf(String.format("%.2f", settings.annualInterestRate)) }
    var owner1NameText by remember { mutableStateOf(settings.coOwner1Name) }
    var owner2NameText by remember { mutableStateOf(settings.coOwner2Name) }
    var owner1PctText by remember { mutableStateOf(String.format("%.2f", settings.coOwner1Percentage)) }
    var owner2PctText by remember { mutableStateOf(String.format("%.2f", settings.coOwner2Percentage)) }
    var debtRakText by remember { mutableStateOf(String.format("%.2f", settings.internalDebtRak)) }
    var debtLauraText by remember { mutableStateOf(String.format("%.2f", settings.internalDebtLaura)) }
    var syncCodeText by remember { mutableStateOf(settings.sharedSyncCode) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier.fillMaxWidth().testTag("loan_settings_dialog")
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = "Ajustes del Préstamo",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Parámetros de hipoteca, cotitulares y saldos",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = capitalText,
                    onValueChange = { capitalText = it },
                    label = { Text("Capital Total Concedido (€)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth().testTag("input_initial_capital"),
                    colors = textFieldColors()
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = termYearsText,
                        onValueChange = { termYearsText = it },
                        label = { Text("Plazo (Años)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f).testTag("input_term_years"),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    OutlinedTextField(
                        value = interestRateText,
                        onValueChange = { interestRateText = it },
                        label = { Text("Tipo Interés (%)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f).testTag("input_interest_rate"),
                        colors = textFieldColors()
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = owner1NameText,
                        onValueChange = { owner1NameText = it },
                        label = { Text("Titular 1") },
                        modifier = Modifier.weight(1f).testTag("input_owner1_name"),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    OutlinedTextField(
                        value = owner1PctText,
                        onValueChange = { owner1PctText = it },
                        label = { Text("% Reparto") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f).testTag("input_owner1_pct"),
                        colors = textFieldColors()
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = owner2NameText,
                        onValueChange = { owner2NameText = it },
                        label = { Text("Titular 2") },
                        modifier = Modifier.weight(1f).testTag("input_owner2_name"),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    OutlinedTextField(
                        value = owner2PctText,
                        onValueChange = { owner2PctText = it },
                        label = { Text("% Reparto") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f).testTag("input_owner2_pct"),
                        colors = textFieldColors()
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = debtLauraText,
                        onValueChange = { debtLauraText = it },
                        label = { Text("Pnd. Pago a ${settings.coOwner1Name} (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f).testTag("input_debt_laura"),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    OutlinedTextField(
                        value = debtRakText,
                        onValueChange = { debtRakText = it },
                        label = { Text("Pnd. Pago a ${settings.coOwner2Name} (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f).testTag("input_debt_rak"),
                        colors = textFieldColors()
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = syncCodeText,
                    onValueChange = { syncCodeText = it },
                    label = { Text("Clave Sincronización Compartida") },
                    modifier = Modifier.fillMaxWidth().testTag("input_sync_code"),
                    colors = textFieldColors()
                )

                Spacer(modifier = Modifier.height(20.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f).testTag("cancel_settings_button")
                    ) {
                        Text("Cancelar", color = TextMuted)
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Button(
                        onClick = {
                            val cap = capitalText.replace(',', '.').toDoubleOrNull() ?: settings.initialCapital
                            val yrs = termYearsText.toIntOrNull() ?: (settings.totalTermMonths / 12)
                            val rate = interestRateText.replace(',', '.').toDoubleOrNull() ?: settings.annualInterestRate
                            val p1 = owner1PctText.replace(',', '.').toDoubleOrNull() ?: settings.coOwner1Percentage
                            val p2 = owner2PctText.replace(',', '.').toDoubleOrNull() ?: settings.coOwner2Percentage
                            val dLaura = debtLauraText.replace(',', '.').toDoubleOrNull() ?: settings.internalDebtLaura
                            val dRak = debtRakText.replace(',', '.').toDoubleOrNull() ?: settings.internalDebtRak

                            val updated = settings.copy(
                                initialCapital = cap,
                                totalTermMonths = yrs * 12,
                                annualInterestRate = rate,
                                coOwner1Name = owner1NameText.ifBlank { "Titular A" },
                                coOwner2Name = owner2NameText.ifBlank { "Titular B" },
                                coOwner1Percentage = p1,
                                coOwner2Percentage = p2,
                                internalDebtLaura = dLaura,
                                internalDebtRak = dRak,
                                sharedSyncCode = syncCodeText.ifBlank { "hipoteca_familia_2026" },
                                updatedAt = System.currentTimeMillis()
                            )
                            onSave(updated)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldLight),
                        modifier = Modifier.weight(1f).testTag("save_settings_button")
                    ) {
                        Text("Guardar", color = Color.Black, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
