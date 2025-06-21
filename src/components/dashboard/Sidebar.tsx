import React from 'react';
import { Camera, Monitor, AlertTriangle, X, Plus, Trash2, Edit, Eye, Cpu } from 'lucide-react';
import { Camara, EventoDeteccion, ModeloIA } from '../../services/camaras';

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  camaras: Camara[];
  selectedCameraId: number | null;
  setSelectedCameraId: (id: number | null) => void;
  modelosIA: ModeloIA[];
  eventos: EventoDeteccion[];
  estadisticas: {
    total_camaras: number;
    camaras_activas: number;
    eventos_hoy: number;
  } | null;
  onAddCamera: () => void;
  onEditCamera: (camara: Camara) => void;
  onDeleteCamera: (id: number) => void;
  onAddModeloIA: () => void;
  onEditModeloIA: (modelo: ModeloIA) => void;
  onDeleteModeloIA: (id: number) => void;
  loading?: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  camaras,
  selectedCameraId,
  setSelectedCameraId,
  modelosIA,
  eventos,
  estadisticas,
  onAddCamera,
  onEditCamera,
  onDeleteCamera,
  onAddModeloIA,
  onEditModeloIA,
  onDeleteModeloIA,
  loading = false,
}) => {
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVA':
        return 'bg-green-500';
      case 'INACTIVA':
        return 'bg-gray-500';
      case 'MANTENIMIENTO':
        return 'bg-yellow-500';
      case 'FALLA':
        return 'bg-red-500';
      case 'DESCONECTADA':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getTipoDisplay = (tipo: string) => {
    switch (tipo) {
      case 'IP':
        return 'IP';
      case 'WEBCAM':
        return 'Webcam';
      case 'USB':
        return 'USB';
      case 'RTSP':
        return 'RTSP';
      case 'HTTP':
        return 'HTTP';
      default:
        return tipo;
    }
  };

  const getSeverityColor = (estado: string) => {
    switch (estado) {
      case 'NUEVO':
        return 'border-red-500 bg-red-900/20';
      case 'PROCESANDO':
        return 'border-yellow-500 bg-yellow-900/20';
      case 'PROCESADO':
        return 'border-green-500 bg-green-900/20';
      case 'FALSO_POSITIVO':
        return 'border-gray-500 bg-gray-900/20';
      case 'ERROR':
        return 'border-red-600 bg-red-900/30';
      default:
        return 'border-gray-600 bg-gray-900/20';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Ahora';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const selectedCamera = camaras.find(cam => cam.id === selectedCameraId);

  return (
    <>
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:relative top-0 left-0 lg:top-auto lg:left-auto z-50 lg:z-auto w-80 xl:w-96 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto flex-shrink-0 transition-transform duration-300 ease-in-out h-screen lg:h-full`}>
        {/* Botón de cerrar para móvil */}
        <button 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-lg transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Contenido del sidebar */}
        <div className="pt-12 lg:pt-0">
          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                <span className="text-xl sm:text-2xl font-bold">
                  {estadisticas?.total_camaras || camaras.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Cámaras</p>
            </div>
            <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
                <span className="text-xl sm:text-2xl font-bold">
                  {estadisticas?.eventos_hoy || eventos.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Eventos Hoy</p>
            </div>
          </div>
          
          {/* Lista de Cámaras */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center">
                <Monitor className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Cámaras
              </h3>
              <button
                onClick={onAddCamera}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                title="Agregar cámara"
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-400 mt-2">Cargando cámaras...</p>
                </div>
              ) : camaras.length === 0 ? (
                <div className="text-center py-4">
                  <Camera className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No hay cámaras configuradas</p>
                  <button
                    onClick={onAddCamera}
                    className="text-blue-400 hover:text-blue-300 text-sm mt-1"
                  >
                    Agregar primera cámara
                  </button>
                </div>
              ) : (
                camaras.map((camara) => (
                  <div
                    key={camara.id}
                    className={`p-2 sm:p-3 rounded-lg transition-colors ${
                      selectedCameraId === camara.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedCameraId(camara.id);
                          setSidebarOpen(false);
                        }}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm sm:text-base">{camara.nombre}</p>
                            <p className="text-xs sm:text-sm opacity-75">{camara.ubicacion}</p>
                            <span className="text-xs opacity-60">
                              {getTipoDisplay(camara.tipo)}
                              {camara.ip_address && ` - ${camara.ip_address}`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`h-2 w-2 rounded-full ${getStatusColor(camara.estado)}`}></div>
                            <span className="text-xs opacity-75">
                              {camara.modelos_ia?.length || 0} IA
                            </span>
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => onEditCamera(camara)}
                          className="p-1 hover:bg-gray-600 rounded transition-colors"
                          title="Editar cámara"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => onDeleteCamera(camara.id)}
                          className="p-1 hover:bg-red-600 rounded transition-colors"
                          title="Eliminar cámara"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Lista de Modelos de IA */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center">
                <Cpu className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Modelos de IA
              </h3>
              <button
                onClick={onAddModeloIA}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                title="Agregar modelo de IA"
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-400 mt-2">Cargando modelos...</p>
                </div>
              ) : modelosIA.length === 0 ? (
                <div className="text-center py-4">
                  <Cpu className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No hay modelos de IA</p>
                  <button
                    onClick={onAddModeloIA}
                    className="text-blue-400 hover:text-blue-300 text-sm mt-1"
                  >
                    Agregar primer modelo
                  </button>
                </div>
              ) : (
                modelosIA.map((modelo) => (
                  <div
                    key={modelo.id}
                    className="p-2 sm:p-3 rounded-lg bg-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm sm:text-base">{modelo.nombre}</p>
                        <p className="text-xs sm:text-sm opacity-75">{modelo.tipo.replace(/_/g, ' ')}</p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => onEditModeloIA(modelo)}
                          className="p-1 hover:bg-gray-600 rounded transition-colors"
                          title="Editar modelo"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => onDeleteModeloIA(modelo.id)}
                          className="p-1 hover:bg-red-600 rounded transition-colors"
                          title="Eliminar modelo"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Eventos de Detección */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Eventos Recientes
            </h3>
            <div className="space-y-2">
              {eventos.length === 0 ? (
                <div className="text-center py-4">
                  <AlertTriangle className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No hay eventos recientes</p>
                </div>
              ) : (
                eventos.slice(0, 5).map((evento) => (
                  <div 
                    key={evento.id} 
                    className={`p-2 sm:p-3 rounded-lg border ${getSeverityColor(evento.estado)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize text-sm sm:text-base">
                          {evento.tipo_evento}
                        </p>
                        <p className="text-xs sm:text-sm opacity-75">
                          {evento.camaraModeloIA?.camara?.nombre || 'Cámara desconocida'}
                        </p>
                        <p className="text-xs opacity-60">
                          Confianza: {Math.round(evento.confianza * 100)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs">{formatTime(evento.fecha_deteccion)}</span>
                        <div className="text-xs opacity-75 mt-1">
                          {evento.estado}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 