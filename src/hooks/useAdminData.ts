'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export interface MembershipType {
  id: string
  name: string
  duration: string
  duration_days: number
  price: number
  has_personal_trainer: boolean
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  name: string
  role: string
  phone?: string
  email: string
  salary: number
  hire_date: string
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface ClassType {
  id: string
  name: string
  description: string
  duration_minutes: number
  price: number
  max_participants: number
  requires_trainer: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export function useAdminData() {
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar datos iniciales
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadMembershipTypes(),
        loadEmployees(),
        loadClassTypes()
      ])
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Error al cargar los datos de configuración')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // MEMBERSHIP TYPES
  // ============================================================================
  
  const loadMembershipTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_types')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMembershipTypes(data || [])
    } catch (error) {
      console.error('Error loading membership types:', error)
      toast.error('Error al cargar tipos de membresía')
    }
  }

  const saveMembershipType = async (id: string | null, data: Partial<MembershipType>) => {
    try {
      if (id) {
        // Actualizar existente
        const { error } = await supabase
          .from('membership_types')
          .update(data)
          .eq('id', id)

        if (error) throw error
        toast.success('Membresía actualizada correctamente')
      } else {
        // Crear nuevo
        const { error } = await supabase
          .from('membership_types')
          .insert([{ ...data, is_active: true }])

        if (error) throw error
        toast.success('Membresía creada correctamente')
      }
      
      await loadMembershipTypes()
    } catch (error) {
      console.error('Error saving membership type:', error)
      toast.error('Error al guardar la membresía')
    }
  }

  const deleteMembershipType = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta membresía?')) return

    try {
      // Soft delete - marcar como inactivo
      const { error } = await supabase
        .from('membership_types')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      toast.success('Membresía eliminada correctamente')
      await loadMembershipTypes()
    } catch (error) {
      console.error('Error deleting membership type:', error)
      toast.error('Error al eliminar la membresía')
    }
  }

  // ============================================================================
  // EMPLOYEES
  // ============================================================================
  
  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error loading employees:', error)
      toast.error('Error al cargar empleados')
    }
  }

  const saveEmployee = async (id: string | null, data: Partial<Employee>) => {
    try {
      if (id) {
        // Actualizar existente
        const { error } = await supabase
          .from('employees')
          .update(data)
          .eq('id', id)

        if (error) throw error
        toast.success('Empleado actualizado correctamente')
      } else {
        // Crear nuevo
        const { error } = await supabase
          .from('employees')
          .insert([{ ...data, is_active: true, hire_date: new Date().toISOString().split('T')[0] }])

        if (error) throw error
        toast.success('Empleado creado correctamente')
      }
      
      await loadEmployees()
    } catch (error) {
      console.error('Error saving employee:', error)
      toast.error('Error al guardar el empleado')
    }
  }

  const deleteEmployee = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este empleado?')) return

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Empleado eliminado correctamente')
      await loadEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast.error('Error al eliminar el empleado')
    }
  }

  // ============================================================================
  // CLASS TYPES
  // ============================================================================
  
  const loadClassTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('class_types')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (error) throw error
      setClassTypes(data || [])
    } catch (error) {
      console.error('Error loading class types:', error)
      toast.error('Error al cargar tipos de clases')
    }
  }

  const saveClassType = async (id: string | null, data: Partial<ClassType>) => {
    try {
      if (id) {
        // Actualizar existente
        const { error } = await supabase
          .from('class_types')
          .update(data)
          .eq('id', id)

        if (error) throw error
        toast.success('Tipo de clase actualizado correctamente')
      } else {
        // Crear nuevo
        const { error } = await supabase
          .from('class_types')
          .insert([{ ...data, is_active: true }])

        if (error) throw error
        toast.success('Tipo de clase creado correctamente')
      }
      
      await loadClassTypes()
    } catch (error) {
      console.error('Error saving class type:', error)
      toast.error('Error al guardar el tipo de clase')
    }
  }

  const deleteClassType = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este tipo de clase?')) return

    try {
      // Soft delete - marcar como inactivo
      const { error } = await supabase
        .from('class_types')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      toast.success('Tipo de clase eliminado correctamente')
      await loadClassTypes()
    } catch (error) {
      console.error('Error deleting class type:', error)
      toast.error('Error al eliminar el tipo de clase')
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const refreshData = async () => {
    await loadAllData()
  }

  const getMembershipTypeById = (id: string) => {
    return membershipTypes.find(mt => mt.id === id)
  }

  const getEmployeeById = (id: string) => {
    return employees.find(emp => emp.id === id)
  }

  const getClassTypeById = (id: string) => {
    return classTypes.find(ct => ct.id === id)
  }

  const getActiveMembershipTypes = () => {
    return membershipTypes.filter(mt => mt.is_active)
  }

  const getActiveEmployees = () => {
    return employees.filter(emp => emp.is_active)
  }

  const getActiveClassTypes = () => {
    return classTypes.filter(ct => ct.is_active)
  }

  return {
    // Data
    membershipTypes,
    employees,
    classTypes,
    loading,

    // Actions
    saveMembershipType,
    saveEmployee,
    saveClassType,
    deleteMembershipType,
    deleteEmployee,
    deleteClassType,
    refreshData,

    // Utilities
    getMembershipTypeById,
    getEmployeeById,
    getClassTypeById,
    getActiveMembershipTypes,
    getActiveEmployees,
    getActiveClassTypes,

    // Reload functions
    loadMembershipTypes,
    loadEmployees,
    loadClassTypes
  }
}