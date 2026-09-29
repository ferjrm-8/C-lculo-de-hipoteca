package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.domain.MortgageCalculator
import com.example.data.local.LoanSettingsEntity
import com.example.data.local.PaymentEntity
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

    @Test
    fun `read string from context matches Hipoteca Conjunta`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val appName = context.getString(R.string.app_name)
        assertEquals("Hipoteca Conjunta", appName)
    }

    @Test
    fun `test french amortization monthly fee calculation`() {
        val principal = 121766.32
        val rate = 1.85
        val months = 300
        val fee = MortgageCalculator.calculateMonthlyFee(principal, rate, months)
        // French formula fee should be approximately 508 - 514 €
        assertTrue("Monthly fee should be positive and realistic", fee in 500.0..520.0)
    }

    @Test
    fun `test extra amortization simulator reduces interest and term`() {
        val currentBalance = 100000.0
        val rate = 2.0
        val remainingMonths = 240
        val extraAmount = 10000.0

        val (reduceTerm, reduceFee) = MortgageCalculator.simulateExtraAmortization(
            currentBalance, rate, remainingMonths, extraAmount
        )

        assertTrue("Interest saved in term reduction should be > 0", reduceTerm.interestSaved > 0)
        assertTrue("Months saved in term reduction should be > 0", reduceTerm.monthsSaved > 0)
        assertTrue("Fee reduction monthly should be > 0", reduceFee.feeReductionMonthly > 0)
    }

    @Test
    fun `test recalculate balances maintains consistent chain`() {
        val settings = LoanSettingsEntity(initialCapital = 10000.0)
        val p1 = PaymentEntity(
            id = 1, year = 2020, month = 11, monthName = "Noviembre",
            totalFee = 500.0, coOwner1Contribution = 250.0, coOwner2Contribution = 250.0,
            interestPaid = 50.0, principalAmortized = 450.0, extraAmortization = 0.0
        )
        val p2 = PaymentEntity(
            id = 2, year = 2020, month = 12, monthName = "Diciembre",
            totalFee = 500.0, coOwner1Contribution = 250.0, coOwner2Contribution = 250.0,
            interestPaid = 45.0, principalAmortized = 455.0, extraAmortization = 1000.0
        )

        val recalculated = MortgageCalculator.recalculateBalances(listOf(p1, p2), settings.initialCapital)
        assertEquals(9550.0, recalculated[0].remainingBalance, 0.01)
        assertEquals(8095.0, recalculated[1].remainingBalance, 0.01)
    }
}
