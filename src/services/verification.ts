// services/verification.ts
import { commonFunctions, CompreFaceOptions } from '../utils/funciones';

export interface VerificationResult {
  result?: Array<{
    source_image_face?: {
      box: {
        probability: number;
        x_max: number;
        y_max: number;
        x_min: number;
        y_min: number;
      };
      age?: {
        probability: number;
        high: number;
        low: number;
      };
      gender?: {
        probability: number;
        value: string;
      };
    };
    face_matches?: Array<{
      box: {
        probability: number;
        x_max: number;
        y_max: number;
        x_min: number;
        y_min: number;
      };
      similarity: number;
      age?: {
        probability: number;
        high: number;
        low: number;
      };
      gender?: {
        probability: number;
        value: string;
      };
    }>;
    similarity?: number;
    verified?: boolean;
    age?: {
      low: number;
      high: number;
    };
    gender?: {
      value: string;
    };
    landmarks?: number[][];
    execution_time?: {
      age: number;
      gender: number;
      detector: number;
      calculator: number;
    };
  }>;
  plugins_versions?: {
    age?: string;
    gender?: string;
    detector?: string;
    calculator?: string;
  };
}

export class VerificationService {
  private server: string;
  private port: number;
  private options: CompreFaceOptions;
  private apiKey: string;
  private baseUrl: string = 'api/v1/verification/verify';

  constructor(options: CompreFaceOptions = {}) {
    this.server = `http://localhost`;
    this.port = 8000;
    this.options = options;
    this.apiKey = "1aaaa4f1-6670-45e9-a9b8-438fa7484835";
  }

  /**
   * Verificar si dos imágenes contienen la misma persona
   * @param sourceImagePath - Primera imagen (ruta, URL, o base64)
   * @param targetImagePath - Segunda imagen (ruta, URL, o base64)
   * @param localOptions - Opciones específicas para esta verificación
   * @returns Promise con resultado de verificación
   */
  async verify(
    sourceImagePath: string, 
    targetImagePath: string, 
    localOptions: CompreFaceOptions = {}
  ): Promise<VerificationResult> {
    const { getFullUrl, addOptionsToUrl, isUrl, isBase64 } = commonFunctions;

    // Combinar opciones con valores por defecto
    const mergedOptions = { 
      limit: 0,
      det_prob_threshold: 0.8,
      face_plugins: "age,gender",
      ...this.options, 
      ...localOptions 
    };

    // Parámetros permitidos para el endpoint de verificación
    const requiredUrlParameters = {
      limit: true,
      det_prob_threshold: true,
      face_plugins: true,
      status: true
    };

    // Construir URL completa
    const fullUrl = getFullUrl(this.baseUrl, this.server, this.port);
    const url = addOptionsToUrl(fullUrl, mergedOptions, {}, requiredUrlParameters);

    console.log('URL de verificación:', url);

    try {
      const formData = new FormData();
      
      // Procesar imagen origen
      if (isUrl(sourceImagePath)) {
        formData.append('source_image_url', sourceImagePath);
      } else if (isBase64(sourceImagePath)) {
        const sourceBlob = commonFunctions.base64ToBlob(sourceImagePath);
        formData.append('source_image', sourceBlob, 'source.jpg');
      } else {
        // Archivo local
        formData.append('source_image', sourceImagePath);
      }

      // Procesar imagen objetivo
      if (isUrl(targetImagePath)) {
        formData.append('target_image_url', targetImagePath);
      } else if (isBase64(targetImagePath)) {
        const targetBlob = commonFunctions.base64ToBlob(targetImagePath);
        formData.append('target_image', targetBlob, 'target.jpg');
      } else {
        // Archivo local
        formData.append('target_image', targetImagePath);
      }

      // Agregar opciones al FormData
      if (mergedOptions.limit !== undefined) {
        formData.append('limit', mergedOptions.limit.toString());
      }
      if (mergedOptions.det_prob_threshold !== undefined) {
        formData.append('det_prob_threshold', mergedOptions.det_prob_threshold.toString());
      }
      if (mergedOptions.face_plugins) {
        formData.append('face_plugins', mergedOptions.face_plugins);
      }
      if (mergedOptions.status !== undefined) {
        formData.append('status', mergedOptions.status.toString());
      }

      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, typeof value === 'string' ? value : typeof value);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Verification result:', result);
      return result;

    } catch (error) {
      console.error('Error en verificación facial:', error);
      throw error;
    }
  }

  /**
   * Verificar con configuración simplificada (método alternativo)
   */
  async verifySimple(
    sourceImagePath: string, 
    targetImagePath: string
  ): Promise<VerificationResult> {
    const url = `${this.server}:${this.port}/${this.baseUrl}`;
    
    try {
      const formData = new FormData();
      
      // Convertir ambas imágenes a Blob si son base64
      if (commonFunctions.isBase64(sourceImagePath)) {
        const sourceBlob = commonFunctions.base64ToBlob(sourceImagePath);
        formData.append('source_image', sourceBlob, 'source.jpg');
      }
      
      if (commonFunctions.isBase64(targetImagePath)) {
        const targetBlob = commonFunctions.base64ToBlob(targetImagePath);
        formData.append('target_image', targetBlob, 'target.jpg');
      }

      // Configuración básica
      formData.append('limit', '0');
      formData.append('det_prob_threshold', '0.8');
      formData.append('face_plugins', 'age,gender');

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
      console.error('Error en verificación simple:', error);
      throw error;
    }
  }

  /**
   * Verificar múltiples pares de imágenes
   */
  async verifyMultiple(
    imagePairs: Array<[string, string]>, 
    localOptions: CompreFaceOptions = {}
  ): Promise<VerificationResult[]> {
    const promises = imagePairs.map(([source, target]) => 
      this.verify(source, target, localOptions)
    );
    return Promise.all(promises);
  }

  /**
   * Verificar con umbral de similitud personalizado
   */
  async verifyWithThreshold(
    sourceImagePath: string,
    targetImagePath: string,
    threshold: number = 0.8,
    localOptions: CompreFaceOptions = {}
  ): Promise<VerificationResult & { customVerified: boolean }> {
    const result = await this.verify(sourceImagePath, targetImagePath, localOptions);
    
    // Determinar verificación personalizada
    let customVerified = false;
    if (result.result && result.result.length > 0) {
      const firstResult = result.result[0];
      // Verificar si hay face_matches (estructura de tu imagen de referencia)
      if (firstResult.face_matches && firstResult.face_matches.length > 0) {
        customVerified = firstResult.face_matches[0].similarity >= threshold;
      } else if (firstResult.similarity !== undefined) {
        customVerified = firstResult.similarity >= threshold;
      }
    }

    return {
      ...result,
      customVerified
    };
  }

  /**
   * Obtener configuración actual del servicio
   */
  getConfig(): {
    server: string;
    port: number;
    options: CompreFaceOptions;
    baseUrl: string;
  } {
    return {
      server: this.server,
      port: this.port,
      options: this.options,
      baseUrl: this.baseUrl,
    };
  }

  /**
   * Actualizar opciones globales del servicio
   */
  updateOptions(newOptions: CompreFaceOptions): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Verificar si el servicio está disponible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const url = `${this.server}:${this.port}/${this.baseUrl}`;
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'x-api-key': this.apiKey,
        },
      });
      return response.ok || response.status === 405;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}