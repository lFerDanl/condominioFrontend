import React, { useRef, useEffect, useState } from 'react';
import { Camera, Eye, Menu, EyeOff } from 'lucide-react';
import { Camara } from '../../../services/camaras';
import { useCameraIntelligence } from '@/hooks/useCameraIntelligence';

type RecognitionVideoFeedProps = {
  camera: Camara | null;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  isRecognitionEnabled: boolean;
  onToggleRecognition: () => void;
};

const RecognitionVideoFeed: React.FC<RecognitionVideoFeedProps> = ({
  camera,
  sidebarOpen,
  setSidebarOpen,
  isRecognitionEnabled,
  onToggleRecognition,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useCameraIntelligence({
    camara: camera,
    videoRef,
    canvasRef,
    isRecognitionEnabled,
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    const currentVideoRef = videoRef.current;

    if (camera?.tipo === 'WEBCAM' && currentVideoRef) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (currentVideoRef) {
            currentVideoRef.srcObject = stream;
          }
        })
        .catch(err => {
          console.error('Error accediendo a la webcam:', err);
        });
    } else if (currentVideoRef?.srcObject) {
      // Limpiar stream si no es webcam
      (currentVideoRef.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      currentVideoRef.srcObject = null;
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [camera]);

  const recognitionActive = camera?.estado === 'ACTIVA';

  return (
    <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-3">
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
            {camera?.nombre || 'Seleccionar Cámara'}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {camera && (
            <>
              <button
                onClick={onToggleRecognition}
                className={`p-2 rounded-full transition-colors ${
                  isRecognitionEnabled
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                title={isRecognitionEnabled ? 'Desactivar Reconocimiento' : 'Activar Reconocimiento'}
              >
                {isRecognitionEnabled ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                camera.estado === 'ACTIVA' 
                  ? 'bg-green-100 text-green-800' 
                  : camera.estado === 'INACTIVA'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {camera.estado}
              </span>
            </>
          )}
        </div>
      </div>
      
      <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-3 sm:mb-4 relative overflow-hidden">
        {camera ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </>
        ) : (
          <div className="text-center">
            <Camera className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400 text-sm sm:text-base">Seleccione una cámara para iniciar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecognitionVideoFeed; 