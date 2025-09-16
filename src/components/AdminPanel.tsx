import { useState } from 'react'
import { X, Settings, CreditCard, User, Calendar, Dumbbell, Plus, Edit3, Trash2, Save } from 'lucide-react'
import { useAdminData } from '@/hooks/useAdminData'

type ConfigTab = 'precios' | 'empleados' | 'membresias' | 'clases'

interface AdminPanelProps {
  onClose: () => void
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<ConfigTab>('precios')
  const {
    membershipTypes,
    employees, 
    classTypes,
    loading,
    saveMembershipType,
    saveEmployee,
    saveClassType,
    deleteMembershipType,
    deleteEmployee,
    deleteClassType
  } = useAdminData()

  const [editingMembership, setEditingMembership] = useState<any>(null)
  const [editingEmployee, setEditingEmployee] = useState<any>(null)
  const [editingClass, setEditingClass] = useState<any>(null)

  const configTabs = [
    { id: 'precios' as ConfigTab, label: 'Precios', icon: CreditCard },
    { id: 'empleados' as ConfigTab, label: 'Empleados', icon: User },
    { id: 'membresias' as ConfigTab, label: 'Membresías', icon: Calendar },
    { id: 'clases' as ConfigTab, label: 'Clases', icon: Dumbbell },
  ]

  const handleSaveMembership = async (data: any) => {
    const formData = {
      name: data.get('name'),
      duration: data.get('duration'),
      duration_days: parseInt(data.get('duration_days')),
      price: parseFloat(data.get('price')),
      has_personal_trainer: data.get('has_personal_trainer') === 'on',
      description: data.get('description')
    }
    
    await saveMembershipType(editingMembership?.id || null, formData)
    setEditingMembership(null)
  }

  const handleSaveEmployee = async (data: any) => {
    const formData = {
      name: data.get('name'),
      role: data.get('role'),
      phone: data.get('phone'),
      email: data.get('email'),
      salary: parseFloat(data.get('salary')),
      is_active: data.get('is_active') === 'on'
    }
    
    await saveEmployee(editingEmployee?.id || null, formData)
    setEditingEmployee(null)
  }

  const handleSaveClass = async (data: any) => {
    const formData = {
      name: data.get('name'),
      description: data.get('description'),
      duration_minutes: parseInt(data.get('duration_minutes')),
      price: parseFloat(data.get('price')),
      max_participants: parseInt(data.get('max_participants')),
      requires_trainer: data.get('requires_trainer') === 'on'
    }
    
    await saveClassType(editingClass?.id || null, formData)
    setEditingClass(null)
  }

