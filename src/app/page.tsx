'use client'

import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { Users, UserCheck, DollarSign, Activity, TrendingUp, Shield } from 'lucide-react'
import MembersTab from '@/components/MembersTab'
import CheckInTab from '@/components/CheckInTab'
import CashTab from '@/components/CashTab'

type Tab = 'members' | 'checkin' | 'cash'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('members')
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Marcar como montado para evitar problemas de hidratación
    setMounted(true)
    
    // Establecer tiempo inicial
    setCurrentTime(new Date())
    
    // Actualizar cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  const tabs = [
    { id: 'members' as Tab, label: 'Clientes', icon: Users, color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-500/10' },
    { id: 'checkin' as Tab, label: 'Check-In', icon: UserCheck, color: 'from-blue-500 to-indigo-600', bgColor: 'bg-blue-500/10' },
    { id: 'cash' as Tab, label: 'Caja Chica', icon: DollarSign, color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-500/10' },
  ]

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--:--'
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Cargando fecha...'
    return date.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Función para obtener el tiempo de display (evita hidratación)
  const getDisplayTime = () => {
    if (!mounted) return '--:--:--'
    return formatTime(currentTime)
  }

  const getDisplayDate = () => {
    if (!mounted) return 'Cargando...'
    return formatDate(currentTime)
  }

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Background animations and effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-blue-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-32 left-40 w-2 h-2 bg-indigo-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-cyan-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '4s' }}></div>
      </div>

      <Toaster position="top-right" toastOptions={{ className: 'bg-white/90 text-gray-900 border border-white/20', duration: 4000 }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 shadow-cyan-500/20">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 text-white p-8 overflow-hidden">
            {/* Header background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent transform skew-y-1"></div>
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-blue-500/20 to-transparent transform -skew-y-1"></div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center gap-8 mb-6">
                {/* Logo del gym - Optimizado */}
                <div className="relative group">
                  {/* Efectos de glow múltiples */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-20 animate-pulse group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full blur-xl opacity-30 animate-pulse group-hover:opacity-50 transition-opacity duration-300" style={{ animationDelay: '0.5s' }}></div>
                  
                  {/* Contenedor del logo con mejor sizing */}
                  <div className="relative w-24 h-36 flex items-center justify-center bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-2xl border border-cyan-400/30 backdrop-blur-sm group-hover:border-cyan-400/60 transition-all duration-300">
                    <img 
                      src="/sagrado.jpg" 
                      alt="Sagrado Gym Logo" 
                      className="w-20 h-32 object-contain relative z-10 transition-all duration-300 group-hover:scale-110"
                      style={{ 
                        filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.6)) brightness(1.1) contrast(1.2)',
                        imageRendering: 'crisp-edges'
                      }}
                    />
                  </div>
                  
                  {/* Reflejo sutil */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-16 h-8 bg-gradient-to-b from-cyan-400/20 to-transparent rounded-full blur-sm opacity-60"></div>
                </div>
                
                {/* Título principal mejorado */}
                <div className="text-center">
                  <h1 className="text-7xl font-black mb-3 bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent drop-shadow-2xl tracking-wider">
                    SAGRADO GYM
                  </h1>
                  <div className="h-1.5 w-56 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full mx-auto animate-pulse shadow-lg shadow-cyan-500/50"></div>
                  <div className="mt-2 text-cyan-200 text-lg font-semibold tracking-widest opacity-80">
                    FUERZA • HONOR • DISCIPLINA
                  </div>
                </div>

                {/* Elemento decorativo mejorado */}
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse group-hover:opacity-40 transition-opacity duration-300" style={{ animationDelay: '1s' }}></div>
                  <div className="relative w-24 h-24 flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-full border border-blue-400/30 backdrop-blur-sm group-hover:border-blue-400/60 transition-all duration-300">
                    <Shield size={48} className="text-cyan-300 animate-pulse drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" style={{ animationDelay: '1s', filter: 'drop-shadow(0 0 15px rgba(103, 232, 249, 0.6))' }} />
                  </div>
                </div>
              </div>
              
              <p className="text-xl opacity-90 mb-6 font-medium tracking-wide">
                Sistema de Gestión Integral
              </p>
              
              {/* Reloj mejorado */}
              <div className="bg-gradient-to-r from-black/30 to-slate-900/30 rounded-2xl p-6 inline-block border border-cyan-500/30 backdrop-blur-sm">
                <div className="text-4xl font-mono font-bold mb-2 text-cyan-300 drop-shadow-lg tracking-wider">
                  {getDisplayTime()}
                </div>
                <div className="text-sm opacity-80 capitalize text-blue-200">
                  {getDisplayDate()}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation mejorada */}
          <div className="bg-gradient-to-r from-slate-100/95 to-gray-100/95 border-b border-gray-200/50 relative">
            {/* Línea decorativa superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
            
            <div className="flex relative">
              {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-3 py-6 font-bold text-lg transition-all duration-300 relative group ${
                      isActive
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-2xl -translate-y-2 scale-105 z-10`
                        : 'text-gray-700 hover:text-gray-900 hover:-translate-y-1 hover:scale-105 hover:bg-white/50'
                    }`}
                  >
                    {/* Efecto de brillo en hover */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                    
                    <Icon size={24} className={`transition-all duration-300 ${isActive ? 'text-white drop-shadow-lg' : 'text-gray-600 group-hover:text-blue-600'}`} />
                    <span className="relative z-10">{tab.label}</span>
                    
                    {/* Indicador activo */}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white rounded-full shadow-lg"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="relative min-h-[600px] p-8 bg-gradient-to-br from-white/95 to-gray-50/95">
            {/* Patrón de fondo sutil */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  radial-gradient(circle at 20px 20px, rgba(6, 182, 212, 0.3) 1px, transparent 0),
                  radial-gradient(circle at 80px 80px, rgba(59, 130, 246, 0.3) 1px, transparent 0)
                `,
                backgroundSize: '100px 100px'
              }}></div>
            </div>
            
            <div className="relative z-10">
              {activeTab === 'members' && <MembersTab />}
              {activeTab === 'checkin' && <CheckInTab />}
              {activeTab === 'cash' && <CashTab />}
            </div>
          </div>

          {/* Footer mejorado */}
          <div className="bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-slate-900/95 text-white p-4 flex items-center justify-between relative overflow-hidden">
            {/* Patrón de fondo del footer */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <TrendingUp size={20} className="text-cyan-400" />
              </div>
              <span className="text-sm font-medium">
                Sistema activo • {mounted ? formatTime(currentTime) : '--:--:--'}
              </span>
            </div>
            
            <div className="text-xs opacity-70 relative z-10 flex items-center gap-2">
              <Shield size={16} className="text-cyan-400" />
              Sagrado Gym Management System v2.0
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}