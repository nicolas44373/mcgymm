'use client'

import { useState, useEffect, useRef } from 'react'
import { useCheckIns } from '@/hooks/useCheckIns'
import { useMembers } from '@/hooks/useMembers'
import { format } from 'date-fns'
import { Search, User, Clock, Phone, Calendar, RotateCcw } from 'lucide-react'

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

// Función para obtener la hora y fecha actual local
const getCurrentLocalDateTime = () => {
  return new Date() // Esto está bien para mostrar la hora actual
}

function CheckInTab() {
  const { checkins, loading: checkinsLoading, checkInMember } = useCheckIns()
  const { renewMembership } = useMembers()
  const [dni, setDni] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [memberResult, setMemberResult] = useState<any>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-ocultar resultado después de 5 segundos
  useEffect(() => {
    if (memberResult) {
      setCountdown(5)
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null) return null
          if (prev <= 1) {
            setMemberResult(null)
            return null
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    } else {
      setCountdown(null)
      // Auto-focus al input cuando se oculta el resultado
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [memberResult])

  // Focus automático al cargar el componente
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSearch = async () => {
    if (!dni.trim()) return
    
    setSearchLoading(true)
    setCountdown(null) // Resetear countdown
    const result = await checkInMember(dni)
    setMemberResult(result)
    setSearchLoading(false)
    setDni('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleRenewFromCheckin = async (memberDni: string) => {
    setCountdown(null) // Pausar countdown durante renovación
    await renewMembership(memberDni)
    // Re-buscar el miembro para actualizar la información mostrada
    const result = await checkInMember(memberDni)
    setMemberResult(result)
  }

  const handleDismissResult = () => {
    setMemberResult(null)
    setCountdown(null)
  }

  const getStatusClass = (status: string) => {
    if (status === 'expired') return 'bg-red-50 border-red-200 text-red-800'
    if (status === 'expires-soon') return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    return 'bg-green-50 border-green-200 text-green-800'
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Check-In de Clientes</h2>
      
      {/* Formulario de búsqueda */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-xl mb-8 text-white">
        <h3 className="text-2xl font-semibold mb-6 text-center">Buscar Cliente</h3>
        
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ingrese DNI del cliente"
              className="w-full px-4 py-3 pr-12 text-gray-800 rounded-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
              disabled={searchLoading}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          
          <button
            onClick={handleSearch}
            disabled={searchLoading || !dni.trim()}
            className="w-full mt-4 px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searchLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                Buscando...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Search size={20} />
                Buscar Cliente
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Resultado de la búsqueda */}
      {memberResult && (
        <div className={`p-6 rounded-xl border-2 mb-8 relative ${getStatusClass(memberResult.status)}`}>
          {/* Countdown y botón cerrar */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {countdown && (
              <span className="text-sm font-medium bg-white/80 px-2 py-1 rounded">
                Se oculta en {countdown}s
              </span>
            )}
            <button
              onClick={handleDismissResult}
              className="bg-white/80 hover:bg-white/90 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              title="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between mb-4 pr-20">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <User size={24} />
              {memberResult.member.name}
            </h3>
            <span className="text-sm font-medium">
              Último ingreso: {format(getCurrentLocalDateTime(), 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <strong>DNI:</strong> {memberResult.member.dni}
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} />
              <strong>Teléfono:</strong> {memberResult.member.phone || 'No registrado'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <strong>Membresía:</strong> {memberResult.member.membership_type.toUpperCase()}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <strong>Vence:</strong> {formatDateLocal(memberResult.member.expiry_date)}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">
              Estado: {memberResult.statusText}
              {memberResult.daysUntilExpiry >= 0 && (
                <span className="text-sm font-normal ml-2">
                  ({memberResult.daysUntilExpiry} días restantes)
                </span>
              )}
            </div>
            
            {memberResult.status === 'expired' && (
              <button
                onClick={() => handleRenewFromCheckin(memberResult.member.dni)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
              >
                <RotateCcw size={16} />
                Renovar Ahora
              </button>
            )}
          </div>
        </div>
      )}

      {/* Historial de ingresos */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Clock size={20} />
            Historial de Ingresos de Hoy
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Hora</th>
                <th className="px-6 py-4 text-left font-semibold">DNI</th>
                <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left font-semibold">Estado Membresía</th>
              </tr>
            </thead>
            <tbody>
              {checkinsLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                  </td>
                </tr>
              ) : checkins.length > 0 ? (
                checkins.map((checkin) => (
                  <tr key={checkin.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {format(new Date(checkin.check_in_time), 'HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4">{checkin.member_dni}</td>
                    <td className="px-6 py-4 font-medium">{checkin.member_name}</td>
                    <td className="px-6 py-4">{checkin.membership_status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <User size={48} className="text-gray-300" />
                      <p className="text-lg">No hay check-ins registrados hoy</p>
                      <p className="text-sm">Los ingresos aparecerán aquí cuando los clientes hagan check-in</p>
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

export default CheckInTab