package com.example.data.repository

import com.example.data.domain.MortgageCalculator
import com.example.data.local.LoanSettingsEntity
import com.example.data.local.MortgageDao
import com.example.data.local.PaymentEntity
import com.example.data.remote.FirestoreSyncManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch

class MortgageRepository(
    private val mortgageDao: MortgageDao,
    private val firestoreSyncManager: FirestoreSyncManager,
    private val externalScope: CoroutineScope = CoroutineScope(Dispatchers.IO)
) {

    val paymentsFlow: Flow<List<PaymentEntity>> = mortgageDao.getAllPayments()
    val settingsFlow: Flow<LoanSettingsEntity?> = mortgageDao.getSettingsFlow()

    suspend fun initializeDefaultDataIfNeeded() {
        val currentSettings = mortgageDao.getSettings()
        val defaultSettings = currentSettings ?: LoanSettingsEntity()

        if (currentSettings == null) {
            mortgageDao.saveSettings(defaultSettings)
        }

        val existingPayments = mortgageDao.getAllPaymentsList()
        if (existingPayments.isEmpty()) {
            val initialPayments = MortgageCalculator.getInitialSeedPayments(defaultSettings)
            mortgageDao.insertPayments(initialPayments)

            // Trigger initial Firestore sync in background
            externalScope.launch {
                firestoreSyncManager.syncSettingsToFirestore(defaultSettings)
                firestoreSyncManager.syncPaymentsToFirestore(
                    defaultSettings.sharedSyncCode,
                    initialPayments
                )
            }
        }
    }

    suspend fun addPayment(payment: PaymentEntity) {
        val settings = mortgageDao.getSettings() ?: LoanSettingsEntity()
        val insertedId = mortgageDao.insertPayment(payment)
        val allPayments = mortgageDao.getAllPaymentsList()

        // Recalculate balances for all payments to maintain accurate amortization chain
        val updatedList = MortgageCalculator.recalculateBalances(allPayments, settings.initialCapital)
        mortgageDao.insertPayments(updatedList)

        // Background sync to Firestore
        externalScope.launch {
            firestoreSyncManager.syncPaymentsToFirestore(settings.sharedSyncCode, updatedList)
        }
    }

    suspend fun updatePayment(payment: PaymentEntity) {
        val settings = mortgageDao.getSettings() ?: LoanSettingsEntity()
        mortgageDao.updatePayment(payment)
        val allPayments = mortgageDao.getAllPaymentsList()

        val updatedList = MortgageCalculator.recalculateBalances(allPayments, settings.initialCapital)
        mortgageDao.insertPayments(updatedList)

        externalScope.launch {
            firestoreSyncManager.syncPaymentsToFirestore(settings.sharedSyncCode, updatedList)
        }
    }

    suspend fun deletePayment(paymentId: Long) {
        val settings = mortgageDao.getSettings() ?: LoanSettingsEntity()
        mortgageDao.deletePaymentById(paymentId)
        val allPayments = mortgageDao.getAllPaymentsList()

        val updatedList = MortgageCalculator.recalculateBalances(allPayments, settings.initialCapital)
        mortgageDao.insertPayments(updatedList)

        externalScope.launch {
            firestoreSyncManager.syncPaymentsToFirestore(settings.sharedSyncCode, updatedList)
        }
    }

    suspend fun saveSettings(settings: LoanSettingsEntity) {
        mortgageDao.saveSettings(settings)
        val allPayments = mortgageDao.getAllPaymentsList()
        val updatedList = MortgageCalculator.recalculateBalances(allPayments, settings.initialCapital)
        mortgageDao.insertPayments(updatedList)

        externalScope.launch {
            firestoreSyncManager.syncSettingsToFirestore(settings)
            firestoreSyncManager.syncPaymentsToFirestore(settings.sharedSyncCode, updatedList)
        }
    }

    suspend fun syncFromRemote(syncCode: String) {
        if (syncCode.isBlank()) return
        val remoteFlow = firestoreSyncManager.listenToRemotePayments(syncCode)
        val remotePayments = remoteFlow.firstOrNull()
        if (!remotePayments.isNullOrEmpty()) {
            mortgageDao.deleteAllPayments()
            mortgageDao.insertPayments(remotePayments)
        }
    }
}
