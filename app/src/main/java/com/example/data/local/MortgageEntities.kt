package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "mortgage_payments")
data class PaymentEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val year: Int,
    val month: Int, // 1 to 12
    val monthName: String,
    val totalFee: Double,
    val coOwner1Contribution: Double, // Laura's mortgage fee (e.g. 283.63 €)
    val coOwner2Contribution: Double, // Rak's mortgage fee (e.g. 230.18 €)
    val interestPaid: Double, // e.g. 131.73 €
    val principalAmortized: Double, // e.g. 382.08 €
    val extraAmortization: Double = 0.0,
    val interestRatePercent: Double = 1.85,
    val remainingBalance: Double = 0.0,
    // Housing expenses from Excel
    val communityExpense: Double = 81.0,
    val electricityExpense: Double = 0.0,
    val insuranceExpense: Double = 0.0,
    val ibiExpense: Double = 0.0,
    val extraExpenses: Double = 0.0,
    // Deposits into joint account from Excel
    val coOwner1Deposit: Double = 500.0, // Laura monthly deposit
    val coOwner2Deposit: Double = 0.0,
    val accountBalance: Double = 0.0, // Running balance in joint account
    val notes: String = "",
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "loan_settings")
data class LoanSettingsEntity(
    @PrimaryKey val id: Int = 1,
    val initialCapital: Double = 121766.32,
    val totalTermMonths: Int = 300, // 25 years
    val annualInterestRate: Double = 1.85,
    val euriborRate: Double = 3.25,
    val differentialRate: Double = 0.85,
    val isVariableInterest: Boolean = false,
    val startDateYear: Int = 2020,
    val startDateMonth: Int = 11,
    val coOwner1Name: String = "Laura",
    val coOwner2Name: String = "Rak",
    val coOwner1Percentage: Double = 43.94,
    val coOwner2Percentage: Double = 56.06,
    val propertyValuation: Double = 250000.0,
    val pisoValuation: Double = 125000.0,
    val casaValuation: Double = 125000.0,
    val internalDebtRak: Double = 53500.0,
    val internalDebtLaura: Double = 71500.0,
    val sharedSyncCode: String = "hipoteca_familia_2026",
    val updatedAt: Long = System.currentTimeMillis()
)
