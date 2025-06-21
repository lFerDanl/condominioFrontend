// services/recognition.ts
import { commonFunctions, CompreFaceOptions } from '../utils/funciones';

export interface RecognitionResult {
  result?: Array<{
    box: {
      x_min: number;
      y_min: number;
      x_max: number;
      y_max: number;
      probability: number;
    };
    subjects?: Array<{
      subject: string;
      similarity: number;
    }>;
    age?: {
      low: number;
      high: number;
    };
    gender?: {
      value: string;
    };
    landmarks?: number[][];
  }>;
  plugins_versions?: {
    age?: string;
    gender?: string;
    detector?: string;
    calculator?: string;
  };
}

export interface FaceCollectionImage {
  image_id: string;
  subject: string;
}

export interface Subject {
  subject: string;
}

export class RecognitionService {
  private server: string;
  private port: number;
  private options: CompreFaceOptions;
  private apiKey: string;
  private baseUrl: string = 'api/v1/recognition/faces';
  private recognizeBaseUrl: string = 'api/v1/recognition/recognize';

  constructor(options: CompreFaceOptions = {}) {
    this.server = `http://localhost`;
    this.port = 8000;
    this.options = options;
    this.apiKey = "ae69f541-b4bf-4dfd-bbdd-9a2c023eefbf";
  }

  /**
   * Reconocer rostros desde una imagen
   * @param imagePath - Ruta de imagen, URL, o datos base64
   * @param localOptions - Opciones específicas para este reconocimiento
   * @returns Promise con resultado de reconocimiento
   */
  async recognize(imagePath: string, localOptions: CompreFaceOptions = {}): Promise<RecognitionResult> {
    const { getFullUrl, addOptionsToUrl, createFormData } = commonFunctions;

    const requiredUrlParameters = {
      limit: true,
      det_prob_threshold: true,
      prediction_count: true,
      face_plugins: true,
      status: true
    };

    // Establecer límite por defecto si no se especifica
    const mergedOptions = { limit: 0, ...localOptions, ...this.options };

    const fullUrl = getFullUrl(this.recognizeBaseUrl, this.server, this.port);
    const url = addOptionsToUrl(fullUrl, this.options, mergedOptions, requiredUrlParameters);

    try {
      const formData = createFormData(imagePath, 'image.jpg');
      
      // Agregar opciones al FormData
      if (mergedOptions.limit !== undefined) formData.append('limit', mergedOptions.limit.toString());
      if (mergedOptions.prediction_count !== undefined) formData.append('prediction_count', mergedOptions.prediction_count.toString());
      if (mergedOptions.face_plugins) formData.append('face_plugins', mergedOptions.face_plugins);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en reconocimiento facial:', error);
      throw error;
    }
  }

