package com.example.data.remote

import android.util.Log
import com.example.data.local.LoanSettingsEntity
import com.example.data.local.PaymentEntity
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class FirestoreSyncManager {

    private val db: FirebaseFirestore? by lazy {
        try {
            FirebaseFirestore.getInstance()
        } catch (e: Throwable) {
            Log.e("FirestoreSync", "Firebase instance not available: ${e.message}")
            null
        }
    }

    private var paymentsListener: ListenerRegistration? = null

    /**
     * Sanitizes map values for Firestore insertion (prevents undefined / NaN / Infinite)
     */
    private fun sanitizeMap(map: Map<String, Any?>): Map<String, Any> {
        val clean = mutableMapOf<String, Any>()
        map.forEach { (key, value) ->
            if (value != null) {
                when (value) {
                    is Double -> if (!value.isNaN() && !value.isInfinite()) clean[key] = value else clean[key] = 0.0
                    is Float -> if (!value.isNaN() && !value.isInfinite()) clean[key] = value else clean[key] = 0.0f
                    else -> clean[key] = value
                }
            } else {
                clean[key] = ""
            }
        }
        return clean
    }

    /**
     * Uploads payments list to Firestore
     */
    suspend fun syncPaymentsToFirestore(
        syncCode: String,
        payments: List<PaymentEntity>
    ): Boolean {
        val firestore = db ?: return false
        if (syncCode.isBlank()) return false

        return try {
            val batch = firestore.batch()
            val collectionRef = firestore.collection("mortgages")
                .document(syncCode.trim())
                .collection("payments")

            payments.forEach { payment ->
                val docRef = collectionRef.document(payment.id.toString())
                val rawData = mapOf(
                    "id" to payment.id,
                    "year" to payment.year,
                    "month" to payment.month,
                    "monthName" to payment.monthName,
                    "totalFee" to payment.totalFee,
                    "coOwner1Contribution" to payment.coOwner1Contribution,
                    "coOwner2Contribution" to payment.coOwner2Contribution,
                    "interestPaid" to payment.interestPaid,
                    "principalAmortized" to payment.principalAmortized,
                    "extraAmortization" to payment.extraAmortization,
                    "interestRatePercent" to payment.interestRatePercent,
                    "remainingBalance" to payment.remainingBalance,
                    "communityExpense" to payment.communityExpense,
                    "electricityExpense" to payment.electricityExpense,
                    "insuranceExpense" to payment.insuranceExpense,
                    "ibiExpense" to payment.ibiExpense,
                    "extraExpenses" to payment.extraExpenses,
                    "coOwner1Deposit" to payment.coOwner1Deposit,
                    "coOwner2Deposit" to payment.coOwner2Deposit,
                    "accountBalance" to payment.accountBalance,
                    "notes" to payment.notes,
                    "updatedAt" to payment.updatedAt
                )
                batch.set(docRef, sanitizeMap(rawData))
            }
            batch.commit().await()
            true
        } catch (e: Throwable) {
            Log.e("FirestoreSync", "Failed syncPaymentsToFirestore: ${e.message}")
            false
        }
    }

    /**
     * Uploads loan settings to Firestore
     */
    suspend fun syncSettingsToFirestore(
        settings: LoanSettingsEntity
    ): Boolean {
        val firestore = db ?: return false
        val syncCode = settings.sharedSyncCode.trim()
        if (syncCode.isBlank()) return false

        return try {
            val docRef = firestore.collection("mortgages")
                .document(syncCode)
                .collection("settings")
                .document("main")

            val rawData = mapOf(
                "id" to settings.id,
                "initialCapital" to settings.initialCapital,
                "totalTermMonths" to settings.totalTermMonths,
                "annualInterestRate" to settings.annualInterestRate,
                "euriborRate" to settings.euriborRate,
                "differentialRate" to settings.differentialRate,
                "isVariableInterest" to settings.isVariableInterest,
                "startDateYear" to settings.startDateYear,
                "startDateMonth" to settings.startDateMonth,
                "coOwner1Name" to settings.coOwner1Name,
                "coOwner2Name" to settings.coOwner2Name,
                "coOwner1Percentage" to settings.coOwner1Percentage,
                "coOwner2Percentage" to settings.coOwner2Percentage,
                "propertyValuation" to settings.propertyValuation,
                "pisoValuation" to settings.pisoValuation,
                "casaValuation" to settings.casaValuation,
                "internalDebtRak" to settings.internalDebtRak,
                "internalDebtLaura" to settings.internalDebtLaura,
                "sharedSyncCode" to settings.sharedSyncCode,
                "updatedAt" to settings.updatedAt
            )

            docRef.set(sanitizeMap(rawData)).await()
            true
        } catch (e: Throwable) {
            Log.e("FirestoreSync", "Failed syncSettingsToFirestore: ${e.message}")
            false
        }
    }

    /**
     * Listens for remote payments updates in Firestore
     */
    fun listenToRemotePayments(syncCode: String): Flow<List<PaymentEntity>> = callbackFlow {
        val firestore = db
        if (firestore == null || syncCode.isBlank()) {
            trySend(emptyList())
            close()
            return@callbackFlow
        }

        val registration = firestore.collection("mortgages")
            .document(syncCode.trim())
            .collection("payments")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.e("FirestoreSync", "Error listening to remote payments: ${error.message}")
                    return@addSnapshotListener
                }

                if (snapshot != null && !snapshot.isEmpty) {
                    val payments = snapshot.documents.mapNotNull { doc ->
                        try {
                            PaymentEntity(
                                id = doc.getLong("id") ?: doc.id.toLongOrNull() ?: 0L,
                                year = (doc.getLong("year") ?: 2020L).toInt(),
                                month = (doc.getLong("month") ?: 1L).toInt(),
                                monthName = doc.getString("monthName") ?: "",
                                totalFee = doc.getDouble("totalFee") ?: 0.0,
                                coOwner1Contribution = doc.getDouble("coOwner1Contribution") ?: 0.0,
                                coOwner2Contribution = doc.getDouble("coOwner2Contribution") ?: 0.0,
                                interestPaid = doc.getDouble("interestPaid") ?: 0.0,
                                principalAmortized = doc.getDouble("principalAmortized") ?: 0.0,
                                extraAmortization = doc.getDouble("extraAmortization") ?: 0.0,
                                interestRatePercent = doc.getDouble("interestRatePercent") ?: 1.85,
                                remainingBalance = doc.getDouble("remainingBalance") ?: 0.0,
                                communityExpense = doc.getDouble("communityExpense") ?: 81.0,
                                electricityExpense = doc.getDouble("electricityExpense") ?: 0.0,
                                insuranceExpense = doc.getDouble("insuranceExpense") ?: 0.0,
                                ibiExpense = doc.getDouble("ibiExpense") ?: 0.0,
                                extraExpenses = doc.getDouble("extraExpenses") ?: 0.0,
                                coOwner1Deposit = doc.getDouble("coOwner1Deposit") ?: 0.0,
                                coOwner2Deposit = doc.getDouble("coOwner2Deposit") ?: 0.0,
                                accountBalance = doc.getDouble("accountBalance") ?: 0.0,
                                notes = doc.getString("notes") ?: "",
                                updatedAt = doc.getLong("updatedAt") ?: System.currentTimeMillis()
                            )
                        } catch (e: Exception) {
                            null
                        }
                    }
                    trySend(payments)
                }
            }

        awaitClose {
            registration.remove()
        }
    }
}