  const renderPreciosTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Gestión de Precios</h3>
        <button
          onClick={() => setEditingMembership({})}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus size={16} />
          Nueva Membresía
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {membershipTypes.map(membership => (
          <div key={membership.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-lg">{membership.name}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingMembership(membership)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => deleteMembershipType(membership.id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-2">Duración: {membership.duration}</p>
            <p className="text-2xl font-bold text-green-600 mb-2">${membership.price?.toLocaleString()}</p>
            {membership.has_personal_trainer && (
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Incluye Entrenador Personal
              </span>
            )}
            {membership.description && (
              <p className="text-gray-500 text-sm mt-2">{membership.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Edición de Membresía */}
      {editingMembership && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-bold mb-4">
              {editingMembership.id ? 'Editar Membresía' : 'Nueva Membresía'}
            </h4>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleSaveMembership(new FormData(e.currentTarget))
            }} className="space-y-4">
              <input
                name="name"
                defaultValue={editingMembership.name || ''}
                placeholder="Nombre de la membresía"
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                name="duration"
                defaultValue={editingMembership.duration || ''}
                placeholder="Duración (ej: 1 mes, 3 meses)"
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                name="duration_days"
                type="number"
                defaultValue={editingMembership.duration_days || ''}
                placeholder="Duración en días"
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={editingMembership.price || ''}
                placeholder="Precio"
                className="w-full p-3 border rounded-lg"
                required
              />
              <textarea
                name="description"
                defaultValue={editingMembership.description || ''}
                placeholder="Descripción (opcional)"
                className="w-full p-3 border rounded-lg"
                rows={3}
              />
              <label className="flex items-center gap-2">
                <input
                  name="has_personal_trainer"
                  type="checkbox"
                  defaultChecked={editingMembership.has_personal_trainer || false}
                />
                Incluye Entrenador Personal
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMembership(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )

  const renderEmpleadosTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Gestión de Empleados</h3>
        <button
          onClick={() => setEditingEmployee({})}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus size={16} />
          Nuevo Empleado
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Cargo</th>
              <th className="px-4 py-3 text-left">Teléfono</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Salario</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.id} className="border-t">
                <td className="px-4 py-3">{employee.name}</td>
                <td className="px-4 py-3">{employee.role}</td>
                <td className="px-4 py-3">{employee.phone}</td>
                <td className="px-4 py-3">{employee.email}</td>
                <td className="px-4 py-3">${employee.salary?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {employee.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingEmployee(employee)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => deleteEmployee(employee.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Edición de Empleado */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-bold mb-4">
              {editingEmployee.id ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h4>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleSaveEmployee(new FormData(e.currentTarget))
            }} className="space-y-4">
              <input
                name="name"
                defaultValue={editingEmployee.name || ''}
                placeholder="Nombre completo"
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                name="role"
                defaultValue={editingEmployee.role || ''}
                placeholder="Cargo"
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                name="phone"
                defaultValue={editingEmployee.phone || ''}
                placeholder="Teléfono"
                className="w-full p-3 border rounded-lg"
              />
              <input
                name="email"
                type="email"
                defaultValue={editingEmployee.email || ''}
                placeholder="Email"
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                name="salary"
                type="number"
                step="0.01"
                defaultValue={editingEmployee.salary || ''}
                placeholder="Salario"
                className="w-full p-3 border rounded-lg"
                required
              />
              <label className="flex items-center gap-2">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked={editingEmployee.is_active !== false}
                />
                Empleado activo
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )

  const renderClasesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Gestión de Clases</h3>
        <button
          onClick={() => setEditingClass({})}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus size={16} />
          Nueva Clase
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classTypes.map(classType => (
          <div key={classType.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-lg">{classType.name}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingClass(classType)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => deleteClassType(classType.id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-2">{classType.description}</p>
            <div className="space-y-1 text-sm">
              <p><strong>Duración:</strong> {classType.duration_minutes} min</p>
              <p><strong>Precio:</strong> ${classType.price?.toLocaleString()}</p>
              <p><strong>Max participantes:</strong> {classType.max_participants}</p>
            </div>
            {classType.requires_trainer && (
              <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Requiere Entrenador
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Edición de Clase */}
      {editingClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-bold mb-4">
              {editingClass.id ? 'Editar Clase' : 'Nueva Clase'}
            </h4>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleSaveClass(new FormData(e.currentTarget))
            }} className="space-y-4">
              <input
                name="name"
                defaultValue={editingClass.name || ''}
                placeholder="Nombre de la clase"
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                name="duration_minutes"
                type="number"
                defaultValue={editingClass.duration_minutes || ''}
                placeholder="Duración en minutos"
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={editingClass.price || ''}
                placeholder="Precio"
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                name="max_participants"
                type="number"
                defaultValue={editingClass.max_participants || ''}
                placeholder="Máximo de participantes"
                className="w-full p-3 border rounded-lg"
                required
              />
              <textarea
                name="description"
                defaultValue={editingClass.description || ''}
                placeholder="Descripción"
                className="w-full p-3 border rounded-lg"
                rows={3}
                required
              />
              <label className="flex items-center gap-2">
                <input
                  name="requires_trainer"
                  type="checkbox"
                  defaultChecked={editingClass.requires_trainer !== false}
                />
                Requiere Entrenador
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="text-lg font-semibold">Cargando configuración...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Settings size={28} />
              <h2 className="text-2xl font-bold">Panel de Administración</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs de Configuración */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {configTabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {activeTab === 'precios' && renderPreciosTab()}
          {activeTab === 'empleados' && renderEmpleadosTab()}
          {activeTab === 'membresias' && renderPreciosTab()} {/* Mismo contenido que precios por ahora */}
          {activeTab === 'clases' && renderClasesTab()}
        </div>
      </div>
    </div>
  )
}