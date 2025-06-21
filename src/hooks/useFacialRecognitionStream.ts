import { useState, useRef, useCallback, useEffect } from 'react';
import { RecognitionService, RecognitionResult as RecognitionResultType } from '@/services/recognition';

interface RecognitionResult {
  personName: string;
  similarity: number;
  box: any;
}

interface UseRecognitionStreamOptions {
  detectedFaces: any[];
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  shouldRun: boolean;
}

export const useFacialRecognitionStream = ({
  detectedFaces,
  videoRef,
  canvasRef,
  shouldRun,
}: UseRecognitionStreamOptions) => {
  const [recognizingFaces, setRecognizingFaces] = useState<any[]>([]);
  const [recognitionResults, setRecognitionResults] = useState<RecognitionResult[]>([]);
  const recognitionServiceRef = useRef<RecognitionService | null>(null);
  const lastRecognitionTimeRef = useRef<number>(0);

  useEffect(() => {
    if (shouldRun && !recognitionServiceRef.current) {
      recognitionServiceRef.current = new RecognitionService();
    } else if (!shouldRun) {
      recognitionServiceRef.current = null;
    }
  }, [shouldRun]);
  
  const extractFaceImage = useCallback((canvas: HTMLCanvasElement, box: any): string => {
    const video = videoRef.current;
    if (!video) return '';

    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;
    
    const x = Math.max(0, (box.x_min * scaleX));
    const y = Math.max(0, (box.y_min * scaleY));
    const width = (box.x_max - box.x_min) * scaleX;
    const height = (box.y_max - box.y_min) * scaleY;
    
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = width;
    faceCanvas.height = height;
    const faceCtx = faceCanvas.getContext('2d');
    
    if (!faceCtx) return '';
    
    faceCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
    return faceCanvas.toDataURL('image/jpeg', 0.9);
  }, [videoRef]);

  const handleRecognition = useCallback(async (faceToRecognize: any) => {
    if (!recognitionServiceRef.current || !videoRef.current || !canvasRef.current) return;

    const now = Date.now();
    if (now - lastRecognitionTimeRef.current < 2000) { // Limit recognition calls
      return;
    }
    lastRecognitionTimeRef.current = now;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = videoRef.current.videoWidth;
    tempCanvas.height = videoRef.current.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCtx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);

    const faceImage = extractFaceImage(tempCanvas, faceToRecognize.box);
    if (!faceImage) return;

    setRecognizingFaces(prev => [...prev, faceToRecognize.box]);

    try {
      const result: RecognitionResultType = await recognitionServiceRef.current.recognize(faceImage);
      if (result.result && result.result.length > 0) {
        const face = result.result[0];
        if (face.subjects && face.subjects.length > 0) {
          const subject = face.subjects[0];
          const newResult = {
            personName: subject.subject,
            similarity: subject.similarity,
            box: faceToRecognize.box,
          };
          setRecognitionResults(prev => [...prev.filter(r => r.personName !== subject.subject), newResult]);

          setTimeout(() => {
            setRecognitionResults(prev => prev.filter(r => r.personName !== subject.subject));
          }, 5000);
        }
      }
    } catch (err) {
      console.error('Error en reconocimiento:', err);
    } finally {
      setRecognizingFaces(prev => prev.filter(b => b.x_min !== faceToRecognize.box.x_min));
    }
  }, [videoRef, canvasRef, extractFaceImage]);
  
  useEffect(() => {
      if (shouldRun && detectedFaces.length > 0) {
          const largestFace = detectedFaces.reduce((max, current) => {
              const maxArea = (max.box.x_max - max.box.x_min) * (max.box.y_max - max.box.y_min);
              const currentArea = (current.box.x_max - current.box.x_min) * (current.box.y_max - current.box.y_min);
              return currentArea > maxArea ? current : max;
          });
          handleRecognition(largestFace);
      }

  }, [detectedFaces, shouldRun, handleRecognition])

  return { recognizingFaces, recognitionResults };
}; 