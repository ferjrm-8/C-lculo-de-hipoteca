package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.FloatingActionButton
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.LoanSettingsEntity
import com.example.data.local.PaymentEntity
import com.example.ui.dialogs.textFieldColors
import com.example.ui.theme.AmberAccent
import com.example.ui.theme.DarkBg
import com.example.ui.theme.EmeraldLight
import com.example.ui.theme.Owner1Color
import com.example.ui.theme.Owner2Color
import com.example.ui.theme.SurfaceCard
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextSecondary
import java.util.Locale

@Composable
fun HistoryScreen(
    payments: List<PaymentEntity>,
    settings: LoanSettingsEntity,
    onAddPayment: () -> Unit,
    onEditPayment: (PaymentEntity) -> Unit,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedYear by remember { mutableStateOf<Int?>(null) }

    val availableYears = remember(payments) {
        payments.map { it.year }.distinct().sortedDescending()
    }

    val filteredPayments = remember(payments, searchQuery, selectedYear) {
        payments.filter { payment ->
            val matchesYear = selectedYear == null || payment.year == selectedYear
            val matchesSearch = searchQuery.isBlank() ||
                    payment.monthName.contains(searchQuery, ignoreCase = true) ||
                    payment.year.toString().contains(searchQuery) ||
                    payment.notes.contains(searchQuery, ignoreCase = true)
            matchesYear && matchesSearch
        }.sortedWith(compareByDescending<PaymentEntity> { it.year }.thenByDescending { it.month })
    }

    Box(modifier = modifier.fillMaxSize().background(DarkBg).testTag("history_screen")) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Tabla Histórica de Pagos",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = "Desglose cuota a cuota, gastos de vivienda y saldos",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Buscar mes, año o concepto...", color = TextMuted) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextSecondary) },
                modifier = Modifier.fillMaxWidth().testTag("search_history_input"),
                singleLine = true,
                colors = textFieldColors()
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Year Chips
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                item {
                    FilterChip(
                        selected = selectedYear == null,
                        onClick = { selectedYear = null },
                        label = { Text("Todos") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = EmeraldLight,
                            selectedLabelColor = Color.Black,
                            containerColor = SurfaceCard,
                            labelColor = TextSecondary
                        )
                    )
                }

                items(availableYears) { yr ->
                    FilterChip(
                        selected = selectedYear == yr,
                        onClick = { selectedYear = if (selectedYear == yr) null else yr },
                        label = { Text(yr.toString()) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = EmeraldLight,
                            selectedLabelColor = Color.Black,
                            containerColor = SurfaceCard,
                            labelColor = TextSecondary
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (filteredPayments.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No se encontraron registros.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextMuted
                    )
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(filteredPayments, key = { it.id }) { p ->
                        PaymentRowCard(
                            payment = p,
                            settings = settings,
                            onClick = { onEditPayment(p) }
                        )
                    }

                    item {
                        Spacer(modifier = Modifier.height(80.dp))
                    }
                }
            }
        }

        FloatingActionButton(
            onClick = onAddPayment,
            containerColor = EmeraldLight,
            contentColor = Color.Black,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(20.dp)
                .testTag("history_add_payment_fab")
        ) {
            Icon(imageVector = Icons.Default.Add, contentDescription = "Añadir Pago")
        }
    }
}

@Composable
fun PaymentRowCard(
    payment: PaymentEntity,
    settings: LoanSettingsEntity,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .testTag("payment_row_${payment.id}"),
        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
        shape = RoundedCornerShape(14.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(EmeraldLight.copy(alpha = 0.2f))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "${payment.monthName} ${payment.year}",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = EmeraldLight
                        )
                    }

                    if (payment.extraAmortization > 0) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(AmberAccent.copy(alpha = 0.2f))
                                .padding(horizontal = 6.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "EXTRA +%,.0f€".format(payment.extraAmortization),
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = AmberAccent,
                                fontSize = 10.sp
                            )
                        }
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = String.format(Locale.getDefault(), "%,.2f €", payment.totalFee),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = "Editar",
                        tint = TextMuted,
                        modifier = Modifier.padding(2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Aportaciones Hipoteca", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                    Text(
                        text = "${settings.coOwner1Name}: %,.2f€".format(payment.coOwner1Contribution),
                        style = MaterialTheme.typography.bodySmall,
                        color = Owner1Color,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = "${settings.coOwner2Name}: %,.2f€".format(payment.coOwner2Contribution),
                        style = MaterialTheme.typography.bodySmall,
                        color = Owner2Color,
                        fontWeight = FontWeight.Medium
                    )
                }

                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Gastos de Vivienda", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                    val expenses = mutableListOf<String>()
                    if (payment.communityExpense > 0) expenses.add("Com: %,.0f€".format(payment.communityExpense))
                    if (payment.electricityExpense > 0) expenses.add("Luz: %,.1f€".format(payment.electricityExpense))
                    if (payment.ibiExpense > 0) expenses.add("IBI: %,.0f€".format(payment.ibiExpense))
                    if (payment.insuranceExpense > 0) expenses.add("Seg: %,.0f€".format(payment.insuranceExpense))

                    Text(
                        text = expenses.take(2).joinToString(" | "),
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary
                    )
                    Text(
                        text = "Ingreso: %,.0f €".format(payment.coOwner1Deposit),
                        style = MaterialTheme.typography.bodySmall,
                        color = EmeraldLight
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text("Capital Pendiente", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                    Text(
                        text = String.format(Locale.getDefault(), "%,.2f €", payment.remainingBalance),
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "Saldo: %,.2f €".format(payment.accountBalance),
                        style = MaterialTheme.typography.labelSmall,
                        color = if (payment.accountBalance >= 0) EmeraldLight else Color(0xFFEF4444)
                    )
                }
            }

            if (payment.notes.isNotBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Nota: ${payment.notes}",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondary,
                    fontSize = 11.sp
                )
            }
        }
    }
}
