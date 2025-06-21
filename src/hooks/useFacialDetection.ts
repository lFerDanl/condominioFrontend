// useFacialDetection.ts - Versión corregida con re-captura después del bloqueo

import { useEffect, useRef, useState, useCallback } from 'react';
import { DetectionService } from '@/services/detection';
import { VerificationService } from '@/services/verification';
import { DetectionResult, CapturedFace, ServiceStatus } from '@/types/facial-detection';

export const useFacialDetection = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectionServiceRef = useRef<DetectionService | null>(null);
  const verificationServiceRef = useRef<VerificationService | null>(null);
  
  const resultRef = useRef<DetectionResult | null>(null);
  const [displayInfo, setDisplayInfo] = useState<DetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>('checking');
  const [capturedFaces, setCapturedFaces] = useState<CapturedFace[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  // Estados adicionales para debugging
  const [verificationServiceReady, setVerificationServiceReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Usar ref para mantener la referencia actual de capturedFaces
  const capturedFacesRef = useRef<CapturedFace[]>([]);

  // Configuración para la verificación anti-duplicados
  const [verificationThreshold] = useState(0.85); // Umbral de similitud (85%)
  const [blockDuration] = useState(30000); // 30 segundos de bloqueo
  const [minTimeBetweenCaptures] = useState(5000); // 5 segundos mínimo entre capturas

  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCaptureTimeRef = useRef<number>(0);
  // CORREGIDO: Cambiar estructura del caché para incluir el último tiempo de captura
  const verificationCacheRef = useRef<Map<string, { 
    expiry: number; 
    blocked: boolean;
    lastCaptureTime: number; // Nuevo campo para rastrear última captura
  }>>(new Map());
  const animationFrameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);

  // Actualizar la referencia cuando cambie el estado
  useEffect(() => {
    capturedFacesRef.current = capturedFaces;
    console.log(`📊 Estado actualizado: ${capturedFaces.length} rostros capturados`);
  }, [capturedFaces]);

  // Función para limpiar caché expirado
  const cleanupVerificationCache = useCallback(() => {
    const now = Date.now();
    const cache = verificationCacheRef.current;
    
    for (const [key, value] of cache.entries()) {
      if (now > value.expiry) {
        cache.delete(key);
        console.log(`🧹 Caché expirado eliminado: ${key} - ahora puede ser re-capturado`);
      }
    }
  }, []);

  // Función para extraer imagen de rostro del canvas
  const extractFaceImage = useCallback((canvas: HTMLCanvasElement, detection: any): string => {
    const box = detection.box;
    const scaleX = canvas.width / videoRef.current!.videoWidth;
    const scaleY = canvas.height / videoRef.current!.videoHeight;
    
    const x = Math.max(0, (box.x_min * scaleX) - 20);
    const y = Math.max(0, (box.y_min * scaleY) - 20);
    const width = Math.min(canvas.width - x, ((box.x_max - box.x_min) * scaleX) + 40);
    const height = Math.min(canvas.height - y, ((box.y_max - box.y_min) * scaleY) + 40);
    
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = width;
    faceCanvas.height = height;
    const faceCtx = faceCanvas.getContext('2d');
    
    if (!faceCtx) return '';
    
    faceCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
    return faceCanvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // CORREGIDO: Nueva lógica para permitir re-captura después del período de bloqueo
  const isDuplicateFace = useCallback(async (newFaceImage: string): Promise<{ isDuplicate: boolean; matchedFaceId?: string }> => {
    console.log('=== INICIANDO VERIFICACIÓN DE DUPLICADOS ===');
    console.log('verificationServiceRef.current:', !!verificationServiceRef.current);
    console.log('capturedFacesRef.current.length:', capturedFacesRef.current.length);
    console.log('verificationServiceReady:', verificationServiceReady);

    // Verificar si el servicio está inicializado Y listo
    if (!verificationServiceRef.current || !verificationServiceReady) {
      console.log('❌ Servicio de verificación no está listo');
      setDebugInfo('Servicio de verificación no inicializado');
      return { isDuplicate: false }; // Permitir captura si no hay servicio
    }

    if (capturedFacesRef.current.length === 0) {
      console.log('✅ No hay rostros capturados previos (ref)');
      setDebugInfo('Primera captura - no hay comparaciones');
      return { isDuplicate: false };
    }

    try {
      // Limpiar caché expirado ANTES de verificar
      cleanupVerificationCache();

      console.log(`🔍 Comparando con ${capturedFacesRef.current.length} rostros capturados (ref)`);
      
      const facesToCheck = capturedFacesRef.current.slice(0, 10);
      const now = Date.now();
      
      for (let i = 0; i < facesToCheck.length; i++) {
        const capturedFace = facesToCheck[i];
        const cacheKey = `${capturedFace.id}`;
        const cached = verificationCacheRef.current.get(cacheKey);
        
        console.log(`📊 Verificando contra rostro ${i + 1}/${facesToCheck.length} - ID: ${capturedFace.id}`);
        
        // CORREGIDO: Si está en caché y el bloqueo NO ha expirado
        if (cached?.blocked && now < cached.expiry) {
          console.log(`🚫 ROSTRO AÚN BLOQUEADO - ID: ${capturedFace.id}, expira en ${Math.round((cached.expiry - now) / 1000)}s`);
          setDebugInfo(`BLOQUEADO: ${Math.round((cached.expiry - now) / 1000)}s restantes`);
          return { isDuplicate: true, matchedFaceId: capturedFace.id };
        }

        // NUEVO: Si el bloqueo expiró, eliminar la entrada del caché para permitir nueva verificación
        if (cached?.blocked && now >= cached.expiry) {
          console.log(`🔓 BLOQUEO EXPIRADO para rostro ${capturedFace.id} - eliminando del caché`);
          verificationCacheRef.current.delete(cacheKey);
        }

        try {
          console.log(`🔄 Llamando a verificationService.verifySimple...`);
          
          const verificationResult = await verificationServiceRef.current.verifySimple(
            newFaceImage, 
            capturedFace.image
          );

          console.log('📋 Resultado de verificación:', verificationResult);

          if (verificationResult && verificationResult.result && verificationResult.result.length > 0) {
            const firstResult = verificationResult.result[0];
            
            if (firstResult.face_matches && firstResult.face_matches.length > 0) {
              const similarity = firstResult.face_matches[0].similarity;
              console.log(`🎯 Similitud encontrada: ${(similarity * 100).toFixed(2)}% (umbral: ${(verificationThreshold * 100).toFixed(1)}%)`);
              
              setDebugInfo(`Similitud: ${(similarity * 100).toFixed(1)}% vs rostro ${i + 1}`);
              
              if (similarity >= verificationThreshold) {
                console.log(`🎯 ROSTRO SIMILAR DETECTADO con ${(similarity * 100).toFixed(2)}% similitud`);
                
                // CORREGIDO: Verificar si hay un bloqueo activo en el caché
                const currentTime = Date.now();
                const cacheEntry = verificationCacheRef.current.get(cacheKey);
                
                if (cacheEntry && cacheEntry.blocked && currentTime < cacheEntry.expiry) {
                  // Hay un bloqueo activo
                  const remainingTime = Math.round((cacheEntry.expiry - currentTime) / 1000);
                  console.log(`🚫 BLOQUEO ACTIVO - ${remainingTime}s restantes`);
                  setDebugInfo(`BLOQUEADO: ${remainingTime}s restantes`);
                  return { isDuplicate: true, matchedFaceId: capturedFace.id };
                } else {
                  // No hay bloqueo activo o expiró - permitir re-captura
                  console.log(`✅ ROSTRO CONOCIDO - BLOQUEO EXPIRADO - permitiendo re-captura`);
                  setDebugInfo(`RE-CAPTURA PERMITIDA: bloqueo expirado`);
                  
                  // Limpiar entrada expirada del caché
                  if (cacheEntry) {
                    verificationCacheRef.current.delete(cacheKey);
                    console.log(`🧹 Limpiando entrada expirada del caché: ${cacheKey}`);
                  }
                  
                  return { isDuplicate: false, matchedFaceId: capturedFace.id };
                }
              } else {
                console.log(`✅ Similitud por debajo del umbral: ${(similarity * 100).toFixed(2)}%`);
              }
            } else {
              console.log('⚠️ No se encontraron face_matches en el resultado');
            }
          } else {
            console.log('⚠️ Resultado de verificación vacío o inválido');
          }
        } catch (verificationError) {
          console.error(`❌ Error en verificación con rostro ${capturedFace.id}:`, verificationError);
          setDebugInfo(`Error: ${verificationError instanceof Error ? verificationError.message : 'Unknown error'}`);
        }
      }

      console.log('✅ No se encontraron duplicados o todos los bloqueos expiraron');
      setDebugInfo('No duplicado - captura permitida');
      return { isDuplicate: false };
      
    } catch (error) {
      console.error('❌ Error general en verificación de duplicados:', error);
      setDebugInfo(`Error general: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isDuplicate: false };
    }
  }, [verificationThreshold, blockDuration, cleanupVerificationCache, verificationServiceReady]);

  // CORREGIDO: Función mejorada para capturar rostros detectados
  const captureDetectedFace = useCallback(async (detection: any) => {
    if (!videoRef.current || !hiddenCanvasRef.current || isCapturing) {
      console.log('🚫 Captura bloqueada: video, canvas o ya capturando');
      return;
    }
    
    const now = Date.now();
    const timeSinceLastCapture = now - lastCaptureTimeRef.current;
    
    // Control de tiempo mínimo entre capturas
    if (timeSinceLastCapture < minTimeBetweenCaptures) {
      console.log(`⏰ Captura bloqueada por tiempo mínimo: ${timeSinceLastCapture}ms < ${minTimeBetweenCaptures}ms`);
      return;
    }
    
    console.log('🎬 INICIANDO CAPTURA DE ROSTRO');
    setIsCapturing(true);
    
    try {
      const canvas = hiddenCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.log('❌ No se pudo obtener contexto del canvas');
        return;
      }
      
      // Dibujar frame actual en canvas oculto
      ctx.drawImage(videoRef.current, 0, 0, 800, 600);
      
      // Extraer imagen del rostro
      const faceImage = extractFaceImage(canvas, detection);
      
      if (!faceImage) {
        console.warn('⚠️ No se pudo extraer imagen del rostro');
        return;
      }

      console.log('📸 Imagen del rostro extraída, verificando duplicados...');
      
      // CORREGIDO: Usar nueva función que retorna más información
      const duplicateCheck = await isDuplicateFace(faceImage);
      
      if (duplicateCheck.isDuplicate) {
        console.log('🚫 Rostro duplicado detectado, omitiendo captura');
        return;
      }

      // Crear objeto de rostro capturado
      const capturedFace: CapturedFace = {
        id: `face_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        image: faceImage,
        timestamp: new Date(),
        detectionInfo: {
          probability: detection.box.probability,
          gender: detection.gender?.value,
          age: detection.age,
          box: detection.box
        }
      };

      // CORREGIDO: Siempre agregar al caché con el nuevo ID del rostro capturado
      // Esto asegura que cada captura tenga su propio período de bloqueo
      verificationCacheRef.current.set(capturedFace.id, {
        expiry: now + blockDuration,
        blocked: true,
        lastCaptureTime: now
      });

      // Si es una re-captura, también limpiar la entrada anterior del caché
      if (duplicateCheck.matchedFaceId && duplicateCheck.matchedFaceId !== capturedFace.id) {
        console.log(`🔄 RE-CAPTURA detectada - limpiando caché anterior: ${duplicateCheck.matchedFaceId}`);
        verificationCacheRef.current.delete(duplicateCheck.matchedFaceId);
      }

      console.log(`🔒 NUEVO BLOQUEO iniciado para ${capturedFace.id} por ${blockDuration/1000} segundos`);
      
      // Log del estado actual del caché
      console.log(`📊 ESTADO DEL CACHÉ:`, {
        totalEntries: verificationCacheRef.current.size,
        activeBlocks: getActiveBlocks().length,
        newBlockExpiry: new Date(now + blockDuration).toLocaleTimeString()
      });
      
      // Actualizar tanto el estado como la referencia
      setCapturedFaces(prev => {
        const newFaces = [capturedFace, ...prev].slice(0, 10);
        capturedFacesRef.current = newFaces;
        console.log(`✅ ROSTRO CAPTURADO EXITOSAMENTE. Total: ${newFaces.length}`);
        return newFaces;
      });
      
      lastCaptureTimeRef.current = now;
      setDebugInfo(`Capturado: ${capturedFace.id}`);
      
    } catch (error) {
      console.error('❌ Error al capturar rostro:', error);
      setDebugInfo(`Error captura: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCapturing(false);
    }
  }, [isDuplicateFace, extractFaceImage, isCapturing, minTimeBetweenCaptures, blockDuration]);

  // NUEVO: Función para obtener información de bloqueos activos
  const getActiveBlocks = useCallback(() => {
    const now = Date.now();
    const activeBlocks: Array<{id: string, remainingTime: number}> = [];
    
    for (const [id, cache] of verificationCacheRef.current.entries()) {
      if (cache.blocked && now < cache.expiry) {
        activeBlocks.push({
          id,
          remainingTime: Math.round((cache.expiry - now) / 1000)
        });
      }
    }
    
    return activeBlocks;
  }, []);

  // Función para limpiar capturas y resetear caché
  const clearCapturedFaces = useCallback(() => {
    setCapturedFaces([]);
    capturedFacesRef.current = [];
    verificationCacheRef.current.clear();
    lastCaptureTimeRef.current = 0;
    setDebugInfo('Capturas limpiadas');
    console.log('🧹 Capturas y caché de verificación limpiados');
  }, []);

  // Función para verificar estado de servicios
  const checkServiceHealth = async () => {
    if (!detectionServiceRef.current) return;
    
    setServiceStatus('checking');
    try {
      const isHealthy = await detectionServiceRef.current.healthCheck();
      setServiceStatus(isHealthy ? 'online' : 'offline');
      if (!isHealthy) {
        setError('⚠️ No se puede conectar con CompreFace. Asegúrate de que esté ejecutándose en localhost:8000');
      } else {
        setError(null);
      }
    } catch (error) {
      setServiceStatus('offline');
      setError('❌ Error al verificar el estado de CompreFace');
    }
  };

  // Función para inicializar servicio de verificación
  const initializeVerificationService = useCallback(async () => {
    try {
      console.log('🔧 Inicializando servicio de verificación...');
      
      if (!verificationServiceRef.current) {
        verificationServiceRef.current = new VerificationService();
      }

      const healthCheck = await verificationServiceRef.current.healthCheck?.();
      
      if (healthCheck !== false) {
        setVerificationServiceReady(true);
        console.log('✅ Servicio de verificación inicializado correctamente');
        setDebugInfo('Servicio verificación: LISTO');
      } else {
        console.log('⚠️ Servicio de verificación no está disponible');
        setDebugInfo('Servicio verificación: NO DISPONIBLE');
      }
    } catch (error) {
      console.error('❌ Error inicializando servicio de verificación:', error);
      setDebugInfo(`Error init: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setVerificationServiceReady(false);
    }
  }, []);

  // Función para iniciar cámara
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 800, 
          height: 600,
          frameRate: { ideal: 30 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (err: any) {
      setError(`Error al acceder a la cámara: ${err.message}`);
    }
  };

  // Función de detección de rostros
  const detectFaces = useCallback(async (canvas: HTMLCanvasElement) => {
    if (isProcessingRef.current || !detectionServiceRef.current) return;
    
    isProcessingRef.current = true;
    
    try {
      const data = await detectionServiceRef.current.detectFromCanvas(canvas);
      
      resultRef.current = data;
      setDisplayInfo(data);
      
      if (data.result && data.result.length > 0) {
        const bestDetection = data.result.reduce((best, current) => 
          current.box.probability > best.box.probability ? current : best
        );
        
        if (bestDetection.box.probability >= 0.8) {
          console.log(`🎯 Rostro detectado con ${(bestDetection.box.probability * 100).toFixed(1)}% de confianza`);
          setTimeout(() => captureDetectedFace(bestDetection), 0);
        }
        
        if (captureTimeoutRef.current) {
          clearTimeout(captureTimeoutRef.current);
          captureTimeoutRef.current = null;
        }
      }
      
    } catch (error: any) {
      console.error('Detection error:', error);
      if (error.message.includes('Failed to fetch')) {
        setServiceStatus('offline');
        setError('🔌 Conexión perdida con CompreFace. Verificando...');
        setTimeout(checkServiceHealth, 2000);
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [captureDetectedFace]);

  // Función de procesamiento de frames
  const processFrame = useCallback(() => {
    if (!videoRef.current || !hiddenCanvasRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    const displayCanvas = canvasRef.current;
    
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    const hiddenCtx = hiddenCanvas.getContext('2d');
    const displayCtx = displayCanvas.getContext('2d');
    
    if (!hiddenCtx || !displayCtx) {
      return;
    }

    hiddenCtx.drawImage(video, 0, 0, 800, 600);
    displayCtx.clearRect(0, 0, 800, 600);

    frameCountRef.current++;
    
    if (frameCountRef.current % 5 === 0 && !isProcessingRef.current && serviceStatus === 'online') {
      detectFaces(hiddenCanvas);
    }

    const currentResult = resultRef.current;
    
    if (currentResult?.result?.length) {
      currentResult.result.forEach((detection) => {
        const box = detection.box;

        const scaleX = displayCanvas.width / video.videoWidth;
        const scaleY = displayCanvas.height / video.videoHeight;

        const x = box.x_min * scaleX;
        const y = box.y_min * scaleY;
        const width = (box.x_max - box.x_min) * scaleX;
        const height = (box.y_max - box.y_min) * scaleY;

        displayCtx.strokeStyle = '#00ff00';
        displayCtx.lineWidth = 4;
        displayCtx.setLineDash([]);
        displayCtx.strokeRect(x, y, width, height);

        displayCtx.font = 'bold 18px Arial';
        
        const info = [
          `${(box.probability * 100).toFixed(1)}%`,
          detection.gender?.value,
          detection.age ? `${detection.age.low}-${detection.age.high}` : null
        ].filter(Boolean).join(' | ');

        const textY = y > 30 ? y - 10 : y + height + 25;
        
        const textMetrics = displayCtx.measureText(info);
        const textWidth = textMetrics.width;
        displayCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        displayCtx.fillRect(x - 4, textY - 22, textWidth + 8, 28);
        
        displayCtx.fillStyle = '#00ff00';
        displayCtx.fillText(info, x, textY);
      });
    }

    const now = performance.now();
    if (now - lastFrameTimeRef.current >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / (now - lastFrameTimeRef.current)));
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }
  }, [detectFaces, serviceStatus]);

  // Función para iniciar detección en tiempo real
  const startRealTimeDetection = useCallback(() => {
    if (isDetecting || serviceStatus !== 'online') return;
    
    setIsDetecting(true);
    setError(null);
    frameCountRef.current = 0;
    lastFrameTimeRef.current = performance.now();

    const animate = () => {
      processFrame();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    console.log('🚀 Detección en tiempo real iniciada con re-captura después de bloqueo');
  }, [isDetecting, processFrame, serviceStatus]);

  // Función para detener detección
  const stopRealTimeDetection = useCallback(() => {
    setIsDetecting(false);
    isProcessingRef.current = false;
    
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, 800, 600);
    }
    
    resultRef.current = null;
    setDisplayInfo(null);
    setFps(0);
    setIsCapturing(false);
    
    console.log('⏹️ Detección en tiempo real detenida');
  }, []);

  // Limpieza automática de caché cada minuto
  useEffect(() => {
    const cleanupInterval = setInterval(cleanupVerificationCache, 60000);
    return () => clearInterval(cleanupInterval);
  }, [cleanupVerificationCache]);

  // Inicialización de servicios
  useEffect(() => {
    console.log('🔧 Inicializando servicios...');
    detectionServiceRef.current = new DetectionService();
    initializeVerificationService();
    checkServiceHealth();
  }, [initializeVerificationService]);

  // Inicializar cámara
  useEffect(() => {
    startCamera();
    
    return () => {
      stopRealTimeDetection();
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
      }
    };
  }, [stopRealTimeDetection]);

  return {
    videoRef,
    canvasRef,
    hiddenCanvasRef,
    displayInfo,
    isDetecting,
    error,
    fps,
    serviceStatus,
    capturedFaces,
    isCapturing,
    startRealTimeDetection,
    stopRealTimeDetection,
    startCamera,
    checkServiceHealth,
    clearCapturedFaces,
    detectionServiceRef,
    verificationStats: {
      threshold: verificationThreshold,
      blockDuration: blockDuration / 1000,
      cacheSize: verificationCacheRef.current.size,
      serviceReady: verificationServiceReady,
      debugInfo: debugInfo,
      capturedCount: capturedFacesRef.current.length,
      activeBlocks: getActiveBlocks() // NUEVO: Información de bloqueos activos
    }
  };
};