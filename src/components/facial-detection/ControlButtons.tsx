interface ControlButtonsProps {
  isDetecting: boolean;
  serviceStatus: 'checking' | 'online' | 'offline';
  capturedFaces: any[];
  onStartDetection: () => void;
  onStopDetection: () => void;
  onStartCamera: () => void;
  onCheckHealth: () => void;
  onClearCaptures: () => void;
}

export const ControlButtons = ({
  isDetecting,
  serviceStatus,
  capturedFaces,
  onStartDetection,
  onStopDetection,
  onStartCamera,
  onCheckHealth,
  onClearCaptures
}: ControlButtonsProps) => {
  return (
    <div className="mt-4 space-x-2">
      <button 
        onClick={onStartDetection} 
        disabled={isDetecting || serviceStatus !== 'online'}
        className={`px-4 py-2 rounded text-white ${
          isDetecting || serviceStatus !== 'online'
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        🚀 Iniciar detección en tiempo real
      </button>
      
      <button 
        onClick={onStopDetection}
        disabled={!isDetecting}
        className={`px-4 py-2 rounded text-white ${
          !isDetecting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        ⏹️ Detener
      </button>
      
      <button 
        onClick={onStartCamera}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        📷 Reiniciar cámara
      </button>

      <button 
        onClick={onCheckHealth}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
      >
        🔄 Verificar CompreFace
      </button>

      <button 
        onClick={onClearCaptures}
        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
        disabled={capturedFaces.length === 0}
      >
        🗑️ Limpiar capturas ({capturedFaces.length})
      </button>
    </div>
  );
}; 