import { useState, useRef, useCallback, useEffect } from 'react';
import { DetectionService } from '@/services/detection';
import { DetectionResult } from '@/types/facial-detection';

interface UseDetectionStreamOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  shouldRun: boolean;
}

export const useFacialDetectionStream = ({ videoRef, shouldRun }: UseDetectionStreamOptions) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<any[]>([]);
  const detectionServiceRef = useRef<DetectionService | null>(null);
  const animationFrameRef = useRef<number>(0);
  const isDetectingRef = useRef(isDetecting);
  isDetectingRef.current = isDetecting;

  useEffect(() => {
    if (shouldRun && !detectionServiceRef.current) {
      detectionServiceRef.current = new DetectionService();
    } else if (!shouldRun) {
      detectionServiceRef.current = null;
    }
  }, [shouldRun]);

  const processFrame = useCallback(async () => {
    if (!isDetectingRef.current || !videoRef.current || !detectionServiceRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (videoRef.current.readyState >= 2) {
      try {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = videoRef.current.videoWidth;
        tempCanvas.height = videoRef.current.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
          tempCtx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
          const result: DetectionResult = await detectionServiceRef.current.detect(tempCanvas);
          
          if (result && result.result) {
            setDetectedFaces(result.result);
          } else {
            setDetectedFaces([]);
          }
        }
      } catch (err) {
        // Silently fail to avoid console spam on minor detection errors
      }
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [videoRef]);

  const start = useCallback(() => {
    if (isDetecting) return;
    setIsDetecting(true);
    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [isDetecting, processFrame]);

  const stop = useCallback(() => {
    if (!isDetecting) return;
    setIsDetecting(false);
    cancelAnimationFrame(animationFrameRef.current);
    setDetectedFaces([]);
  }, [isDetecting]);

  useEffect(() => {
    if (shouldRun) {
      start();
    } else {
      stop();
    }
    return () => {
      stop();
    };
  }, [shouldRun, start, stop]);

  return { detectedFaces, isDetecting };
}; 