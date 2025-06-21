'use client';

import React, { useState } from 'react';
import { Camera, Monitor, Shield, AlertTriangle, Settings, Users, Calendar, Activity, Play, Pause, Square, RotateCcw, ZoomIn, ZoomOut, Volume2, VolumeX, Menu, X } from 'lucide-react';

export default function CameraMonitoringDashboard() {
  const [selectedCamera, setSelectedCamera] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const cameras = [
    { id: 1, name: 'Entrada Principal', location: 'Lobby', status: 'online', lastSeen: '2 min ago' },
    { id: 2, name: 'Estacionamiento A', location: 'Exterior', status: 'online', lastSeen: '1 min ago' },
    { id: 3, name: 'Pasillo Piso 2', location: 'Interior', status: 'offline', lastSeen: '15 min ago' },
    { id: 4, name: 'Área de Juegos', location: 'Exterior', status: 'online', lastSeen: '30 sec ago' },
    { id: 5, name: 'Salida Emergencia', location: 'Interior', status: 'online', lastSeen: '1 min ago' },
    { id: 6, name: 'Azotea', location: 'Exterior', status: 'maintenance', lastSeen: '2 hours ago' },
  ];

  const alerts = [
    { id: 1, type: 'motion', camera: 'Entrada Principal', time: '14:32', severity: 'medium' },
    { id: 2, type: 'offline', camera: 'Pasillo Piso 2', time: '14:15', severity: 'high' },
    { id: 3, type: 'motion', camera: 'Estacionamiento A', time: '14:10', severity: 'low' },
  ];

  const getStatusColor = (status: String) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: String) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              <h1 className="text-lg sm:text-2xl font-bold">SecureWatch</h1>
            </div>
            <div className="hidden sm:block text-sm text-gray-400">
              Condominio Vista Real
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm text-green-400">Sistema Activo</span>
            </div>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative z-50 lg:z-auto w-80 xl:w-96 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto flex-shrink-0 transition-transform duration-300 ease-in-out h-full`}>
          {/* Close button for mobile */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                <span className="text-xl sm:text-2xl font-bold">{cameras.length}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Cámaras</p>
            </div>
            
            <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
                <span className="text-xl sm:text-2xl font-bold">{activeAlerts}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Alertas</p>
            </div>
          </div>

          {/* Camera List */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
              <Monitor className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Cámaras
            </h3>
            
            <div className="space-y-2">
              {cameras.map((camera, index) => (
                                  <button
                  key={camera.id}
                  onClick={() => {
                    setSelectedCamera(index);
                    setSidebarOpen(false); // Close sidebar on mobile after selection
                  }}
                  className={`w-full p-2 sm:p-3 rounded-lg text-left transition-colors ${
                    selectedCamera === index 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm sm:text-base">{camera.name}</p>
                      <p className="text-xs sm:text-sm opacity-75">{camera.location}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(camera.status)}`}></div>
                      <span className="text-xs opacity-75">{camera.lastSeen}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Alertas Recientes
            </h3>
            
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-2 sm:p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize text-sm sm:text-base">{alert.type}</p>
                      <p className="text-xs sm:text-sm opacity-75">{alert.camera}</p>
                    </div>
                    <span className="text-xs">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* Video Feed */}
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                {cameras[selectedCamera]?.name}
              </h2>
              
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  cameras[selectedCamera]?.status === 'online' 
                    ? 'bg-green-100 text-green-800' 
                    : cameras[selectedCamera]?.status === 'offline'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <div className={`h-1.5 w-1.5 rounded-full mr-1 ${getStatusColor(cameras[selectedCamera]?.status)}`}></div>
                  {cameras[selectedCamera]?.status}
                </span>
              </div>
            </div>

            {/* Video Player Placeholder */}
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-3 sm:mb-4 relative overflow-hidden">
              {cameras[selectedCamera]?.status === 'online' ? (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 text-sm sm:text-base">Feed en Vivo - {cameras[selectedCamera]?.name}</p>
                    <div className="mt-2 text-sm text-green-400 flex items-center justify-center">
                      <div className="h-2 w-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                      REC
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-red-500" />
                  <p className="text-gray-400 text-sm sm:text-base">Cámara sin conexión</p>
                </div>
              )}
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 bg-black bg-opacity-50 rounded-lg p-2 sm:p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button 
                      onClick={() => setIsRecording(!isRecording)}
                      className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors"
                    >
                      {isRecording ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                    <button className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors">
                      <Square className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors">
                      <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors">
                      <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors">
                      <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Acciones Rápidas</h3>
              <div className="space-y-2">
                <button className="w-full p-2 sm:p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm sm:text-base">
                  Exportar Grabación
                </button>
                <button className="w-full p-2 sm:p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm sm:text-base">
                  Tomar Captura
                </button>
                <button className="w-full p-2 sm:p-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors text-sm sm:text-base">
                  Crear Reporte
                </button>
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Actividad Reciente
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-400 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="text-sm">Movimiento detectado</p>
                    <p className="text-xs text-gray-400">14:32 - Entrada Principal</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="text-sm">Grabación iniciada</p>
                    <p className="text-xs text-gray-400">14:30 - Estacionamiento A</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-red-400 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="text-sm">Cámara desconectada</p>
                    <p className="text-xs text-gray-400">14:15 - Pasillo Piso 2</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Estado del Sistema</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Almacenamiento</span>
                  <span className="text-sm text-green-400">68% usado</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '68%'}}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">CPU</span>
                  <span className="text-sm text-yellow-400">45%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Red</span>
                  <span className="text-sm text-green-400">Estable</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}