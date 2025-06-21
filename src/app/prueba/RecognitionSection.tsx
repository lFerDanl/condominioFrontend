import React, { useState, useRef } from 'react';
import { RecognitionService, RecognitionResult } from '@/services/recognition';

export default function RecognitionSection() {
  const [recognitionImage, setRecognitionImage] = useState<string>('');
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [recognitionLoading, setRecognitionLoading] = useState(false);
  const recognitionFileRef = useRef<HTMLInputElement>(null);
  const recognitionService = new RecognitionService();

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

  const handleRecognition = async () => {
    if (!recognitionImage) {
      alert('Por favor selecciona una imagen');
      return;
    }
    setRecognitionLoading(true);
    try {
      const result = await recognitionService.recognize(recognitionImage);
      setRecognitionResult(result);
    } catch (error) {
      alert('Error en reconocimiento: ' + (error as Error).message);
    } finally {
      setRecognitionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-green-600">Reconocimiento Facial</h2>
      <p className="text-gray-600 mb-4">Identifica rostros conocidos en una imagen</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imagen para reconocer</label>
          <input
            ref={recognitionFileRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, setRecognitionImage)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          {recognitionImage && (
            <img src={recognitionImage} alt="Imagen para reconocer" className="mt-2 max-w-full h-40 object-cover rounded border" />
          )}
        </div>
        <button
          onClick={handleRecognition}
          disabled={recognitionLoading || !recognitionImage}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {recognitionLoading ? 'Reconociendo...' : 'Reconocer'}
        </button>
        {recognitionResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Resultado:</h3>
            {recognitionResult.result && recognitionResult.result.length > 0 ? (
              <div className="space-y-2">
                {recognitionResult.result.map((face, index) => (
                  <div key={index} className="border-b pb-2">
                    <p className="text-sm text-gray-600">
                      Rostro {index + 1} - Probabilidad: {(face.box.probability * 100).toFixed(2)}%
                    </p>
                    {face.subjects && face.subjects.length > 0 ? (
                      <div className="ml-2">
                        {face.subjects.map((subject, subIndex) => (
                          <p key={subIndex} className="text-sm text-green-600">
                            {subject.subject}: {(subject.similarity * 100).toFixed(2)}%
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-orange-600 ml-2">Rostro no reconocido</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-600">No se detectaron rostros</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 