package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.AppDatabase
import com.example.data.local.LoanSettingsEntity
import com.example.data.local.PaymentEntity
import com.example.data.remote.FirestoreSyncManager
import com.example.data.repository.MortgageRepository
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class MortgageViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getInstance(application)
    private val firestoreSyncManager = FirestoreSyncManager()
    private val repository = MortgageRepository(db.mortgageDao(), firestoreSyncManager, viewModelScope)

    val paymentsFlow: StateFlow<List<PaymentEntity>> = repository.paymentsFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val settingsFlow: StateFlow<LoanSettingsEntity> = repository.settingsFlow
        .map { it ?: LoanSettingsEntity() }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), LoanSettingsEntity())

    private val _toastEvent = MutableSharedFlow<String>()
    val toastEvent: SharedFlow<String> = _toastEvent.asSharedFlow()

    init {
        viewModelScope.launch {
            repository.initializeDefaultDataIfNeeded()
        }
    }

    fun addPayment(payment: PaymentEntity) {
        viewModelScope.launch {
            repository.addPayment(payment)
            _toastEvent.emit("Pago registrado correctamente")
        }
    }

    fun updatePayment(payment: PaymentEntity) {
        viewModelScope.launch {
            repository.updatePayment(payment)
            _toastEvent.emit("Pago actualizado correctamente")
        }
    }

    fun deletePayment(paymentId: Long) {
        viewModelScope.launch {
            repository.deletePayment(paymentId)
            _toastEvent.emit("Pago eliminado")
        }
    }

    fun saveSettings(settings: LoanSettingsEntity) {
        viewModelScope.launch {
            repository.saveSettings(settings)
            _toastEvent.emit("Ajustes de hipoteca guardados")
        }
    }

    fun resetToExcelSeedData() {
        viewModelScope.launch {
            val currentSettings = settingsFlow.value
            db.mortgageDao().deleteAllPayments()
            val initialPayments = com.example.data.domain.MortgageCalculator.getInitialSeedPayments(currentSettings)
            db.mortgageDao().insertPayments(initialPayments)
            _toastEvent.emit("Datos históricos restablecidos con éxito")
        }
    }
}
