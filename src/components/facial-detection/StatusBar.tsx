import { ServiceStatus } from '@/types/facial-detection';

interface StatusBarProps {
  serviceStatus: ServiceStatus;
  isDetecting: boolean;
  fps: number;
  displayInfo: any;
  isCapturing: boolean;
  capturedFaces: any[];
}

export const StatusBar = ({
  serviceStatus,
  isDetecting,
  fps,
  displayInfo,
  isCapturing,
  capturedFaces
}: StatusBarProps) => {
  const getStatusColor = () => {
    switch (serviceStatus) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'checking': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (serviceStatus) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'checking': return '🟡';
      default: return '⚪';
    }
  };

  return (
    <div className="mb-4 flex gap-4 text-sm flex-wrap">
      <span className={`px-2 py-1 rounded ${getStatusColor()}`}>
        {getStatusIcon()} CompreFace: {serviceStatus === 'checking' ? 'Verificando...' : serviceStatus === 'online' ? 'Conectado' : 'Desconectado'}
      </span>
      
      <span className={`px-2 py-1 rounded ${isDetecting ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
        {isDetecting ? '🟢 Detectando' : '⭕ Detenido'}
      </span>
      
      {isDetecting && (
        <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
          📊 {fps} FPS
        </span>
      )}
      
      {displayInfo?.result?.length ? (
        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">
          👤 {displayInfo.result.length} rostro(s)
        </span>
      ) : null}

      {isCapturing && (
        <span className="px-2 py-1 rounded bg-purple-100 text-purple-800">
          📸 Capturando...
        </span>
      )}

      {capturedFaces.length > 0 && (
        <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-800">
          📁 {capturedFaces.length} captura(s)
        </span>
      )}
    </div>
  );
}; 