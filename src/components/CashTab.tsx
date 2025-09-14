'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTransactions } from '@/hooks/useTransactions'
import { Transaction } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus, Trash2, Calendar, Filter, BarChart3 } from 'lucide-react'

type TransactionFormData = Omit<Transaction, 'id' | 'created_at' | 'date' | 'time'>

// Función para obtener la fecha local en formato YYYY-MM-DD
const getTodayLocal = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getCurrentMonthRange = () => {
  const today = new Date()
  const start = startOfMonth(today)
  const end = endOfMonth(today)
  
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd')
  }
}

export default function CashTab() {
  const { transactions, loading, todaySummary, addTransaction, deleteTransaction } = useTransactions()
  const [viewMode, setViewMode] = useState<'today' | 'monthly'>('today')
  const [dateRange, setDateRange] = useState(getCurrentMonthRange())
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TransactionFormData>({
    defaultValues: {
      type: 'income'
    }
  })

  // Filtrar transacciones según el modo de vista y filtros
  const getFilteredTransactions = () => {
    let filtered = transactions

    if (viewMode === 'today') {
      const today = getTodayLocal()
      filtered = transactions.filter(t => t.date === today)
    } else {
      // Filtrado por rango de fechas
      const startDate = new Date(dateRange.start + 'T00:00:00')
      const endDate = new Date(dateRange.end + 'T23:59:59')
      
      filtered = transactions.filter(t => {
        const transactionDate = new Date(t.date + 'T00:00:00')
        return isWithinInterval(transactionDate, { start: startDate, end: endDate })
      })
    }

    // Filtrar por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter)
    }

    return filtered.sort((a, b) => {
      // Ordenar por fecha y hora (más recientes primero)
      const dateComparison = b.date.localeCompare(a.date)
      if (dateComparison !== 0) return dateComparison
      return b.time.localeCompare(a.time)
    })
  }

  // Calcular resumen para el período seleccionado
  const getPeriodSummary = () => {
    const filtered = getFilteredTransactions()
    
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const expense = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    return {
      income,
      expense,
      balance: income - expense,
      totalTransactions: filtered.length
    }
  }

  const filteredTransactions = getFilteredTransactions()
  const periodSummary = getPeriodSummary()

  const onSubmit = async (data: TransactionFormData) => {
    const transactionData: Omit<Transaction, 'id' | 'created_at'> = {
      ...data,
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm')
    }
    
    await addTransaction(transactionData)
    reset({ type: 'income', amount: 0, concept: '' })
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta transacción?')) {
      await deleteTransaction(id)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return format(date, 'dd/MM/yyyy', { locale: es })
  }

  const resetToCurrentMonth = () => {
    setDateRange(getCurrentMonthRange())
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Caja Chica</h2>
      
      {/* Controles de vista y filtros */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Modo de vista */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Vista:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('today')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'today' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'monthly' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Por Período
              </button>
            </div>
          </div>

          {/* Filtros de fecha (solo para vista mensual) */}
          {viewMode === 'monthly' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Desde:</span>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Hasta:</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500"
                />
              </div>
              <button
                onClick={resetToCurrentMonth}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Mes Actual
              </button>
            </div>
          )}

          {/* Filtro por tipo */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Tipo:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Egresos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen de caja */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <TrendingUp size={24} />
                Ingresos
              </h3>
              <div className="text-2xl font-bold">{formatCurrency(viewMode === 'today' ? todaySummary.income : periodSummary.income)}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <TrendingDown size={24} />
                Egresos
              </h3>
              <div className="text-2xl font-bold">{formatCurrency(viewMode === 'today' ? todaySummary.expense : periodSummary.expense)}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Wallet size={24} />
                Balance
              </h3>
              <div className="text-2xl font-bold">{formatCurrency(viewMode === 'today' ? todaySummary.balance : periodSummary.balance)}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BarChart3 size={24} />
                Transacciones
              </h3>
              <div className="text-2xl font-bold">{periodSummary.totalTransactions}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario para registrar transacción */}
      <div className="bg-gray-50 p-8 rounded-xl mb-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-700 flex items-center gap-2">
          <Plus size={24} />
          Registrar Transacción
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo:</label>
              <select
                {...register('type', { required: 'Seleccione un tipo' })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              >
                <option value="income">💵 Ingreso</option>
                <option value="expense">💸 Egreso</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Monto:</label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { 
                  required: 'Monto es requerido',
                  min: { value: 0.01, message: 'El monto debe ser mayor a 0' }
                })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Concepto:</label>
              <input
                {...register('concept', { required: 'Concepto es requerido' })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="Descripción de la transacción"
              />
              {errors.concept && (
                <p className="text-red-500 text-sm mt-1">{errors.concept.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50"
          >
            <DollarSign size={20} />
            {isSubmitting ? 'Registrando...' : 'Registrar Transacción'}
          </button>
        </form>
      </div>

      {/* Tabla de transacciones */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              {viewMode === 'today' ? 'Transacciones de Hoy' : `Transacciones del ${formatDateForDisplay(dateRange.start)} al ${formatDateForDisplay(dateRange.end)}`}
            </h3>
            {filteredTransactions.length > 0 && (
              <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                {filteredTransactions.length} transacción{filteredTransactions.length !== 1 ? 'es' : ''}
              </span>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <tr>
                {viewMode === 'monthly' && <th className="px-6 py-4 text-left font-semibold">Fecha</th>}
                <th className="px-6 py-4 text-left font-semibold">Hora</th>
                <th className="px-6 py-4 text-left font-semibold">Tipo</th>
                <th className="px-6 py-4 text-left font-semibold">Monto</th>
                <th className="px-6 py-4 text-left font-semibold">Concepto</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50 transition-colors">
                    {viewMode === 'monthly' && (
                      <td className="px-6 py-4 font-medium">{formatDateForDisplay(transaction.date)}</td>
                    )}
                    <td className="px-6 py-4 font-medium">{transaction.time}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'income' ? (
                          <>
                            <TrendingUp size={14} />
                            Ingreso
                          </>
                        ) : (
                          <>
                            <TrendingDown size={14} />
                            Egreso
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(Number(transaction.amount))}
                      </span>
                    </td>
                    <td className="px-6 py-4">{transaction.concept}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => transaction.id && handleDelete(transaction.id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={viewMode === 'monthly' ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <DollarSign size={48} className="text-gray-300" />
                      <p className="text-lg">No hay transacciones para mostrar</p>
                      <p className="text-sm">
                        {typeFilter !== 'all' 
                          ? `No hay ${typeFilter === 'income' ? 'ingresos' : 'egresos'} en el período seleccionado`
                          : 'Las transacciones aparecerán aquí cuando las registres'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}