  /**
   * Obtener funciones para manejar la colección de rostros
   * @returns Objeto con funciones de manejo de colección
   */
  getFaceCollection() {
    const { getFullUrl, addOptionsToUrl, createFormData } = commonFunctions;
    const url = getFullUrl(this.baseUrl, this.server, this.port);
    const apiKey = this.apiKey;
    const options = this.options;

    return {
      /**
       * Listar imágenes en la colección de rostros
       * @returns Promise con lista de imágenes
       */
      async list(): Promise<FaceCollectionImage[]> {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'x-api-key': apiKey,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          return data.faces || [];
        } catch (error) {
          console.error('Error al listar colección de rostros:', error);
          throw error;
        }
      },

      /**
       * Agregar imagen con sujeto a la colección
       * @param imagePath - Ruta de imagen
       * @param subject - Nombre del sujeto
       * @param localOptions - Opciones adicionales
       * @returns Promise con resultado
       */
      async add(imagePath: string, subject: string, localOptions: CompreFaceOptions = {}): Promise<any> {
        const requiredUrlParameters = { det_prob_threshold: true };
        
        let addUrl = `${url}?subject=${encodeURIComponent(subject)}`;
        addUrl = addOptionsToUrl(addUrl, options, localOptions, requiredUrlParameters);

        try {
          const formData = createFormData(imagePath, 'image.jpg');

          const response = await fetch(addUrl, {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
          }

          return await response.json();
        } catch (error) {
          console.error('Error al agregar imagen a colección:', error);
          throw error;
        }
      },

      /**
       * Verificar rostro con imagen de la colección
       * @param imagePath - Ruta de imagen a verificar
       * @param imageId - ID de imagen en la colección
       * @param localOptions - Opciones adicionales
       * @returns Promise con resultado de verificación
       */
      async verify(imagePath: string, imageId: string, localOptions: CompreFaceOptions = {}): Promise<any> {
        const requiredUrlParameters = {
          limit: true,
          det_prob_threshold: true,
          face_plugins: true,
          status: true
        };

        let verifyUrl = `${url}/${imageId}/verify`;
        verifyUrl = addOptionsToUrl(verifyUrl, options, localOptions, requiredUrlParameters);

        try {
          const formData = createFormData(imagePath, 'image.jpg');

          const response = await fetch(verifyUrl, {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
          }

          return await response.json();
        } catch (error) {
          console.error('Error al verificar rostro:', error);
          throw error;
        }
      },

      /**
       * Eliminar imagen por ID
       * @param imageId - ID de la imagen
       * @returns Promise con resultado
       */
      async delete(imageId: string): Promise<any> {
        try {
          const deleteUrl = `${url}/${imageId}`;
          
          const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
              'x-api-key': apiKey,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
          }

          return await response.json();
        } catch (error) {
          console.error('Error al eliminar imagen:', error);
          throw error;
        }
      },

      /**
       * Eliminar múltiples imágenes
       * @param imageIds - Array de IDs de imágenes
       * @returns Promise con resultado
       */
      async deleteMultiple(imageIds: string[]): Promise<any> {
        try {
          const deleteUrl = `${url}/delete`;
          
          const response = await fetch(deleteUrl, {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image_id_list: imageIds }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
          }

          return await response.json();
        } catch (error) {
          console.error('Error al eliminar múltiples imágenes:', error);
          throw error;
        }
      },

      /**
       * Eliminar todas las imágenes de un sujeto
       * @param subject - Nombre del sujeto
       * @returns Promise con resultado
       */
      async deleteAllSubject(subject: string): Promise<any> {
        try {
          const deleteUrl = `${url}?subject=${encodeURIComponent(subject)}`;
          
          const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
              'x-api-key': apiKey,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
          }

          return await response.json();
        } catch (error) {
          console.error('Error al eliminar todas las imágenes del sujeto:', error);
          throw error;
        }
      },

      /**
       * Eliminar todas las imágenes de la colección
       * @returns Promise con resultado
       */
      async deleteAll(): Promise<any> {
        try {
          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'x-api-key': apiKey,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
          }

          return await response.json();
        } catch (error) {
          console.error('Error al eliminar toda la colección:', error);
          throw error;
        }
      }
    };
  }

  /**
   * Obtener funciones para manejar sujetos
   * @returns Objeto con funciones de manejo de sujetos
   */
  getSubjects() {
    const { getFullUrl } = commonFunctions;
    const baseSubjectUrl = this.baseUrl.replace('faces', 'subjects');
    const url = getFullUrl(baseSubjectUrl, this.server, this.port);
    const apiKey = this.apiKey;

    return {
      /**
       * Listar todos los sujetos
       * @returns Promise con lista de sujetos
       */
      async list(): Promise<Subject[]> {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'x-api-key': apiKey,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          return data.subjects || [];
        } catch (error) {
          console.error('Error al listar sujetos:', error);
          throw error;
        }
      },

      /**
       * Agregar nuevo sujeto
       * @param subject - Nombre del sujeto
       * @returns Promise con resultado
       */
      async add(subject: string): Promise<any> {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subject }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
          }

          return await response.json();
        } catch (error) {
          console.error('Error al agregar sujeto:', error);
          throw error;
        }
      },

      /**
       * Renombrar sujeto
       * @param currentName - Nombre actual
       * @param newName - Nuevo nombre
       * @returns Promise con resultado
       */
      async rename(currentName: string, newName: string): Promise<any> {
        try {
          const renameUrl = `${url}/${encodeURIComponent(currentName)}`;
          
          const response = await fetch(renameUrl, {
            method: 'PUT',
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subject: newName }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
          }

          return await response.json();
        } catch (error) {
          console.error('Error al renombrar sujeto:', error);
          throw error;
        }
      },

      /**
       * Eliminar sujeto
       * @param subject - Nombre del sujeto
       * @returns Promise con resultado
       */
      async delete(subject: string): Promise<any> {
        try {
          const deleteUrl = `${url}/${encodeURIComponent(subject)}`;
          
          const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
              'x-api-key': apiKey,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
          }

          return await response.json();
        } catch (error) {
          console.error('Error al eliminar sujeto:', error);
          throw error;
        }
      },

      /**
       * Eliminar todos los sujetos
       * @returns Promise con resultado
       */
      async deleteAll(): Promise<any> {
        try {
          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'x-api-key': apiKey,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
          }

          return await response.json();
        } catch (error) {
          console.error('Error al eliminar todos los sujetos:', error);
          throw error;
        }
      }
    };
  }
}