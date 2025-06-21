// utils/funciones.ts
// Colección de funciones comunes para los servicios de CompreFace

// URL base para las APIs del backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CompreFaceOptions {
  limit?: number;
  det_prob_threshold?: number;
  prediction_count?: number;
  face_plugins?: string;
  status?: boolean;
}

export interface UrlParameters {
  limit?: boolean;
  det_prob_threshold?: boolean;
  prediction_count?: boolean;
  face_plugins?: boolean;
  status?: boolean;
}

export const commonFunctions = {
  /**
   * Construir URL completa desde parámetros dados
   * @param base_url - URL base del endpoint
   * @param server - Servidor (ej: http://localhost)
   * @param port - Puerto (ej: 8000)
   * @returns URL completa
   */
  getFullUrl(base_url: string, server: string, port: number): string {
    return `${server}:${port}/${base_url}`;
  },

  /**
   * Verificar si es una URL
   * @param image_url - String a verificar
   * @returns true si es URL válida
   */
  isUrl(image_url: string): boolean {
    const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    return urlRegex.test(image_url);
  },

  /**
   * Verificar si es base64 (incluyendo dataURL)
   * @param image_data - String a verificar
   * @returns true si es base64 válido
   */
  isBase64(image_data: string): boolean {
    // Verificar si es un dataURL primero
    if (image_data.startsWith('data:')) {
      return true;
    }
    
    // Verificar si es base64 puro
    const base64regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
    return base64regex.test(image_data);
  },

  /**
   * Extraer base64 puro de un dataURL o devolver el string si ya es base64 puro
   * @param input - dataURL o base64 string
   * @returns base64 puro sin prefijos
   */
  extractBase64(input: string): string {
    // Si es un dataURL, extraer solo la parte base64
    if (input.startsWith('data:')) {
      const base64Index = input.indexOf(',');
      if (base64Index !== -1) {
        return input.substring(base64Index + 1);
      }
    }
    
    // Si ya es base64 puro, devolverlo tal como está
    return input;
  },

  /**
   * Verificar si es una ruta relativa
   * @param path - Ruta a verificar
   * @returns true si es ruta relativa
   */
  isPathRelative(path: string): boolean {
    if (typeof path !== 'string') return false;
    const isAbsolute = /^([A-Za-z]:|\.)/.test(path);
    return isAbsolute;
  },

  /**
   * Agregar opciones adicionales a la URL
   * @param url - URL base
   * @param globalOptions - Opciones globales
   * @param localOptions - Opciones locales
   * @param requiredParameters - Parámetros permitidos para el endpoint
   * @returns URL con parámetros
   */
  addOptionsToUrl(
    url: string,
    globalOptions: CompreFaceOptions = {},
    localOptions: CompreFaceOptions = {},
    requiredParameters: UrlParameters = {}
  ): string {
    // Combinar opciones: las globales sobrescriben las locales
    const uniqueOptions = { ...localOptions, ...globalOptions };
    const optionKeys = Object.keys(uniqueOptions);
    let isLimitOptionExist = false;

    if (optionKeys.length === 0) {
      return url;
    }

    // Agregar parámetro limit si existe y está permitido
    if (uniqueOptions.limit !== undefined && uniqueOptions.limit >= 0 && requiredParameters.limit) {
      isLimitOptionExist = true;
      url = `${url}?limit=${uniqueOptions.limit}`;
    }

    // Agregar det_prob_threshold si existe y está permitido
    if (uniqueOptions.det_prob_threshold !== undefined && uniqueOptions.det_prob_threshold >= 0 && requiredParameters.det_prob_threshold) {
      url = `${url}${isLimitOptionExist ? '&' : '?'}det_prob_threshold=${uniqueOptions.det_prob_threshold}`;
    }

    // Agregar prediction_count si existe y está permitido
    if (uniqueOptions.prediction_count !== undefined && uniqueOptions.prediction_count >= 0 && requiredParameters.prediction_count) {
      url = `${url}${isLimitOptionExist ? '&' : '?'}prediction_count=${uniqueOptions.prediction_count}`;
    }

    // Agregar face_plugins si existe y está permitido
    if (uniqueOptions.face_plugins && requiredParameters.face_plugins) {
      url = `${url}${isLimitOptionExist ? '&' : '?'}face_plugins=${uniqueOptions.face_plugins}`;
    }

    // Agregar status si existe y está permitido
    if (uniqueOptions.status !== undefined && requiredParameters.status) {
      url = `${url}${isLimitOptionExist ? '&' : '?'}status=${uniqueOptions.status}`;
    }

    return url;
  },

  /**
   * Detectar el tipo de contenido desde un dataURL
   * @param dataUrl - dataURL string
   * @returns tipo de contenido detectado o 'image/jpeg' por defecto
   */
  getContentTypeFromDataUrl(dataUrl: string): string {
    if (!dataUrl.startsWith('data:')) {
      return 'image/jpeg'; // Valor por defecto
    }
    
    const match = dataUrl.match(/data:([^;]+)/);
    return match ? match[1] : 'image/jpeg';
  },

  /**
   * Convertir base64 a Blob
   * @param base64Data - Datos en base64 (puede incluir dataURL prefix)
   * @param contentType - Tipo de contenido (default: image/jpeg)
   * @returns Blob
   */
  base64ToBlob(base64Data: string, contentType: string = 'image/jpeg'): Blob {
    try {
      // Extraer base64 puro (sin prefijo dataURL si existe)
      const pureBase64 = commonFunctions.extractBase64(base64Data);
      
      // Decodificar base64
      const byteCharacters = atob(pureBase64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: contentType });
    } catch (error) {
      console.error('Error al convertir base64 a Blob:', error);
      console.error('Base64 data length:', base64Data.length);
      console.error('Base64 data preview:', base64Data.substring(0, 100));
      throw new Error(`Error al decodificar base64: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Crear FormData para envío de archivo
   * @param imageData - Datos de imagen (base64, dataURL, blob, etc.)
   * @param filename - Nombre del archivo
   * @param additionalFields - Campos adicionales para el FormData
   * @returns FormData listo para envío
   */
  createFormData(
    imageData: string | Blob, 
    filename: string = 'image.jpg',
    additionalFields: Record<string, string> = {}
  ): FormData {
    const formData = new FormData();
    
    try {
      if (typeof imageData === 'string') {
        // Detectar tipo de contenido si es dataURL
        const contentType = imageData.startsWith('data:') 
          ? commonFunctions.getContentTypeFromDataUrl(imageData)
          : 'image/jpeg';
        
        // Convertir a blob
        const blob = commonFunctions.base64ToBlob(imageData, contentType);
        formData.append('file', blob, filename);
      } else {
        // Es un Blob
        formData.append('file', imageData, filename);
      }

      // Agregar campos adicionales
      Object.entries(additionalFields).forEach(([key, value]) => {
        formData.append(key, value);
      });

      return formData;
    } catch (error) {
      console.error('Error al crear FormData:', error);
      throw error;
    }
  },

  /**
   * Validar que una cadena base64 sea válida
   * @param base64String - Cadena a validar
   * @returns true si es válida, false en caso contrario
   */
  validateBase64(base64String: string): boolean {
    try {
      const pureBase64 = commonFunctions.extractBase64(base64String);
      // Intentar decodificar para verificar validez
      atob(pureBase64);
      return true;
    } catch (error) {
      return false;
    }
  }
};