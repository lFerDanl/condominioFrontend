import React, { useRef, useEffect } from 'react';
import { Camera, AlertTriangle, Play, Pause, Square, RotateCcw, ZoomIn, ZoomOut, Volume2, VolumeX, Menu, Settings, Cpu } from 'lucide-react';
import { Camara } from '../../services/camaras';
import { useCameraIntelligence } from '../../hooks/useCameraIntelligence';

type VideoFeedProps = {
  camara: Camara | null;
  isRecording: boolean;
  setIsRecording: (rec: boolean) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  onEditCamera?: (camara: Camara) => void;
};

const VideoFeed: React.FC<VideoFeedProps> = ({
  camara,
  isRecording,
  setIsRecording,
  isMuted,
  setIsMuted,
  sidebarOpen,
  setSidebarOpen,
  onEditCamera,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { isDetecting, error: intelligenceError } = useCameraIntelligence({
    camara,
    videoRef,
    canvasRef,
  });

  useEffect(() => {
    if (camara?.tipo === 'WEBCAM' && videoRef.current) {
      // Para webcams, intentar acceder a la cámara del dispositivo
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error('Error accediendo a la webcam:', err);
        });
    }
  }, [camara]);

  const getEstadoDisplay = (estado: string) => {
    switch (estado) {
      case 'ACTIVA':
        return 'online';
      case 'INACTIVA':
        return 'offline';
      case 'MANTENIMIENTO':
        return 'maintenance';
      case 'FALLA':
        return 'error';
      case 'DESCONECTADA':
        return 'disconnected';
      default:
        return 'unknown';
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

  const estadoDisplay = camara ? getEstadoDisplay(camara.estado) : 'unknown';
  const tipoDisplay = camara ? getTipoDisplay(camara.tipo) : '';
  const hasActiveIntelligence = camara?.modelos_ia?.some(m => m.activo);

  return (
    <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-3">
          {/* Botón para mostrar/ocultar lista de cámaras en móvil */}
          {setSidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Mostrar/Ocultar lista de cámaras"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <h2 className="text-lg sm:text-xl font-semibold">
            {camara?.nombre || 'Sin cámara seleccionada'}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {camara && (
            <>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                camara.estado === 'ACTIVA' 
                  ? 'bg-green-100 text-green-800' 
                  : camara.estado === 'INACTIVA'
                  ? 'bg-gray-100 text-gray-800'
                  : camara.estado === 'MANTENIMIENTO'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`h-1.5 w-1.5 rounded-full mr-1 ${getStatusColor(camara.estado)}`}></div>
                {camara.estado}
              </span>
              <span className="text-xs text-gray-400">
                {tipoDisplay}
              </span>
              {onEditCamera && (
                <button
                  onClick={() => onEditCamera(camara)}
                  className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                  title="Configurar cámara"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
              {hasActiveIntelligence && (
                <div 
                  className="flex items-center space-x-1 text-blue-400"
                  title={isDetecting ? 'Inteligencia Artificial activa' : 'IA configurada'}
                >
                  <Cpu className={`h-4 w-4 ${isDetecting ? 'animate-pulse' : ''}`} />
                  {intelligenceError && 
                    <div title={intelligenceError}>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                  }
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-3 sm:mb-4 relative overflow-hidden">
        {camara && camara.estado === 'ACTIVA' ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted={isMuted}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </>
        ) : camara ? (
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-red-500" />
            <p className="text-gray-400 text-sm sm:text-base">
              Cámara {camara.estado.toLowerCase()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{camara.ubicacion}</p>
          </div>
        ) : (
          <div className="text-center">
            <Camera className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-sm sm:text-base">Selecciona una cámara</p>
            <p className="text-xs text-gray-500 mt-1">No hay cámara seleccionada</p>
          </div>
        )}
        
        {camara && camara.estado === 'ACTIVA' && (
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:right-2 sm:left-4 sm:right-4 bg-black bg-opacity-50 rounded-lg p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button 
                  onClick={() => setIsRecording(!isRecording)}
                  className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors"
                  title={isRecording ? 'Pausar grabación' : 'Iniciar grabación'}
                >
                  {isRecording ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
                <button 
                  className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors"
                  title="Detener grabación"
                >
                  <Square className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button 
                  className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors"
                  title="Reiniciar stream"
                >
                  <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button 
                  className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors"
                  title="Alejar"
                >
                  <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button 
                  className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors"
                  title="Acercar"
                >
                  <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors"
                  title={isMuted ? 'Activar audio' : 'Silenciar audio'}
                >
                  {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Información adicional de la cámara */}
      {camara && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-gray-700 p-2 rounded">
            <p className="text-gray-400">Ubicación</p>
            <p className="font-medium">{camara.ubicacion}</p>
          </div>
          <div className="bg-gray-700 p-2 rounded">
            <p className="text-gray-400">Tipo</p>
            <p className="font-medium">{tipoDisplay}</p>
          </div>
          <div className="bg-gray-700 p-2 rounded">
            <p className="text-gray-400">Grabación</p>
            <p className="font-medium">{camara.grabacion_activa ? 'Activa' : 'Inactiva'}</p>
          </div>
          <div className="bg-gray-700 p-2 rounded">
            <p className="text-gray-400">Modelos IA</p>
            <p className="font-medium">
              {camara.modelos_ia?.length || 0} activos
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFeed; 