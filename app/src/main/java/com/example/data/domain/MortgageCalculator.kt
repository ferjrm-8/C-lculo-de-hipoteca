package com.example.data.domain

import com.example.data.local.LoanSettingsEntity
import com.example.data.local.PaymentEntity
import kotlin.math.pow

object MortgageCalculator {

    /**
     * Calculates monthly payment (French system)
     * M = P * (r * (1+r)^n) / ((1+r)^n - 1)
     */
    fun calculateMonthlyFee(
        principal: Double,
        annualRatePercent: Double,
        totalMonths: Int
    ): Double {
        if (principal <= 0 || totalMonths <= 0) return 0.0
        val r = (annualRatePercent / 100.0) / 12.0
        if (r <= 0) return principal / totalMonths
        val power = (1.0 + r).pow(totalMonths.toDouble())
        return principal * (r * power) / (power - 1.0)
    }

    /**
     * Calculates interest part for a month based on remaining principal
     */
    fun calculateMonthlyInterest(
        remainingPrincipal: Double,
        annualRatePercent: Double
    ): Double {
        val r = (annualRatePercent / 100.0) / 12.0
        return remainingPrincipal * r
    }

    /**
     * Recalculates running balances for all payments based on initial capital
     */
    fun recalculateBalances(
        payments: List<PaymentEntity>,
        initialCapital: Double
    ): List<PaymentEntity> {
        var currentBalance = initialCapital
        var currentAccountBalance = 0.0

        return payments.map { payment ->
            val totalAmortized = payment.principalAmortized + payment.extraAmortization
            currentBalance = (currentBalance - totalAmortized).coerceAtLeast(0.0)

            val totalDeposits = payment.coOwner1Deposit + payment.coOwner2Deposit
            val totalExpenses = payment.coOwner1Contribution +
                    payment.communityExpense +
                    payment.electricityExpense +
                    payment.insuranceExpense +
                    payment.ibiExpense +
                    payment.extraExpenses

            currentAccountBalance += (totalDeposits - totalExpenses)

            payment.copy(
                remainingBalance = currentBalance,
                accountBalance = currentAccountBalance
            )
        }
    }

    /**
     * Simulation result data class
     */
    data class SimulationResult(
        val extraAmount: Double,
        val originalTotalInterest: Double,
        val newTotalInterest: Double,
        val interestSaved: Double,
        val originalMonthsLeft: Int,
        val newMonthsLeft: Int,
        val monthsSaved: Int,
        val originalMonthlyFee: Double,
        val newMonthlyFee: Double,
        val feeReductionMonthly: Double
    )

    /**
     * Simulates extra payment impact
     */
    fun simulateExtraAmortization(
        currentBalance: Double,
        annualRatePercent: Double,
        remainingMonths: Int,
        extraAmount: Double
    ): Pair<SimulationResult, SimulationResult> { // Pair(Reduce Term, Reduce Fee)
        val r = (annualRatePercent / 100.0) / 12.0
        val currentFee = calculateMonthlyFee(currentBalance, annualRatePercent, remainingMonths)

        // Calculate original total remaining interest
        var origBal = currentBalance
        var origTotalInt = 0.0
        for (i in 1..remainingMonths) {
            val intPart = origBal * r
            val prinPart = currentFee - intPart
            origTotalInt += intPart
            origBal = (origBal - prinPart).coerceAtLeast(0.0)
        }

        // --- Option 1: Reduce Term (Keep same fee) ---
        val newBalanceReduceTerm = (currentBalance - extraAmount).coerceAtLeast(0.0)
        var termBal = newBalanceReduceTerm
        var termMonths = 0
        var termTotalInt = 0.0
        while (termBal > 0.01 && termMonths < remainingMonths) {
            termMonths++
            val intPart = termBal * r
            val prinPart = (currentFee - intPart).coerceAtLeast(0.0)
            termTotalInt += intPart
            termBal = (termBal - prinPart).coerceAtLeast(0.0)
        }

        val reduceTermResult = SimulationResult(
            extraAmount = extraAmount,
            originalTotalInterest = origTotalInt,
            newTotalInterest = termTotalInt,
            interestSaved = (origTotalInt - termTotalInt).coerceAtLeast(0.0),
            originalMonthsLeft = remainingMonths,
            newMonthsLeft = termMonths,
            monthsSaved = (remainingMonths - termMonths).coerceAtLeast(0),
            originalMonthlyFee = currentFee,
            newMonthlyFee = currentFee,
            feeReductionMonthly = 0.0
        )

        // --- Option 2: Reduce Fee (Keep same term) ---
        val newBalanceReduceFee = (currentBalance - extraAmount).coerceAtLeast(0.0)
        val newFee = calculateMonthlyFee(newBalanceReduceFee, annualRatePercent, remainingMonths)
        var feeBal = newBalanceReduceFee
        var feeTotalInt = 0.0
        for (i in 1..remainingMonths) {
            val intPart = feeBal * r
            val prinPart = newFee - intPart
            feeTotalInt += intPart
            feeBal = (feeBal - prinPart).coerceAtLeast(0.0)
        }

        val reduceFeeResult = SimulationResult(
            extraAmount = extraAmount,
            originalTotalInterest = origTotalInt,
            newTotalInterest = feeTotalInt,
            interestSaved = (origTotalInt - feeTotalInt).coerceAtLeast(0.0),
            originalMonthsLeft = remainingMonths,
            newMonthsLeft = remainingMonths,
            monthsSaved = 0,
            originalMonthlyFee = currentFee,
            newMonthlyFee = newFee,
            feeReductionMonthly = (currentFee - newFee).coerceAtLeast(0.0)
        )

        return Pair(reduceTermResult, reduceFeeResult)
    }

