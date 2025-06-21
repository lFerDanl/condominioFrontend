// /app/page.tsx - Detección usando detection-service.ts

'use client';

import { useFacialDetection } from '@/hooks/useFacialDetection';
import { StatusBar } from '@/components/facial-detection/StatusBar';
import { ControlButtons } from '@/components/facial-detection/ControlButtons';
import { CapturedFaces } from '@/components/facial-detection/CapturedFaces';
import { ServiceInfo } from '@/components/facial-detection/ServiceInfo';
//import { VerificationInfo } from '@/components/VerificationInfo';

export default function Home() {
  const {
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
    detectionServiceRef
  } = useFacialDetection();

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Detección Facial en Tiempo Real</h1>
      
      <StatusBar
        serviceStatus={serviceStatus}
        isDetecting={isDetecting}
        fps={fps}
        displayInfo={displayInfo}
        isCapturing={isCapturing}
        capturedFaces={capturedFaces}
      />

      <div className="relative inline-block">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          muted
          width={800} 
          height={600} 
          className="border-2 border-gray-400 rounded-lg bg-black block"
        />
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ 
            width: '800px', 
            height: '600px',
            border: '2px solid transparent',
            borderRadius: '0.5rem'
          }}
        />
        <canvas
          ref={hiddenCanvasRef}
          width={800}
          height={600}
          style={{ display: 'none' }}
        />
      </div>

      <ControlButtons
        isDetecting={isDetecting}
        serviceStatus={serviceStatus}
        capturedFaces={capturedFaces}
        onStartDetection={startRealTimeDetection}
        onStopDetection={stopRealTimeDetection}
        onStartCamera={startCamera}
        onCheckHealth={checkServiceHealth}
        onClearCaptures={clearCapturedFaces}
      />

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {displayInfo?.result?.length ? (
        <div className="mt-4 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
          <h3 className="font-bold mb-3 text-blue-900 text-lg">📊 Información en Tiempo Real</h3>
          {displayInfo.result.map((face, index) => (
            <div key={index} className="flex flex-wrap gap-4 text-base mb-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                🎯 Confianza: {(face.box.probability * 100).toFixed(1)}%
              </span>
              {face.gender && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
                  👤 Género: {face.gender.value}
                </span>
              )}
              {face.age && (
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-semibold">
                  📅 Edad: {face.age.low}-{face.age.high} años
                </span>
              )}
              {face.execution_time && (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  ⏱️ Tiempo: {face.execution_time.detector.toFixed(0)}ms
                </span>
              )}
            </div>
          ))}
        </div>
      ) : isDetecting ? (
        <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <span className="text-yellow-800 font-semibold text-lg">🔍 Buscando rostros...</span>
        </div>
      ) : null}

      <CapturedFaces faces={capturedFaces} />
      <ServiceInfo service={detectionServiceRef.current} />

      <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm text-gray-700">
        <h4 className="font-semibold mb-2">💡 Instrucciones:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Asegúrate de que CompreFace esté ejecutándose en localhost:8000</li>
          <li>El indicador de estado debe mostrar "🟢 Conectado" antes de iniciar</li>
          <li>Haz clic en "Iniciar detección en tiempo real" para comenzar</li>
          <li>Posiciónate frente a la cámara para que se detecte tu rostro</li>
          <li>Las detecciones se muestran con un rectángulo verde</li>
        </ul>
      </div>

    </main>
  );
}