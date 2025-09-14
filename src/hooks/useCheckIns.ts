import { useState, useEffect } from 'react'
import { supabase, CheckIn, Member } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { format, differenceInDays } from 'date-fns'

// Función para obtener la fecha local en formato YYYY-MM-DD
const getTodayLocal = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Función para crear una fecha local desde un string YYYY-MM-DD
const createLocalDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day) // month - 1 porque los meses en JS van de 0-11
}

export const useCheckIns = () => {
  const [checkins, setCheckins] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(false)

  // Obtener check-ins del día
  const fetchTodayCheckins = async () => {
    try {
      const today = getTodayLocal()
      
      console.log('Buscando check-ins del día:', today)
      
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .gte('check_in_time', `${today}T00:00:00`)
        .lte('check_in_time', `${today}T23:59:59`)
        .order('check_in_time', { ascending: false })

      if (error) {
        console.error('Error en fetchTodayCheckins:', error)
        throw error
      }
      
      console.log('Check-ins encontrados:', data?.length || 0)
      setCheckins(data || [])
    } catch (error) {
      console.error('Error fetching checkins:', error)
      toast.error('Error al cargar historial de check-ins')
    }
  }

  // Buscar miembro y hacer check-in
  const checkInMember = async (dni: string) => {
    if (!dni.trim()) {
      toast.error('Ingrese un DNI válido')
      return null
    }

    setLoading(true)
    
    try {
      console.log('Buscando miembro con DNI:', dni)
      
      // Buscar miembro por DNI (sin .single() para evitar errores)
      const { data: allMembers, error: searchError } = await supabase
        .from('members')
        .select('*')
        .eq('dni', dni.trim())

      console.log('Resultado de búsqueda:', { 
        encontrados: allMembers?.length || 0, 
        error: searchError 
      })

      if (searchError) {
        console.error('Error en búsqueda:', searchError)
        toast.error('Error al buscar cliente')
        return null
      }

      if (!allMembers || allMembers.length === 0) {
        console.log('No se encontraron miembros con DNI:', dni)
        toast.error('Cliente no encontrado')
        return null
      }

      if (allMembers.length > 1) {
        console.warn('Múltiples miembros con el mismo DNI:', allMembers.length)
      }

      const memberData = allMembers[0]
      console.log('Miembro encontrado:', memberData.name)

      const member: Member = memberData
      
      // Usar fechas locales para el cálculo de días
      const today = createLocalDate(getTodayLocal())
      const expiryDate = createLocalDate(member.expiry_date)
      const daysUntilExpiry = differenceInDays(expiryDate, today)
      
      console.log('Comparación de fechas:')
      console.log('  - Hoy (local):', getTodayLocal())
      console.log('  - Vence:', member.expiry_date)
      console.log('  - Días hasta vencimiento:', daysUntilExpiry)
      
      // Determinar estado de la membresía
      let status = 'active'
      let statusText = 'Activa' // Sin emojis para la base de datos
      let displayStatusText = 'Activa' // Para mostrar al usuario

      if (daysUntilExpiry < 0) {
        status = 'expired'
        statusText = 'Vencida'
        displayStatusText = 'Vencida'
        toast.error(`Membresía vencida hace ${Math.abs(daysUntilExpiry)} días`)
      } else if (daysUntilExpiry <= 7) {
        status = 'expires-soon'
        statusText = 'Por vencer'
        displayStatusText = 'Por vencer'
        if (daysUntilExpiry === 0) {
          toast('Membresía vence hoy', {
            icon: '⚠️',
            style: {
              background: '#fef3c7',
              color: '#92400e'
            }
          })
        } else {
          toast(`Membresía vence en ${daysUntilExpiry} días`, {
            icon: '⚠️',
            style: {
              background: '#fef3c7',
              color: '#92400e'
            }
          })
        }
      } else {
        toast.success(`Check-in exitoso - ${member.name}`)
      }

      // Registrar check-in
      const checkInData: Omit<CheckIn, 'id' | 'created_at'> = {
        member_dni: member.dni,
        member_name: member.name,
        check_in_time: new Date().toISOString(),
        membership_status: statusText // Usar statusText sin emojis para la base de datos
      }

      console.log('Registrando check-in:', checkInData)

      const { error: checkInError } = await supabase
        .from('checkins')
        .insert([checkInData])

      if (checkInError) {
        console.error('Error registering check-in:', checkInError)
        if (checkInError.code) {
          console.error('Código de error:', checkInError.code)
          console.error('Mensaje:', checkInError.message)
          console.error('Detalles:', checkInError.details)
        }
        // No fallar el proceso completo, pero registrar el error
      } else {
        console.log('Check-in registrado exitosamente')
      }

      // Actualizar lista de check-ins
      await fetchTodayCheckins()

      return {
        member,
        status,
        statusText: displayStatusText,
        daysUntilExpiry
      }

    } catch (error) {
      console.error('Error in check-in process:', error)
      toast.error('Error en el proceso de check-in')
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodayCheckins()
  }, [])

  return {
    checkins,
    loading,
    checkInMember,
    fetchTodayCheckins
  }
}

export default useCheckIns