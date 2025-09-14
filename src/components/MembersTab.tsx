'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMembers } from '@/hooks/useMembers'
import { Member } from '@/lib/supabase'
import { format, differenceInDays } from 'date-fns'
import { Edit, RotateCcw, Trash2, Save, RefreshCw, X, User, Calendar, Phone, CreditCard, Search } from 'lucide-react'

type MemberFormData = Omit<Member, 'id' | 'created_at' | 'updated_at' | 'expiry_date'>
type MemberInput = Omit<Member, 'id' | 'created_at' | 'updated_at'>

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

// Función para formatear fecha de manera consistente
const formatDateLocal = (dateString: string) => {
  const date = createLocalDate(dateString)
  return format(date, 'dd/MM/yyyy')
}

// Precios de membresías
const membershipPrices = {
  mensual: { label: 'Mensual', price: 15000 },
  trimestral: { label: 'Trimestral', price: 40000 },
  semestral: { label: 'Semestral', price: 75000 },
  anual: { label: 'Anual', price: 140000 }
}

export default function MembersTab() {
  const { members, loading, saveMember, deleteMember, renewMembership } = useMembers()
  const [editingDni, setEditingDni] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [renewalModal, setRenewalModal] = useState<{ isOpen: boolean; member: Member | null }>({
    isOpen: false,
    member: null
  })
  const [selectedMembershipType, setSelectedMembershipType] = useState<string>('')
  const [renewalLoading, setRenewalLoading] = useState(false)
  
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<MemberFormData>({
    defaultValues: {
      start_date: getTodayLocal()
    }
  })

  // Filtrar miembros basado en el término de búsqueda
  const filteredMembers = members.filter(member => {
    if (!searchTerm.trim()) return true
    
    const searchLower = searchTerm.toLowerCase().trim()
    return (
      member.name.toLowerCase().includes(searchLower) ||
      member.dni.toLowerCase().includes(searchLower)
    )
  })

  const handleEdit = (member: Member) => {
    setEditingDni(member.dni)
    setValue('dni', member.dni)
    setValue('name', member.name)
    setValue('phone', member.phone || '')
    setValue('membership_type', member.membership_type)
    setValue('start_date', member.start_date)
  }

  const handleClearForm = () => {
    setEditingDni(null)
    reset({
      dni: '',
      name: '',
      phone: '',
      membership_type: 'mensual',
      start_date: getTodayLocal()
    })
  }

  const onSubmit = async (data: MemberFormData) => {
    console.log('DATOS DEL FORMULARIO:')
    console.log('Fecha de inicio del formulario:', data.start_date)
    console.log('Fecha local actual:', getTodayLocal())
    
    // Add expiry_date as empty string since it will be calculated in saveMember
    const memberInput: MemberInput = {
      ...data,
      expiry_date: '' // This will be calculated in the hook
    }
    await saveMember(memberInput)
    handleClearForm()
  }

  const handleDelete = async (dni: string) => {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      await deleteMember(dni)
    }
  }

  const handleRenewClick = (member: Member) => {
    setRenewalModal({ isOpen: true, member })
    setSelectedMembershipType(member.membership_type)
  }

  const handleCloseModal = () => {
    setRenewalModal({ isOpen: false, member: null })
    setSelectedMembershipType('')
  }

  const handleRenewalConfirm = async () => {
    if (!renewalModal.member || !selectedMembershipType) return
    
    setRenewalLoading(true)
    try {
      // Actualizar el tipo de membresía si cambió
      if (selectedMembershipType !== renewalModal.member.membership_type) {
        const updatedMember: MemberInput = {
          dni: renewalModal.member.dni,
          name: renewalModal.member.name,
          phone: renewalModal.member.phone,
          membership_type: selectedMembershipType as 'mensual' | 'trimestral' | 'semestral' | 'anual',
          start_date: getTodayLocal(),
          expiry_date: '' // Se calculará automáticamente
        }
        await saveMember(updatedMember)
      } else {
        await renewMembership(renewalModal.member.dni)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error en renovación:', error)
    } finally {
      setRenewalLoading(false)
    }
  }

  const getStatusInfo = (member: Member) => {
    // Usar fecha local actual para comparar
    const today = createLocalDate(getTodayLocal())
    const expiryDate = createLocalDate(member.expiry_date)
    const daysUntilExpiry = differenceInDays(expiryDate, today)
    
    if (daysUntilExpiry < 0) {
      return { className: 'bg-red-100 text-red-800', text: 'Vencida' }
    } else if (daysUntilExpiry <= 7) {
      return { className: 'bg-yellow-100 text-yellow-800', text: `Vence en ${daysUntilExpiry} días` }
    }
    return { className: 'bg-green-100 text-green-800', text: 'Activa' }
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
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Gestión de Clientes</h2>

      {/* Formulario */}
      <div className="bg-gray-50 p-8 rounded-xl mb-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-700">
          {editingDni ? 'Editar Cliente' : 'Agregar Cliente'}
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">DNI:</label>
              <input
                {...register('dni', { required: 'DNI es requerido' })}
                disabled={!!editingDni}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors disabled:bg-gray-100"
                placeholder="Ingrese DNI"
              />
              {errors.dni && (
                <p className="text-red-500 text-sm mt-1">{errors.dni.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo:</label>
              <input
                {...register('name', { required: 'Nombre es requerido' })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="Nombre completo"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono:</label>
              <input
                {...register('phone')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="Número de teléfono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Membresía:</label>
              <select
                {...register('membership_type', { required: 'Seleccione un tipo de membresía' })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              >
                <option value="">Seleccionar</option>
                <option value="mensual">Mensual - $15,000</option>
                <option value="trimestral">Trimestral - $40,000</option>
                <option value="semestral">Semestral - $75,000</option>
                <option value="anual">Anual - $140,000</option>
              </select>
              {errors.membership_type && (
                <p className="text-red-500 text-sm mt-1">{errors.membership_type.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Inicio:</label>
              <input
                type="date"
                {...register('start_date', { required: 'Fecha de inicio es requerida' })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold disabled:opacity-50"
            >
              <Save size={20} />
              {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
            </button>
            
            <button
              type="button"
              onClick={handleClearForm}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-semibold"
            >
              <RefreshCw size={20} />
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
          />
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            Mostrando {filteredMembers.length} de {members.length} clientes
          </p>
        )}
      </div>

      {/* Tabla de miembros */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">DNI</th>
                <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left font-semibold">Teléfono</th>
                <th className="px-6 py-4 text-left font-semibold">Membresía</th>
                <th className="px-6 py-4 text-left font-semibold">Inicio</th>
                <th className="px-6 py-4 text-left font-semibold">Vencimiento</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const status = getStatusInfo(member)
                return (
                  <tr key={member.dni} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{member.dni}</td>
                    <td className="px-6 py-4">{member.name}</td>
                    <td className="px-6 py-4">{member.phone || '-'}</td>
                    <td className="px-6 py-4 capitalize font-medium">{member.membership_type}</td>
                    <td className="px-6 py-4">{formatDateLocal(member.start_date)}</td>
                    <td className="px-6 py-4">{formatDateLocal(member.expiry_date)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleRenewClick(member)}
                          className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                          title="Renovar"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(member.dni)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredMembers.length === 0 && members.length > 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={48} className="text-gray-300" />
                      <p className="text-lg">No se encontraron clientes</p>
                      <p className="text-sm">Intenta con otro término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
              {members.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-lg">No hay miembros registrados</p>
                      <p className="text-sm">Agrega el primer cliente usando el formulario de arriba</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Renovación */}
      {renewalModal.isOpen && renewalModal.member && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <RotateCcw size={24} />
                  Renovar Membresía
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Información del Cliente */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User size={20} />
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <strong>DNI:</strong> {renewalModal.member.dni}
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>Nombre:</strong> {renewalModal.member.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <strong>Teléfono:</strong> {renewalModal.member.phone || 'No registrado'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <strong>Vence:</strong> {formatDateLocal(renewalModal.member.expiry_date)}
                  </div>
                </div>
              </div>

              {/* Selección de Membresía */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard size={20} />
                  Seleccionar Tipo de Membresía
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(membershipPrices).map(([type, info]) => (
                    <label
                      key={type}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedMembershipType === type
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="membershipType"
                        value={type}
                        checked={selectedMembershipType === type}
                        onChange={(e) => setSelectedMembershipType(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{info.label}</span>
                        <span className="text-lg font-bold text-green-600">
                          ${info.price.toLocaleString()}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> La renovación comenzará desde la fecha actual ({formatDateLocal(getTodayLocal())}) 
                  {selectedMembershipType !== renewalModal.member.membership_type && 
                    " y se actualizará el tipo de membresía."
                  }
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-4 justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRenewalConfirm}
                  disabled={!selectedMembershipType || renewalLoading}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  {renewalLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Renovando...
                    </>
                  ) : (
                    <>
                      <RotateCcw size={16} />
                      Confirmar Renovación
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}