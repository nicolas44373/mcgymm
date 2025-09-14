import { useState, useEffect } from 'react'
import { supabase, Transaction } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [todaySummary, setTodaySummary] = useState({
    income: 0,
    expense: 0,
    balance: 0
  })

  // Obtener transacciones del día
  const fetchTodayTransactions = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const transactionData = data || []
      setTransactions(transactionData)
      
      // Calcular resumen del día
      const income = transactionData
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      const expense = transactionData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      setTodaySummary({
        income,
        expense,
        balance: income - expense
      })
      
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Error al cargar transacciones')
    } finally {
      setLoading(false)
    }
  }

  // Agregar transacción
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
    try {
      console.log('💰 AGREGANDO TRANSACCIÓN')
      console.log('📝 Datos recibidos:', transactionData)
      
      // Asegurar que tenemos los datos correctos
      const transactionToSave = {
        type: transactionData.type,
        amount: Number(transactionData.amount),
        concept: transactionData.concept,
        date: transactionData.date,
        time: transactionData.time
      }
      
      console.log('💾 Datos a guardar:', transactionToSave)
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionToSave])
        .select()

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw error
      }
      
      console.log('✅ Transacción guardada:', data)
      toast.success('Transacción registrada exitosamente')
      await fetchTodayTransactions()
    } catch (error) {
      console.error('❌ Error adding transaction:', error)
      toast.error('Error al registrar transacción: ' + (error as any).message)
    }
  }

  // Eliminar transacción
  const deleteTransaction = async (id: number) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast.success('Transacción eliminada')
      await fetchTodayTransactions()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast.error('Error al eliminar transacción')
    }
  }

  useEffect(() => {
    fetchTodayTransactions()
  }, [])

  return {
    transactions,
    loading,
    todaySummary,
    addTransaction,
    deleteTransaction,
    fetchTodayTransactions
  }
}