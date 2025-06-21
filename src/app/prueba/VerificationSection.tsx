import React, { useState, useRef } from 'react';
import { VerificationService, VerificationResult } from '@/services/verification';

export default function VerificationSection() {
  const [sourceImage, setSourceImage] = useState<string>('');
  const [targetImage, setTargetImage] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);

  const sourceFileRef = useRef<HTMLInputElement>(null);
  const targetFileRef = useRef<HTMLInputElement>(null);
  const verificationService = new VerificationService();

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setImage: (image: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setImage(base64);
      } catch (error) {
        console.error('Error al convertir archivo:', error);
        alert('Error al procesar el archivo');
      }
    }
  };

  const handleVerification = async () => {
    if (!sourceImage || !targetImage) {
      alert('Por favor selecciona ambas imágenes');
      return;
    }
    setVerificationLoading(true);
    setVerificationResult(null);
    try {
      const result = await verificationService.verifySimple(sourceImage, targetImage);
      setVerificationResult(result);
    } catch (error) {
      try {
        const result = await verificationService.verify(sourceImage, targetImage, {
          det_prob_threshold: 0.8,
          face_plugins: "age,gender",
          limit: 0
        });
        setVerificationResult(result);
      } catch (secondError) {
        alert('Error en verificación facial: ' + (secondError as Error).message);
        setVerificationResult(null);
      }
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Verificación Facial</h2>
      <p className="text-gray-600 mb-4">Compara dos imágenes para verificar si son la misma persona</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imagen 1 (Origen)</label>
          <input
            ref={sourceFileRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, setSourceImage)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {sourceImage && (
            <img src={sourceImage} alt="Imagen origen" className="mt-2 max-w-full h-40 object-cover rounded border" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imagen 2 (Objetivo)</label>
          <input
            ref={targetFileRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, setTargetImage)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {targetImage && (
            <img src={targetImage} alt="Imagen objetivo" className="mt-2 max-w-full h-40 object-cover rounded border" />
          )}
        </div>
        <button
          onClick={handleVerification}
          disabled={verificationLoading || !sourceImage || !targetImage}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {verificationLoading ? 'Verificando...' : 'Verificar'}
        </button>
        {verificationResult && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
            <h3 className="font-semibold mb-3 text-gray-800">Resultado:</h3>
            <pre className="text-xs bg-gray-50 p-3 rounded mb-3 overflow-auto border border-gray-200 text-gray-700">
              {JSON.stringify(verificationResult, null, 2)}
            </pre>
            {verificationResult.result && verificationResult.result.length > 0 ? (
              <div className="space-y-4">
                {verificationResult.result.map((face, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {face.face_matches && face.face_matches.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Coincidencias:</h4>
                        <div className="space-y-3">
                          {face.face_matches.map((match, matchIndex) => (
                            <div key={matchIndex} className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <p className="text-sm text-green-700 font-medium mb-2">
                                Similitud: {(match.similarity * 100).toFixed(2)}%
                              </p>
                              {match.box && (
                                <p className="text-sm text-gray-700">
                                  Probabilidad detección: <span className="font-medium">{(match.box.probability * 100).toFixed(2)}%</span>
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">No se detectaron rostros</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 