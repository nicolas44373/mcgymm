import { useState, useEffect } from 'react'
import { supabase, Member, membershipPrices } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { format, parseISO, addMonths, addYears } from 'date-fns'

export const useMembers = () => {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ FUNCIÓN CORREGIDA - Maneja fecha en local sin shift UTC
  const calculateExpiryDate = (startDate: string, membershipType: string): string => {
    console.log('🔥 CALCULANDO FECHA DE VENCIMIENTO')
    console.log('📅 Fecha de inicio:', startDate)
    console.log('📋 Tipo de membresía:', membershipType)

    // Parsear fecha correctamente sin UTC
    const start = parseISO(startDate)
    let expiry = new Date(start)

    switch (membershipType.toLowerCase()) {
      case 'mensual':
        expiry = addMonths(start, 1)
        console.log('➕ Agregando 1 mes')
        break
      case 'trimestral':
        expiry = addMonths(start, 3)
        console.log('➕ Agregando 3 meses')
        break
      case 'semestral':
        expiry = addMonths(start, 6)
        console.log('➕ Agregando 6 meses')
        break
      case 'anual':
        expiry = addYears(start, 1)
        console.log('➕ Agregando 1 año')
        break
      default:
        expiry = addMonths(start, 1)
        console.log('⚠️ Tipo no reconocido, usando mensual por defecto')
        break
    }

    const result = format(expiry, 'yyyy-MM-dd')
    console.log('✅ Fecha de vencimiento calculada:', result)
    console.log('=====================================')

    return result
  }

  // Obtener todos los miembros
  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Error al cargar miembros')
    } finally {
      setLoading(false)
    }
  }

  // Crear o actualizar miembro
  const saveMember = async (memberData: Omit<Member, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🚀 GUARDANDO MIEMBRO')
      console.log('📝 Datos recibidos:', memberData)

      const expiryDate = calculateExpiryDate(memberData.start_date, memberData.membership_type)

      const memberToSave = {
        dni: memberData.dni,
        name: memberData.name,
        phone: memberData.phone || null,
        membership_type: memberData.membership_type,
        start_date: memberData.start_date,
        expiry_date: expiryDate
      }

      console.log('💾 Datos a guardar en BD:', memberToSave)

      const { data: existingMember } = await supabase
        .from('members')
        .select('id')
        .eq('dni', memberData.dni)
        .single()

      if (existingMember) {
        console.log('✏️ Actualizando miembro existente')
        const { error } = await supabase
          .from('members')
          .update(memberToSave)
          .eq('dni', memberData.dni)

        if (error) throw error
        toast.success('Miembro actualizado exitosamente')
      } else {
        console.log('➕ Creando nuevo miembro')
        const { error } = await supabase
          .from('members')
          .insert([memberToSave])

        if (error) throw error

        await addTransaction({
          type: 'income',
          amount: membershipPrices[memberData.membership_type as keyof typeof membershipPrices],
          concept: `Membresía ${memberData.membership_type} - ${memberData.name}`,
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm')
        })

        toast.success('Miembro agregado exitosamente')
      }

      await fetchMembers()
    } catch (error) {
      console.error('❌ Error saving member:', error)
      toast.error('Error al guardar miembro')
    }
  }

  // Eliminar miembro
  const deleteMember = async (dni: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('dni', dni)

      if (error) throw error
      toast.success('Miembro eliminado')
      await fetchMembers()
    } catch (error) {
      console.error('Error deleting member:', error)
      toast.error('Error al eliminar miembro')
    }
  }

  // Renovar membresía
  const renewMembership = async (dni: string) => {
    try {
      const member = members.find((m: Member) => m.dni === dni)
      if (!member) return

      const today = format(new Date(), 'yyyy-MM-dd')

      console.log('🔄 RENOVANDO MEMBRESÍA')
      console.log('👤 Miembro:', member.name)
      console.log('📅 Fecha actual:', today)

      const expiryDate = calculateExpiryDate(today, member.membership_type)

      const { error } = await supabase
        .from('members')
        .update({
          start_date: today,
          expiry_date: expiryDate
        })
        .eq('dni', dni)

      if (error) throw error

      await addTransaction({
        type: 'income',
        amount: membershipPrices[member.membership_type as keyof typeof membershipPrices],
        concept: `Renovación ${member.membership_type} - ${member.name}`,
        date: today,
        time: format(new Date(), 'HH:mm')
      })

      toast.success('Membresía renovada exitosamente')
      await fetchMembers()
    } catch (error) {
      console.error('Error renewing membership:', error)
      toast.error('Error al renovar membresía')
    }
  }

  // Agregar transacción
  const addTransaction = async (transactionData: {
    type: 'income' | 'expense'
    amount: number
    concept: string
    date: string
    time: string
  }) => {
    try {
      await supabase.from('transactions').insert([transactionData])
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  return {
    members,
    loading,
    saveMember,
    deleteMember,
    renewMembership,
    fetchMembers
  }
}