    /**
     * Initial pre-populated seed data matching Excel spreadsheet
     */
    fun getInitialSeedPayments(settings: LoanSettingsEntity): List<PaymentEntity> {
        val initialCapital = settings.initialCapital
        val rate = settings.annualInterestRate
        val totalBankFee = 513.81
        val co1Pct = settings.coOwner1Percentage / 100.0 // 43.94% -> 283.63 €
        val co2Pct = settings.coOwner2Percentage / 100.0 // 56.06% -> 230.18 €
        val co1Fee = 283.63
        val co2Fee = (totalBankFee - co1Fee) // 230.18 €

        // Specific historical items from Excel
        data class MonthSeed(
            val yr: Int,
            val mo: Int,
            val name: String,
            val lauraDeposit: Double,
            val luz: Double,
            val ibi: Double = 0.0,
            val seguro: Double = 0.0,
            val extra: Double = 0.0,
            val extraAmort: Double = 0.0,
            val notes: String = ""
        )

        val historicalRaw = listOf(
            MonthSeed(2020, 11, "Noviembre", 500.0, 25.41, seguro = 190.58, notes = "Seguro hogar anual"),
            MonthSeed(2020, 12, "Diciembre", 500.0, 28.10),
            MonthSeed(2021, 1, "Enero", 500.0, 24.25),
            MonthSeed(2021, 2, "Febrero", 500.0, 22.98),
            MonthSeed(2021, 3, "Marzo", 500.0, 25.91),
            MonthSeed(2021, 4, "Abril", 0.0, 32.74),
            MonthSeed(2021, 5, "Mayo", 500.0, 29.80),
            MonthSeed(2021, 6, "Junio", 500.0, 40.40),
            MonthSeed(2021, 7, "Julio", 500.0, 69.37, extra = 60.20),
            MonthSeed(2021, 8, "Agosto", 500.0, 77.64),
            MonthSeed(2021, 9, "Septiembre", 0.0, 78.66),
            MonthSeed(2021, 10, "Octubre", 0.0, 87.73, ibi = 184.53, notes = "Pago recibo IBI"),
            MonthSeed(2021, 11, "Noviembre", 1500.0, 102.94, extra = 271.56, notes = "Extra + Seguro regularización"),
            MonthSeed(2021, 12, "Diciembre", 500.0, 85.00),
            MonthSeed(2022, 1, "Enero", 500.0, 45.00),
            MonthSeed(2022, 2, "Febrero", 500.0, 48.00),
            MonthSeed(2022, 3, "Marzo", 500.0, 52.00),
            MonthSeed(2022, 4, "Abril", 500.0, 40.00),
            MonthSeed(2022, 5, "Mayo", 500.0, 38.00),
            MonthSeed(2022, 6, "Junio", 500.0, 42.00),
            MonthSeed(2022, 7, "Julio", 500.0, 65.00),
            MonthSeed(2022, 8, "Agosto", 500.0, 70.00),
            MonthSeed(2022, 9, "Septiembre", 500.0, 60.00),
            MonthSeed(2022, 10, "Octubre", 500.0, 62.00, ibi = 190.00),
            MonthSeed(2022, 11, "Noviembre", 500.0, 80.00, seguro = 195.00),
            MonthSeed(2022, 12, "Diciembre", 500.0, 90.00),
            MonthSeed(2023, 1, "Enero", 500.0, 55.00),
            MonthSeed(2023, 2, "Febrero", 500.0, 50.00),
            MonthSeed(2023, 3, "Marzo", 500.0, 48.00),
            MonthSeed(2023, 4, "Abril", 500.0, 45.00),
            MonthSeed(2023, 5, "Mayo", 500.0, 40.00),
            MonthSeed(2023, 6, "Junio", 1000.0, 50.00, extraAmort = 1500.0, notes = "Amortización extra 1.500 €"),
            MonthSeed(2023, 7, "Julio", 500.0, 75.00),
            MonthSeed(2023, 8, "Agosto", 500.0, 80.00),
            MonthSeed(2023, 9, "Septiembre", 500.0, 65.00),
            MonthSeed(2023, 10, "Octubre", 500.0, 70.00, ibi = 195.00),
            MonthSeed(2023, 11, "Noviembre", 500.0, 85.00, seguro = 200.00),
            MonthSeed(2023, 12, "Diciembre", 500.0, 95.00),
            MonthSeed(2024, 1, "Enero", 500.0, 60.00),
            MonthSeed(2024, 2, "Febrero", 500.0, 58.00),
            MonthSeed(2024, 3, "Marzo", 500.0, 55.00),
            MonthSeed(2024, 4, "Abril", 500.0, 50.00),
            MonthSeed(2024, 5, "Mayo", 500.0, 45.00),
            MonthSeed(2024, 6, "Junio", 500.0, 52.00),
            MonthSeed(2024, 7, "Julio", 500.0, 78.00),
            MonthSeed(2024, 8, "Agosto", 500.0, 82.00),
            MonthSeed(2024, 9, "Septiembre", 500.0, 68.00),
            MonthSeed(2024, 10, "Octubre", 500.0, 72.00, ibi = 200.00),
            MonthSeed(2024, 11, "Noviembre", 500.0, 90.00, seguro = 205.00),
            MonthSeed(2024, 12, "Diciembre", 500.0, 98.00),
            MonthSeed(2025, 1, "Enero", 500.0, 65.00),
            MonthSeed(2025, 2, "Febrero", 500.0, 60.00),
            MonthSeed(2025, 3, "Marzo", 500.0, 58.00),
            MonthSeed(2025, 4, "Abril", 500.0, 52.00),
            MonthSeed(2025, 5, "Mayo", 500.0, 48.00),
            MonthSeed(2025, 6, "Junio", 500.0, 55.00),
            MonthSeed(2025, 7, "Julio", 500.0, 80.00),
            MonthSeed(2025, 8, "Agosto", 500.0, 85.00),
            MonthSeed(2025, 9, "Septiembre", 500.0, 70.00),
            MonthSeed(2025, 10, "Octubre", 500.0, 75.00, ibi = 205.00),
            MonthSeed(2025, 11, "Noviembre", 500.0, 92.00, seguro = 210.00),
            MonthSeed(2025, 12, "Diciembre", 500.0, 100.00),
            MonthSeed(2026, 1, "Enero", 500.0, 68.00),
            MonthSeed(2026, 2, "Febrero", 500.0, 62.00),
            MonthSeed(2026, 3, "Marzo", 500.0, 60.00),
            MonthSeed(2026, 4, "Abril", 500.0, 55.00),
            MonthSeed(2026, 5, "Mayo", 500.0, 50.00),
            MonthSeed(2026, 6, "Junio", 500.0, 58.00),
            MonthSeed(2026, 7, "Julio", 500.0, 82.00),
            MonthSeed(2026, 8, "Agosto", 500.0, 88.00),
            MonthSeed(2026, 9, "Septiembre", 500.0, 72.00)
        )

        var runningBalance = initialCapital
        var runningAccountBal = 0.0
        val result = mutableListOf<PaymentEntity>()

        historicalRaw.forEachIndexed { index, item ->
            val interest = calculateMonthlyInterest(runningBalance, rate)
            val principal = (totalBankFee - interest).coerceAtLeast(0.0)

            runningBalance = (runningBalance - (principal + item.extraAmort)).coerceAtLeast(0.0)

            val community = 81.0
            val totalMonthOutflow = co1Fee + community + item.luz + item.seguro + item.ibi + item.extra
            runningAccountBal += (item.lauraDeposit - totalMonthOutflow)

            result.add(
                PaymentEntity(
                    id = (index + 1).toLong(),
                    year = item.yr,
                    month = item.mo,
                    monthName = item.name,
                    totalFee = totalBankFee,
                    coOwner1Contribution = co1Fee,
                    coOwner2Contribution = co2Fee,
                    interestPaid = interest,
                    principalAmortized = principal,
                    extraAmortization = item.extraAmort,
                    interestRatePercent = rate,
                    remainingBalance = runningBalance,
                    communityExpense = community,
                    electricityExpense = item.luz,
                    insuranceExpense = item.seguro,
                    ibiExpense = item.ibi,
                    extraExpenses = item.extra,
                    coOwner1Deposit = item.lauraDeposit,
                    coOwner2Deposit = 0.0,
                    accountBalance = runningAccountBal,
                    notes = item.notes.ifBlank { "Cuota ordinaria" },
                    updatedAt = System.currentTimeMillis()
                )
            )
        }

        return result
    }

    val MONTH_NAMES = listOf(
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    )
}
