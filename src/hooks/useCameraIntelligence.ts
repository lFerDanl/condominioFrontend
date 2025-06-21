import { useState, useRef, useCallback, useEffect } from 'react';
import { Camara } from '@/services/camaras';
import { useFacialDetectionStream } from './useFacialDetectionStream';
import { useFacialRecognitionStream } from './useFacialRecognitionStream';

interface CameraIntelligenceOptions {
  camara: Camara | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isRecognitionEnabled?: boolean;
}

export const useCameraIntelligence = ({
  camara,
  videoRef,
  canvasRef,
  isRecognitionEnabled = false,
}: CameraIntelligenceOptions) => {
  const [error, setError] = useState<string | null>(null);
  const activeModels = camara?.modelos_ia?.filter(m => m.activo && m.modeloIA) || [];
  const hasDetectionModel = activeModels.some(m => m.modeloIA?.tipo === 'DETECCION_FACIAL');

  const { detectedFaces, isDetecting } = useFacialDetectionStream({
    videoRef,
    shouldRun: hasDetectionModel || isRecognitionEnabled,
  });

  const { recognizingFaces, recognitionResults } = useFacialRecognitionStream({
    detectedFaces,
    videoRef,
    canvasRef,
    shouldRun: isRecognitionEnabled,
  });
  
  const drawDetections = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    detectedFaces.forEach(detection => {
      const { box } = detection;
      const scaleX = canvas.width / video.videoWidth;
      const scaleY = canvas.height / video.videoHeight;
      const x = box.x_min * scaleX;
      const y = box.y_min * scaleY;
      const width = (box.x_max - box.x_min) * scaleX;
      const height = (box.y_max - box.y_min) * scaleY;

      const isRecognizing = recognizingFaces.some(r => Math.abs(r.x_min - box.x_min) < 5);
      const recognizedPerson = recognitionResults.find(r => 
        Math.abs(r.box.x_min - box.x_min) < 10 
      );

      if (recognizedPerson) {
        if (recognizedPerson.similarity >= 0.8) {
          ctx.strokeStyle = '#FFD700'; // Gold
          ctx.fillStyle = '#FFD700';
          const text = `${recognizedPerson.personName} (${(recognizedPerson.similarity * 100).toFixed(0)}%)`;
          ctx.fillText(text, x, y > 20 ? y - 10 : 20);
        } else {
          ctx.strokeStyle = '#FF0000'; // Red
          ctx.fillStyle = '#FF0000';
          ctx.fillText('Desconocido', x, y > 20 ? y - 10 : 20);
        }
        ctx.lineWidth = 3;
        ctx.font = '18px Arial';
      } else if (isRecognizing) {
        ctx.strokeStyle = '#00BFFF'; // Deep sky blue
        ctx.fillStyle = '#00BFFF';
        ctx.lineWidth = 2;
        ctx.font = '16px Arial';
        ctx.fillText('Reconociendo...', x, y > 10 ? y - 5 : 10);
      } else {
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#00FF00';
        ctx.font = '16px Arial';
        const text = `Rostro`;
        ctx.fillText(text, x, y > 10 ? y - 5 : 10);
      }

      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.stroke();
    });
  }, [detectedFaces, recognizingFaces, recognitionResults, canvasRef, videoRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!isRecognitionEnabled) {
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    drawDetections();
  }, [drawDetections, isRecognitionEnabled, canvasRef]);

  return {
    isDetecting,
    error,
  };
}; 