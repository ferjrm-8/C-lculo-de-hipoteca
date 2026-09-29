package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface MortgageDao {

    @Query("SELECT * FROM mortgage_payments ORDER BY year ASC, month ASC")
    fun getAllPayments(): Flow<List<PaymentEntity>>

    @Query("SELECT * FROM mortgage_payments ORDER BY year ASC, month ASC")
    suspend fun getAllPaymentsList(): List<PaymentEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPayment(payment: PaymentEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPayments(payments: List<PaymentEntity>)

    @Update
    suspend fun updatePayment(payment: PaymentEntity)

    @Query("DELETE FROM mortgage_payments WHERE id = :id")
    suspend fun deletePaymentById(id: Long)

    @Query("DELETE FROM mortgage_payments")
    suspend fun deleteAllPayments()

    @Query("SELECT * FROM loan_settings WHERE id = 1")
    fun getSettingsFlow(): Flow<LoanSettingsEntity?>

    @Query("SELECT * FROM loan_settings WHERE id = 1")
    suspend fun getSettings(): LoanSettingsEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveSettings(settings: LoanSettingsEntity)
}
