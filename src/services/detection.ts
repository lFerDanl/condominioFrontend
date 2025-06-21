// services/detection.ts - Versión híbrida mejorada
import { commonFunctions, CompreFaceOptions, UrlParameters } from '../utils/funciones';

export interface DetectionResult {
  result?: Array<{
    box: {
      x_min: number;
      y_min: number;
      x_max: number;
      y_max: number;
      probability: number;
    };
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
    };
  }>;
  plugins_versions?: {
    age?: string;
    gender?: string;
    detector?: string;
  };
}

export class DetectionService {
  private server: string;
  private port: number;
  private options: CompreFaceOptions;
  private apiKey: string;
  private baseUrl: string = 'api/v1/detection/detect';

  // Parámetros permitidos para este endpoint
  private readonly allowedParams: UrlParameters = {
    limit: true,
    det_prob_threshold: true,
    face_plugins: true,
    status: true
  };

  constructor() {
    this.server = `http://localhost`;
    this.port = 8000;
    this.options = {
      limit: 0,
      face_plugins: 'age,gender',
      det_prob_threshold: 0.8,
    };
    this.apiKey = "7a7b5019-2c7d-44ca-8d6b-57fe031cacb1";
  }

  private getFullUrl(localOptions: CompreFaceOptions = {}): string {
    const baseUrl = commonFunctions.getFullUrl(this.baseUrl, this.server, this.port);
    return commonFunctions.addOptionsToUrl(baseUrl, this.options, localOptions, this.allowedParams);
  }

  /**
   * Detectar rostros desde diferentes tipos de entrada
   * @param input - Puede ser: URL, base64, File, Blob, o HTMLCanvasElement
   * @param localOptions - Opciones específicas para esta detección
   */
  async detect(
    input: string | File | Blob | HTMLCanvasElement, 
    localOptions: CompreFaceOptions = {}
  ): Promise<DetectionResult> {
    const url = this.getFullUrl(localOptions);
    
    try {
      let formData: FormData;

      // Determinar el tipo de entrada y crear FormData apropiado
      if (typeof input === 'string') {
        if (commonFunctions.isUrl(input)) {
          // Es una URL - descarga la imagen primero
          const response = await fetch(input);
          const blob = await response.blob();
          formData = commonFunctions.createFormData(blob, 'image.jpg');
        } else if (commonFunctions.isBase64(input)) {
          // Es base64
          formData = commonFunctions.createFormData(input, 'image.jpg');
        } else {
          throw new Error('String no válido: debe ser URL o base64');
        }
      } else if (input instanceof File || input instanceof Blob) {
        // Es un archivo o blob
        formData = commonFunctions.createFormData(input, input instanceof File ? input.name : 'image.jpg');
      } else if (input instanceof HTMLCanvasElement) {
        // Es un canvas (solo en navegador)
        const base64 = input.toDataURL('image/jpeg', 0.8);
        formData = commonFunctions.createFormData(base64, 'canvas.jpg');
      } else {
        throw new Error('Tipo de entrada no soportado');
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
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en detección facial:', error);
      throw error;
    }
  }

  /**
   * Método de conveniencia para canvas (mantiene compatibilidad)
   */
  async detectFromCanvas(canvas: HTMLCanvasElement, localOptions: CompreFaceOptions = {}): Promise<DetectionResult> {
    return this.detect(canvas, localOptions);
  }

  /**
   * Método de conveniencia para base64 (mantiene compatibilidad)
   */
  async detectFromBase64(base64Data: string, localOptions: CompreFaceOptions = {}): Promise<DetectionResult> {
    return this.detect(base64Data, localOptions);
  }

  /**
   * Método de conveniencia para URLs
   */
  async detectFromUrl(imageUrl: string, localOptions: CompreFaceOptions = {}): Promise<DetectionResult> {
    return this.detect(imageUrl, localOptions);
  }

  /**
   * Método de conveniencia para archivos
   */
  async detectFromFile(file: File, localOptions: CompreFaceOptions = {}): Promise<DetectionResult> {
    return this.detect(file, localOptions);
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
   * Verificar si el servicio CompreFace está disponible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const baseUrl = commonFunctions.getFullUrl(this.baseUrl, this.server, this.port);
      const response = await fetch(baseUrl, {
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