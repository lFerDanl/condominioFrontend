import { API_BASE_URL } from '../utils/funciones';

export interface Camara {
  id: number;
  nombre: string;
  ubicacion: string;
  descripcion?: string;
  tipo: 'IP' | 'WEBCAM' | 'USB' | 'RTSP' | 'HTTP';
  estado: 'ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO' | 'FALLA' | 'DESCONECTADA';
  ip_address?: string;
  puerto?: number;
  username?: string;
  password?: string;
  url_stream?: string;
  grabacion_activa: boolean;
  retencion_dias: number;
  fecha_instalacion: string;
  fecha_actualizacion: string;
  modelos_ia?: CamaraModeloIA[];
}

export interface ModeloIA {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: 'DETECCION_FACIAL' | 'RECONOCIMIENTO_FACIAL' | 'VERIFICACION_FACIAL' | 'DETECCION_ACTIVIDAD_SOSPECHOSA' | 'DETECCION_INTRUSION_ZONA_RESTRINGIDA' | 'DETECCION_ACTIVIDAD_VIOLENTA' | 'DETECCION_MOVIMIENTO';
  version: string;
  proveedor?: string;
  configuracion?: any;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CamaraModeloIA {
  id: number;
  camaraId: number;
  modeloIAId: number;
  camara?: Camara;
  modeloIA?: ModeloIA;
  activo: boolean;
  configuracion?: any;
  sensibilidad?: number;
  intervalo_analisis?: number;
  alertas_activas: boolean;
  notificar_guardia: boolean;
  notificar_admin: boolean;
  fecha_activacion: string;
  fecha_actualizacion: string;
}

export interface EventoDeteccion {
  id: number;
  camaraModeloIAId: number;
  camaraModeloIA?: CamaraModeloIA;
  tipo_evento: string;
  confianza: number;
  descripcion?: string;
  datos_deteccion?: any;
  imagen_captura?: string;
  estado: 'NUEVO' | 'PROCESANDO' | 'PROCESADO' | 'FALSO_POSITIVO' | 'ERROR';
  procesado: boolean;
  fecha_deteccion: string;
  fecha_procesamiento?: string;
}

export interface CreateCamaraDto {
  nombre: string;
  ubicacion: string;
  descripcion?: string;
  tipo: 'IP' | 'WEBCAM' | 'USB' | 'RTSP' | 'HTTP';
  estado?: 'ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO' | 'FALLA' | 'DESCONECTADA';
  ip_address?: string;
  puerto?: number;
  username?: string;
  password?: string;
  url_stream?: string;
  grabacion_activa?: boolean;
  retencion_dias?: number;
}

export interface UpdateCamaraDto extends Partial<CreateCamaraDto> {}

export interface CreateModeloIADto {
  nombre: string;
  descripcion?: string;
  tipo: 'DETECCION_FACIAL' | 'RECONOCIMIENTO_FACIAL' | 'VERIFICACION_FACIAL' | 'DETECCION_ACTIVIDAD_SOSPECHOSA' | 'DETECCION_INTRUSION_ZONA_RESTRINGIDA' | 'DETECCION_ACTIVIDAD_VIOLENTA' | 'DETECCION_MOVIMIENTO';
  version: string;
  proveedor?: string;
  configuracion?: any;
  activo?: boolean;
}

export interface UpdateModeloIADto extends Partial<CreateModeloIADto> {}

export interface AsignarModeloIADto {
  camaraId: number;
  modeloIAId: number;
  activo?: boolean;
  configuracion?: any;
  sensibilidad?: number;
  intervalo_analisis?: number;
  alertas_activas?: boolean;
  notificar_guardia?: boolean;
  notificar_admin?: boolean;
}

export interface EstadisticasCamaras {
  total_camaras: number;
  camaras_activas: number;
  camaras_inactivas: number;
  camaras_mantenimiento: number;
  camaras_falla: number;
  camaras_desconectadas: number;
  camaras_con_ia: number;
  eventos_hoy: number;
  eventos_semana: number;
  eventos_mes: number;
}

class CamarasService {
  private baseUrl = `${API_BASE_URL}/camara`;

  // ===== CRUD CÁMARAS =====
  async getCamaras(): Promise<Camara[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`Error al obtener cámaras: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching cameras:', error);
      throw error;
    }
  }

  async getCamara(id: number): Promise<Camara> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`Error al obtener cámara: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching camera:', error);
      throw error;
    }
  }

