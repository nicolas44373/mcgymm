'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { format, parseISO, addDays } from 'date-fns'

// Use the Member interface from supabase
import type { Member } from '@/lib/supabase'

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [membershipTypes, setMembershipTypes] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    await Promise.all([
      fetchMembers(),
      loadMembershipTypes()
    ])
  }

  const fetchMembers = async () => {
    try {
      setLoading(true)
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

  const loadMembershipTypes = async () => {
    try {
      // Intentar cargar desde Supabase primero
      const { data, error } = await supabase
        .from('membership_types')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (error) {
        console.log('Tabla membership_types no existe, usando datos por defecto')
        // Si la tabla no existe, usar datos por defecto con IDs compatibles
        setMembershipTypes([
          { id: 'mensual', name: 'Mensual', duration: '1 mes', duration_days: 30, price: 15000, has_personal_trainer: false },
          { id: 'trimestral', name: 'Trimestral', duration: '3 meses', duration_days: 90, price: 40000, has_personal_trainer: false },
          { id: 'semestral', name: 'Semestral', duration: '6 meses', duration_days: 180, price: 75000, has_personal_trainer: false },
          { id: 'anual', name: 'Anual', duration: '12 meses', duration_days: 365, price: 140000, has_personal_trainer: false }
        ])
      } else {
        // Mapear los datos de Supabase a valores compatibles con la tabla members
        const mappedTypes = data.map(type => {
          // Crear un ID compatible basado en el nombre o usar un mapeo
          let compatibleId = type.name.toLowerCase()
          
          // Mapear nombres a IDs aceptados por la tabla members
          const nameToId: { [key: string]: string } = {
            'mensual': 'mensual',
            'mensual + entrenador': 'mensual',
            'trimestral': 'trimestral', 
            'trimestral + entrenador': 'trimestral',
            'semestral': 'semestral',
            'semestral + entrenador': 'semestral',
            'anual': 'anual',
            'anual + entrenador': 'anual'
          }
          
          compatibleId = nameToId[type.name.toLowerCase()] || 'mensual'
          
          return {
            ...type,
            compatibleId, // ID que acepta la tabla members
            originalId: type.id // ID original de UUID
          }
        })
        
        setMembershipTypes(mappedTypes)
      }
    } catch (error) {
      console.error('Error loading membership types:', error)
      // Fallback a datos por defecto
      setMembershipTypes([
        { id: 'mensual', name: 'Mensual', duration: '1 mes', duration_days: 30, price: 15000, has_personal_trainer: false },
        { id: 'trimestral', name: 'Trimestral', duration: '3 meses', duration_days: 90, price: 40000, has_personal_trainer: false },
        { id: 'semestral', name: 'Semestral', duration: '6 meses', duration_days: 180, price: 75000, has_personal_trainer: false },
        { id: 'anual', name: 'Anual', duration: '12 meses', duration_days: 365, price: 140000, has_personal_trainer: false }
      ])
    }
  }

  // Función para mapear UUID de admin panel a valor compatible con members table
  const mapToCompatibleMembershipType = (membershipTypeId: string): string => {
    // Si ya es un valor compatible, devolverlo tal como está
    const validValues = ['mensual', 'trimestral', 'semestral', 'anual']
    if (validValues.includes(membershipTypeId.toLowerCase())) {
      return membershipTypeId.toLowerCase()
    }
    
    // Buscar por UUID y obtener el ID compatible
    const membershipType = membershipTypes.find(type => type.originalId === membershipTypeId || type.id === membershipTypeId)
    if (membershipType && membershipType.compatibleId) {
      return membershipType.compatibleId
    }
    
    // Fallback por nombre
    const membershipByName = membershipTypes.find(type => type.name.toLowerCase().includes(membershipTypeId.toLowerCase()))
    if (membershipByName && membershipByName.compatibleId) {
      return membershipByName.compatibleId
    }
    
    // Fallback final
    return 'mensual'
  }

  // Función para calcular fecha de vencimiento
  const calculateExpiryDate = (startDate: string, membershipTypeId: string): string => {
    try {
      console.log('🔥 CALCULANDO FECHA DE VENCIMIENTO')
      console.log('📅 Fecha de inicio:', startDate)
      console.log('📋 Tipo de membresía ID:', membershipTypeId)

      // Buscar el tipo de membresía (puede ser UUID o valor legacy)
      let membershipType = membershipTypes.find(type => 
        type.id === membershipTypeId || 
        type.originalId === membershipTypeId ||
        type.compatibleId === membershipTypeId
      )
      
      // Si no se encuentra, usar valores por defecto basados en el ID
      if (!membershipType) {
        console.log('⚠️ Tipo de membresía no encontrado, usando valores por defecto')
        const defaultDurations: { [key: string]: number } = {
          'mensual': 30,
          'trimestral': 90,
          'semestral': 180,
          'anual': 365
        }
        
        const compatibleId = mapToCompatibleMembershipType(membershipTypeId)
        const days = defaultDurations[compatibleId] || 30
        const start = parseISO(startDate)
        const expiry = addDays(start, days)
        const result = format(expiry, 'yyyy-MM-dd')
        
        console.log(`➕ Agregando ${days} días (por defecto para ${compatibleId})`)
        console.log('✅ Fecha de vencimiento calculada:', result)
        return result
      }

      // Usar los días del tipo de membresía encontrado
      const start = parseISO(startDate)
      const expiry = addDays(start, membershipType.duration_days)
      const result = format(expiry, 'yyyy-MM-dd')

      console.log(`➕ Agregando ${membershipType.duration_days} días (${membershipType.name})`)
      console.log('✅ Fecha de vencimiento calculada:', result)
      console.log('=====================================')

      return result
    } catch (error) {
      console.error('Error calculating expiry date:', error)
      // Fallback: agregar 30 días
      const start = parseISO(startDate)
      const expiry = addDays(start, 30)
      return format(expiry, 'yyyy-MM-dd')
    }
  }

  // Función para obtener el precio de una membresía
  const getMembershipPrice = (membershipTypeId: string): number => {
    const membershipType = membershipTypes.find(type => 
      type.id === membershipTypeId || 
      type.originalId === membershipTypeId ||
      type.compatibleId === membershipTypeId
    )
    
    if (membershipType) {
      return membershipType.price
    }

    // Precios por defecto si no se encuentra el tipo
    const defaultPrices: { [key: string]: number } = {
      'mensual': 15000,
      'trimestral': 40000,
      'semestral': 75000,
      'anual': 140000
    }

    const compatibleId = mapToCompatibleMembershipType(membershipTypeId)
    return defaultPrices[compatibleId] || 15000
  }

  // Crear o actualizar miembro
  const saveMember = async (memberData: Omit<Member, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🚀 GUARDANDO MIEMBRO')
      console.log('📝 Datos recibidos:', memberData)

      // Validar datos requeridos
      if (!memberData.dni) {
        throw new Error('DNI es requerido')
      }
      if (!memberData.name) {
        throw new Error('Nombre es requerido')
      }
      if (!memberData.membership_type) {
        throw new Error('Tipo de membresía es requerido')
      }
      if (!memberData.start_date) {
        throw new Error('Fecha de inicio es requerida')
      }

      // Mapear el tipo de membresía a un valor compatible con la tabla
      const compatibleMembershipType = mapToCompatibleMembershipType(memberData.membership_type)
      console.log('🔄 Mapeando membership_type:', memberData.membership_type, '→', compatibleMembershipType)

      const expiryDate = calculateExpiryDate(memberData.start_date, memberData.membership_type)

      const memberToSave = {
        dni: memberData.dni.trim(),
        name: memberData.name.trim(),
        phone: memberData.phone?.trim() || null,
        membership_type: compatibleMembershipType, // Usar valor compatible
        start_date: memberData.start_date,
        expiry_date: expiryDate
      }

      console.log('💾 Datos a guardar en BD:', memberToSave)

      // Verificar si el miembro ya existe
      const { data: existingMember, error: selectError } = await supabase
        .from('members')
        .select('id')
        .eq('dni', memberData.dni)
        .maybeSingle()

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116 significa "no rows found", que es esperado para nuevos miembros
        throw selectError
      }

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

        // Agregar transacción si existe la tabla
        try {
          const membershipPrice = getMembershipPrice(memberData.membership_type)
          const membershipName = membershipTypes.find(type => 
            type.id === memberData.membership_type || 
            type.originalId === memberData.membership_type
          )?.name || memberData.membership_type

          await addTransaction({
            type: 'income',
            amount: membershipPrice,
            concept: `Membresía ${membershipName} - ${memberData.name}`,
            date: format(new Date(), 'yyyy-MM-dd'),
            time: format(new Date(), 'HH:mm')
          })
        } catch (transactionError) {
          console.log('No se pudo agregar transacción (tabla no existe):', transactionError)
          // No es un error crítico si la tabla de transacciones no existe
        }

        toast.success('Miembro agregado exitosamente')
      }

      await fetchMembers()
    } catch (error) {
      console.error('❌ Error saving member:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error al guardar miembro: ${errorMessage}`)
      throw error
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

      // Agregar transacción de renovación si existe la tabla
      try {
        const membershipPrice = getMembershipPrice(member.membership_type)
        const membershipName = membershipTypes.find(type => type.compatibleId === member.membership_type)?.name || member.membership_type

        await addTransaction({
          type: 'income',
          amount: membershipPrice,
          concept: `Renovación ${membershipName} - ${member.name}`,
          date: today,
          time: format(new Date(), 'HH:mm')
        })
      } catch (transactionError) {
        console.log('No se pudo agregar transacción de renovación:', transactionError)
      }

      toast.success('Membresía renovada exitosamente')
      await fetchMembers()
    } catch (error) {
      console.error('Error renewing membership:', error)
      toast.error('Error al renovar membresía')
    }
  }

  // Agregar transacción (opcional)
  const addTransaction = async (transactionData: {
    type: 'income' | 'expense'
    amount: number
    concept: string
    date: string
    time: string
  }) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([transactionData])
      
      if (error) throw error
    } catch (error) {
      // No es crítico si falla
      console.log('Error adding transaction (table may not exist):', error)
    }
  }

  return {
    members,
    loading,
    membershipTypes, // Exportar también los tipos de membresía
    saveMember,
    deleteMember,
    renewMembership,
    fetchMembers,
    loadMembershipTypes
  }
}