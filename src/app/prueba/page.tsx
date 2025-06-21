'use client';

import React, { useState, useRef } from 'react';
import { VerificationService, VerificationResult } from '@/services/verification';
import { RecognitionService, RecognitionResult } from '@/services/recognition';

export default function CompreFaceTest() {
  // Estados para verificación
  const [sourceImage, setSourceImage] = useState<string>('');
  const [targetImage, setTargetImage] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Estados para reconocimiento
  const [recognitionImage, setRecognitionImage] = useState<string>('');
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [recognitionLoading, setRecognitionLoading] = useState(false);

  // Estados para colección
  const [subjectName, setSubjectName] = useState<string>('');
  const [collectionImage, setCollectionImage] = useState<string>('');
  const [collectionResult, setCollectionResult] = useState<any>(null);
  const [faces, setFaces] = useState<any[]>([]);

  // Referencias para inputs de archivo
  const sourceFileRef = useRef<HTMLInputElement>(null);
  const targetFileRef = useRef<HTMLInputElement>(null);
  const recognitionFileRef = useRef<HTMLInputElement>(null);
  const collectionFileRef = useRef<HTMLInputElement>(null);

  // Servicios
  const verificationService = new VerificationService();
  const recognitionService = new RecognitionService();

  // Función para convertir archivo a base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Manejar selección de archivos
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

  // Verificación facial
  const handleVerification = async () => {
    if (!sourceImage || !targetImage) {
      alert('Por favor selecciona ambas imágenes');
      return;
    }

    setVerificationLoading(true);
    setVerificationResult(null); // Limpiar resultado anterior
    
    try {
      console.log('Iniciando verificación facial...');
      console.log('Imagen origen:', sourceImage ? 'Presente' : 'Ausente');
      console.log('Imagen objetivo:', targetImage ? 'Presente' : 'Ausente');

      // Intentar primero con el método simple
      console.log('Intentando verificación simple...');
      const result = await verificationService.verifySimple(sourceImage, targetImage);
      console.log('Resultado de verificación:', result);
      
      setVerificationResult(result);

      // Mostrar resultado en consola para debug
      if (result.result && result.result.length > 0) {
        const firstResult = result.result[0];
        if (firstResult.face_matches && firstResult.face_matches.length > 0) {
          const similarity = firstResult.face_matches[0].similarity;
          console.log(`Similitud encontrada: ${(similarity * 100).toFixed(2)}%`);
        }
      }

    } catch (error) {
      console.error('Error en verificación simple, intentando método original:', error);
      
      try {
        // Si falla el método simple, intentar con el método original con parámetros específicos
        console.log('Intentando verificación con método original...');
        const result = await verificationService.verify(sourceImage, targetImage, {
          det_prob_threshold: 0.8,
          face_plugins: "age,gender",
          limit: 0
        });
        
        console.log('Resultado de verificación (método original):', result);
        setVerificationResult(result);
        
      } catch (secondError) {
        console.error('Error en ambos métodos de verificación:', secondError);
        alert('Error en verificación facial: ' + (secondError as Error).message);
        setVerificationResult(null);
      }
    } finally {
      setVerificationLoading(false);
    }
  };

  // Reconocimiento facial
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
      console.error('Error en reconocimiento:', error);
      alert('Error en reconocimiento: ' + (error as Error).message);
    } finally {
      setRecognitionLoading(false);
    }
  };

  // Agregar imagen a colección
  const handleAddToCollection = async () => {
    if (!collectionImage || !subjectName.trim()) {
      alert('Por favor selecciona una imagen y especifica el nombre del sujeto');
      return;
    }

    try {
      const faceCollection = recognitionService.getFaceCollection();
      const result = await faceCollection.add(collectionImage, subjectName.trim());
      setCollectionResult(result);
      alert('Imagen agregada exitosamente a la colección');
      
      // Actualizar lista de rostros
      await loadFaces();
    } catch (error) {
      console.error('Error al agregar a colección:', error);
      alert('Error al agregar a colección: ' + (error as Error).message);
    }
  };

  // Cargar lista de rostros
  const loadFaces = async () => {
    try {
      const faceCollection = recognitionService.getFaceCollection();
      const facesList = await faceCollection.list();
      setFaces(facesList);
    } catch (error) {
      console.error('Error al cargar rostros:', error);
    }
  };

  // Eliminar rostro de colección
  const handleDeleteFace = async (imageId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return;
    }

    try {
      const faceCollection = recognitionService.getFaceCollection();
      await faceCollection.delete(imageId);
      alert('Imagen eliminada exitosamente');
      await loadFaces();
    } catch (error) {
      console.error('Error al eliminar rostro:', error);
      alert('Error al eliminar rostro: ' + (error as Error).message);
    }
  };

  // Cargar rostros al montar el componente
  React.useEffect(() => {
    loadFaces();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Prueba CompreFace - Verificación y Reconocimiento
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sección de Verificación */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">
              Verificación Facial
            </h2>
            <p className="text-gray-600 mb-4">
              Compara dos imágenes para verificar si son la misma persona
            </p>

            <div className="space-y-4">
              {/* Imagen origen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen 1 (Origen)
                </label>
                <input
                  ref={sourceFileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, setSourceImage)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {sourceImage && (
                  <img
                    src={sourceImage}
                    alt="Imagen origen"
                    className="mt-2 max-w-full h-40 object-cover rounded border"
                  />
                )}
              </div>

              {/* Imagen objetivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen 2 (Objetivo)
                </label>
                <input
                  ref={targetFileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, setTargetImage)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {targetImage && (
                  <img
                    src={targetImage}
                    alt="Imagen objetivo"
                    className="mt-2 max-w-full h-40 object-cover rounded border"
                  />
                )}
              </div>

              <button
                onClick={handleVerification}
                disabled={verificationLoading || !sourceImage || !targetImage}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {verificationLoading ? 'Verificando...' : 'Verificar'}
              </button>

              {/* Resultado de verificación */}
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
                          {/* Coincidencias */}
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

          {/* Sección de Reconocimiento */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">
              Reconocimiento Facial
            </h2>
            <p className="text-gray-600 mb-4">
              Identifica rostros conocidos en una imagen
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen para reconocer
                </label>
                <input
                  ref={recognitionFileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, setRecognitionImage)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {recognitionImage && (
                  <img
                    src={recognitionImage}
                    alt="Imagen para reconocer"
                    className="mt-2 max-w-full h-40 object-cover rounded border"
                  />
                )}
              </div>

              <button
                onClick={handleRecognition}
                disabled={recognitionLoading || !recognitionImage}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {recognitionLoading ? 'Reconociendo...' : 'Reconocer'}
              </button>

              {/* Resultado de reconocimiento */}
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
                            <p className="text-sm text-orange-600 ml-2">
                              Rostro no reconocido
                            </p>
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
        </div>

        {/* Sección de Gestión de Colección */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">
            Gestión de Colección de Rostros
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agregar a colección */}
            <div>
              <h3 className="text-lg font-medium mb-3">Agregar Rostro</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del sujeto
                  </label>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen del rostro
                  </label>
                  <input
                    ref={collectionFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, setCollectionImage)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {collectionImage && (
                    <img
                      src={collectionImage}
                      alt="Imagen de colección"
                      className="mt-2 max-w-full h-40 object-cover rounded border"
                    />
                  )}
                </div>

                <button
                  onClick={handleAddToCollection}
                  disabled={!collectionImage || !subjectName.trim()}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Agregar a Colección
                </button>
              </div>
            </div>

            {/* Lista de rostros */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Rostros en Colección</h3>
                <button
                  onClick={loadFaces}
                  className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                >
                  Actualizar
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {faces.length > 0 ? (
                  <div className="space-y-2">
                    {faces.map((face, index) => (
                      <div key={face.image_id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                        <div>
                          <p className="font-medium text-sm">{face.subject}</p>
                          <p className="text-xs text-gray-500">ID: {face.image_id}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteFace(face.image_id)}
                          className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No hay rostros en la colección
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}