  async createCamara(camara: CreateCamaraDto): Promise<Camara> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(camara),
      });
      if (!response.ok) {
        throw new Error(`Error al crear cámara: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating camera:', error);
      throw error;
    }
  }

  async updateCamara(id: number, camara: UpdateCamaraDto): Promise<Camara> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(camara),
      });
      if (!response.ok) {
        throw new Error(`Error al actualizar cámara: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating camera:', error);
      throw error;
    }
  }

  async deleteCamara(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error al eliminar cámara: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting camera:', error);
      throw error;
    }
  }

  // ===== CRUD MODELOS DE IA =====
  async getModelosIA(): Promise<ModeloIA[]> {
    try {
      const response = await fetch(`${this.baseUrl}/modelo-ia`);
      if (!response.ok) {
        throw new Error(`Error al obtener modelos de IA: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching AI models:', error);
      throw error;
    }
  }

  async getModeloIA(id: number): Promise<ModeloIA> {
    try {
      const response = await fetch(`${this.baseUrl}/modelo-ia/${id}`);
      if (!response.ok) {
        throw new Error(`Error al obtener modelo de IA: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching AI model:', error);
      throw error;
    }
  }

  async createModeloIA(modelo: CreateModeloIADto): Promise<ModeloIA> {
    try {
      const response = await fetch(`${this.baseUrl}/modelo-ia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelo),
      });
      if (!response.ok) {
        throw new Error(`Error al crear modelo de IA: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating AI model:', error);
      throw error;
    }
  }

  async updateModeloIA(id: number, modelo: UpdateModeloIADto): Promise<ModeloIA> {
    try {
      const response = await fetch(`${this.baseUrl}/modelo-ia/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelo),
      });
      if (!response.ok) {
        throw new Error(`Error al actualizar modelo de IA: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating AI model:', error);
      throw error;
    }
  }

  async deleteModeloIA(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/modelo-ia/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error al eliminar modelo de IA: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting AI model:', error);
      throw error;
    }
  }

  // ===== ASIGNACIÓN DE MODELOS =====
  async asignarModeloIA(asignacion: AsignarModeloIADto): Promise<CamaraModeloIA> {
    try {
      const response = await fetch(`${this.baseUrl}/asignar-modelo-ia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asignacion),
      });
      if (!response.ok) {
        throw new Error(`Error al asignar modelo de IA: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error assigning AI model:', error);
      throw error;
    }
  }

  async actualizarConfiguracionModeloIA(
    camaraId: number,
    modeloIAId: number,
    configuracion: any
  ): Promise<CamaraModeloIA> {
    try {
      const response = await fetch(`${this.baseUrl}/${camaraId}/modelo-ia/${modeloIAId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ configuracion }),
      });
      if (!response.ok) {
        throw new Error(`Error al actualizar configuración de modelo: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating model config:', error);
      throw error;
    }
  }

  async desasignarModeloIA(camaraId: number, modeloIAId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${camaraId}/modelo-ia/${modeloIAId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error al desasignar modelo de IA: ${response.status}`);
      }
    } catch (error) {
      console.error('Error de-assigning AI model:', error);
      throw error;
    }
  }

  // ===== EVENTOS DE DETECCIÓN =====
  async getEventosDeteccion(params?: {
    camaraId?: number;
    modeloIAId?: number;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<EventoDeteccion[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const response = await fetch(`${this.baseUrl}/eventos?${query}`);
      if (!response.ok) {
        throw new Error(`Error al obtener eventos: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async registrarEventoDeteccion(
    camaraId: number,
    modeloIAId: number,
    evento: {
      tipo_evento: string;
      confianza: number;
      descripcion?: string;
      datos_deteccion?: any;
      imagen_captura?: string;
    }
  ): Promise<EventoDeteccion> {
    try {
      const response = await fetch(`${this.baseUrl}/${camaraId}/modelo-ia/${modeloIAId}/eventos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evento),
      });
      if (!response.ok) {
        throw new Error(`Error al registrar evento: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error registering event:', error);
      throw error;
    }
  }

  // ===== REPORTES Y ESTADÍSTICAS =====
  async getCamarasPorEstado(estado: string): Promise<Camara[]> {
    try {
      const response = await fetch(`${this.baseUrl}/estado/${estado}`);
      if (!response.ok) {
        throw new Error(`Error al obtener cámaras por estado: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching cameras by state:', error);
      throw error;
    }
  }

  async getCamarasConModeloIA(tipo: string): Promise<Camara[]> {
    try {
      const response = await fetch(`${this.baseUrl}/con-modelo-ia/${tipo}`);
      if (!response.ok) {
        throw new Error(`Error al obtener cámaras con modelo de IA: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching cameras with AI model:', error);
      throw error;
    }
  }

  async getEstadisticas(): Promise<EstadisticasCamaras> {
    try {
      const response = await fetch(`${this.baseUrl}/estadisticas`);
      if (!response.ok) {
        throw new Error(`Error al obtener estadísticas: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }
}

export const camarasService = new CamarasService(); 