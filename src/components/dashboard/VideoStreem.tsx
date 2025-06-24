'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertTriangle, Play, Square, RotateCcw, Cpu, Settings } from 'lucide-react';
import { createEvento } from '@/services/evento';
//import { createEvento } from "../../lib/api-detection";

interface DetectionInfo {
  intruder_detected: boolean;
  locations: [number, number][];
  boxes: [number, number, number, number][];
  frame: string;
  restricted_zone: [number, number][];
  error?: string;
}

const VideoStream: React.FC = () => {
  const videoRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState('Listo para iniciar');
  const [isProcessing, setIsProcessing] = useState(false);
  const [intruderDetected, setIntruderDetected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const startCamera = () => {
    if (isProcessing) return;

    setStatus('Conectando a cámara...');
    setIsProcessing(true);

    // Conectar al WebSocket para la cámara
    connectWebSocket('ws://localhost:8001/ws/camera');
  };

  const connectWebSocket = (url: string) => {
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      setStatus('Conectado al WebSocket');
    };

    wsRef.current.onmessage = async (event) => {
      const data: DetectionInfo = JSON.parse(event.data);

      if (data.error) {
        setStatus(`Error: ${data.error}`);
        stopProcessing();
        return;
      }

      if(data.intruder_detected){        
        const datos = {
          camaraModeloIAId: 2,
          tipo_evento: 'persona_no_autorizada',
          confianza: 0.8,
          descripcion: 'persona ingreso a un area no permitida',
          datos_deteccion: {data:data.intruder_detected},
          imagen_captura: '',
          estado: 'pendiente',
          //procesado: false,
          fecha_deteccion: new Date().toISOString(),
          //fecha_procesamiento: new Date().toISOString(),
          //administrador_id: 2
        };
        console.log('intruso detectado');    
        await createEvento(datos);        

        setIntruderDetected(true); // <-- Aquí activamos la alerta visual
        // Hacer que desaparezca en 5 segundos
        setTimeout(() => {
          setIntruderDetected(false);
        }, 5000);
      }
      
      // Actualizar la imagen
      if (videoRef.current) {
        videoRef.current.src = `data:image/jpeg;base64,${data.frame}`;
      }

      // Dibujar detecciones y zona restringida en el canvas
      if (canvasRef.current && videoRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          // Ajustar el tamaño del canvas
          canvasRef.current.width = videoRef.current.width;
          canvasRef.current.height = videoRef.current.height;

          // Limpiar canvas
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Dibujar zona restringida
          ctx.beginPath();
          ctx.strokeStyle = 'blue';
          ctx.lineWidth = 2;
          data.restricted_zone.forEach(([x, y], index) => {
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
          ctx.stroke();

          // Dibujar cuadros delimitadores
          data.boxes.forEach(([x1, y1, x2, y2]) => {
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 2;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

            // Dibujar texto si hay intruso
            if (data.intruder_detected) {
              ctx.fillStyle = 'red';
              ctx.font = '20px Arial';
              ctx.fillText('Intruder Detected', x1, y1 - 10);
            }
          });
        }
      }
    };

    wsRef.current.onclose = () => {
      setStatus('Conexión cerrada');
      setIsProcessing(false);
      wsRef.current = null;
    };

    wsRef.current.onerror = (e) => {
      console.error('WebSocket error:', e);
      setStatus('Error ocurrido');
      setIsProcessing(false);
      wsRef.current = null;
    };
  };

  const stopProcessing = () => {
    if (wsRef.current) {
      wsRef.current.send('stop'); // Enviar mensaje de detención
      wsRef.current.close(); // Cerrar WebSocket
      wsRef.current = null;
      setStatus('Procesamiento detenido');
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      stopProcessing(); // Limpiar al desmontar el componente
    };
  }, []);

  const getStatusColor = () => {
    if (status.includes('Error') || status.includes('cerrada')) return 'bg-red-500';
    if (status.includes('Conectado')) return 'bg-green-500';
    if (status.includes('Conectando')) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-3">
          {/*<h2 className="text-lg sm:text-xl font-semibold">
            Detección de Video en Tiempo Real
          </h2>*/}          
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status.includes('Conectado') 
              ? 'bg-green-100 text-green-800' 
              : status.includes('Error') || status.includes('cerrada')
              ? 'bg-red-100 text-red-800'
              : status.includes('Conectando')
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            <div className={`h-1.5 w-1.5 rounded-full mr-1 ${getStatusColor()}`}></div>
            {status}
          </span>
          <div className="flex items-center space-x-1 text-blue-400">
            <Cpu className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Controles de cámara */}
      <div className="bg-gray-700 p-3 rounded-lg mb-4">
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <Camera className="h-4 w-4 mr-2" />
          Webcam
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={startCamera} 
            disabled={isProcessing}
            className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
            title="Iniciar cámara web"
          >
            <Play className="h-4 w-4" />
          </button>
          <button 
            onClick={stopProcessing} 
            disabled={!isProcessing}
            className="p-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
            title="Detener procesamiento"
          >
            <Square className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Área de video */}
      <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-3 sm:mb-4 relative overflow-hidden">
        {isProcessing ? (
          <>
            <img 
              ref={videoRef} 
              alt="Video Stream" 
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </>
        ) : (
          <div className="text-center">
            <Camera className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-sm sm:text-base">Inicia la cámara web</p>
            <p className="text-xs text-gray-500 mt-1">Haz clic en el botón de inicio</p>
          </div>
        )}

        {/* Controles de video */}
        {isProcessing && (
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:right-2 sm:left-4 sm:right-4 bg-black bg-opacity-50 rounded-lg p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button 
                  onClick={stopProcessing}
                  className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors"
                  title="Detener procesamiento"
                >
                  <Square className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button 
                  onClick={() => {
                    stopProcessing();
                    setTimeout(() => {
                      startCamera();
                    }, 100);
                  }}
                  className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors"
                  title="Reiniciar stream"
                >
                  <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors"
                  title={isMuted ? 'Activar audio' : 'Silenciar audio'}
                >
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alerta de intruso */}
      {intruderDetected && (
        <div className="bg-red-600 text-white p-3 rounded-lg mb-4 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span className="font-semibold">¡Alerta! Intruso detectado.</span>
        </div>
      )}

      {/* Información del sistema */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-gray-700 p-2 rounded">
          <p className="text-gray-400">Estado</p>
          <p className="font-medium">{isProcessing ? 'Procesando' : 'Inactivo'}</p>
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <p className="text-gray-400">Tipo</p>
          <p className="font-medium">Webcam</p>
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <p className="text-gray-400">Detección</p>
          <p className="font-medium">{intruderDetected ? 'Activa' : 'Inactiva'}</p>
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <p className="text-gray-400">IA</p>
          <p className="font-medium">Activa</p>
        </div>
      </div>
    </div>
  );
};

export default VideoStream;