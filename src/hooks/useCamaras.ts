import { useState, useEffect, useCallback } from 'react';
import { 
  camarasService, 
  Camara, 
  ModeloIA, 
  EventoDeteccion, 
  CreateCamaraDto, 
  UpdateCamaraDto,
  CreateModeloIADto,
  UpdateModeloIADto,
  AsignarModeloIADto,
  EstadisticasCamaras
} from '../services/camaras';

export interface UseCamarasReturn {
  // Estado
  camaras: Camara[];
  modelosIA: ModeloIA[];
  eventos: EventoDeteccion[];
  estadisticas: EstadisticasCamaras | null;
  loading: boolean;
  error: string | null;
  
  // Operaciones de cámaras
  fetchCamaras: () => Promise<void>;
  fetchCamara: (id: number) => Promise<Camara>;
  createCamara: (camara: CreateCamaraDto) => Promise<void>;
  updateCamara: (id: number, camara: UpdateCamaraDto) => Promise<void>;
  deleteCamara: (id: number) => Promise<void>;
  
  // Operaciones de modelos de IA
  fetchModelosIA: () => Promise<void>;
  createModeloIA: (modelo: CreateModeloIADto) => Promise<void>;
  updateModeloIA: (id: number, modelo: UpdateModeloIADto) => Promise<void>;
  deleteModeloIA: (id: number) => Promise<void>;
  
  // Operaciones de asignación
  asignarModeloIA: (asignacion: AsignarModeloIADto) => Promise<void>;
  desasignarModeloIA: (camaraId: number, modeloIAId: number) => Promise<void>;
  
  // Operaciones de eventos
  fetchEventos: (params?: {
    camaraId?: number;
    modeloIAId?: number;
    fechaInicio?: string;
    fechaFin?: string;
  }) => Promise<void>;
  registrarEvento: (
    camaraId: number,
    modeloIAId: number,
    evento: {
      tipo_evento: string;
      confianza: number;
      descripcion?: string;
      datos_deteccion?: any;
      imagen_captura?: string;
    }
  ) => Promise<void>;
  
  // Operaciones de estadísticas
  fetchEstadisticas: () => Promise<void>;
  
  // Utilidades
  getCamaraById: (id: number) => Camara | undefined;
  getCamarasPorEstado: (estado: string) => Camara[];
  getCamarasConModeloIA: (tipo: string) => Camara[];
  clearError: () => void;
}

export const useCamaras = (): UseCamarasReturn => {
  const [camaras, setCamaras] = useState<Camara[]>([]);
  const [modelosIA, setModelosIA] = useState<ModeloIA[]>([]);
  const [eventos, setEventos] = useState<EventoDeteccion[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasCamaras | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ===== OPERACIONES DE CÁMARAS =====
  const fetchCamaras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await camarasService.getCamaras();
      setCamaras(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cámaras');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCamara = useCallback(async (id: number): Promise<Camara> => {
    setLoading(true);
    setError(null);
    try {
      const data = await camarasService.getCamara(id);
      // Actualizar la cámara en la lista si existe
      setCamaras(prev => prev.map(cam => cam.id === id ? data : cam));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cámara');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCamara = useCallback(async (camara: CreateCamaraDto) => {
    setLoading(true);
    setError(null);
    try {
      const nuevaCamara = await camarasService.createCamara(camara);
      setCamaras(prev => [...prev, nuevaCamara]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cámara');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCamara = useCallback(async (id: number, camara: UpdateCamaraDto) => {
    setLoading(true);
    setError(null);
    try {
      const camaraActualizada = await camarasService.updateCamara(id, camara);
      setCamaras(prev => prev.map(cam => cam.id === id ? camaraActualizada : cam));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar cámara');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCamara = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await camarasService.deleteCamara(id);
      setCamaras(prev => prev.filter(cam => cam.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar cámara');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== OPERACIONES DE MODELOS DE IA =====
  const fetchModelosIA = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await camarasService.getModelosIA();
      setModelosIA(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar modelos de IA');
    } finally {
      setLoading(false);
    }
  }, []);

  const createModeloIA = useCallback(async (modelo: CreateModeloIADto) => {
    setLoading(true);
    setError(null);
    try {
      const nuevoModelo = await camarasService.createModeloIA(modelo);
      setModelosIA(prev => [...prev, nuevoModelo]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear modelo de IA');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateModeloIA = useCallback(async (id: number, modelo: UpdateModeloIADto) => {
    setLoading(true);
    setError(null);
    try {
      const modeloActualizado = await camarasService.updateModeloIA(id, modelo);
      setModelosIA(prev => prev.map(m => m.id === id ? modeloActualizado : m));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar modelo de IA');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteModeloIA = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await camarasService.deleteModeloIA(id);
      setModelosIA(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar modelo de IA');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== OPERACIONES DE ASIGNACIÓN =====
  const asignarModeloIA = useCallback(async (asignacion: AsignarModeloIADto) => {
    setLoading(true);
    setError(null);
    try {
      await camarasService.asignarModeloIA(asignacion);
      // Recargar la cámara específica para obtener los modelos actualizados
      await fetchCamara(asignacion.camaraId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar modelo de IA');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCamara]);

  const desasignarModeloIA = useCallback(async (camaraId: number, modeloIAId: number) => {
    setLoading(true);
    setError(null);
    try {
      await camarasService.desasignarModeloIA(camaraId, modeloIAId);
      // Recargar la cámara específica para obtener los modelos actualizados
      await fetchCamara(camaraId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desasignar modelo de IA');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCamara]);

  // ===== OPERACIONES DE EVENTOS =====
  const fetchEventos = useCallback(async (params?: {
    camaraId?: number;
    modeloIAId?: number;
    fechaInicio?: string;
    fechaFin?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await camarasService.getEventosDeteccion(params);
      setEventos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarEvento = useCallback(async (
    camaraId: number,
    modeloIAId: number,
    evento: {
      tipo_evento: string;
      confianza: number;
      descripcion?: string;
      datos_deteccion?: any;
      imagen_captura?: string;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const nuevoEvento = await camarasService.registrarEventoDeteccion(camaraId, modeloIAId, evento);
      setEventos(prev => [nuevoEvento, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar evento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== OPERACIONES DE ESTADÍSTICAS =====
  const fetchEstadisticas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await camarasService.getEstadisticas();
      setEstadisticas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== UTILIDADES =====
  const getCamaraById = useCallback((id: number): Camara | undefined => {
    return camaras.find(cam => cam.id === id);
  }, [camaras]);

  const getCamarasPorEstado = useCallback((estado: string): Camara[] => {
    return camaras.filter(cam => cam.estado === estado);
  }, [camaras]);

  const getCamarasConModeloIA = useCallback((tipo: string): Camara[] => {
    return camaras.filter(cam => 
      cam.modelos_ia?.some(modelo => modelo.modeloIA?.tipo === tipo)
    );
  }, [camaras]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchCamaras();
    fetchModelosIA();
    fetchEstadisticas();
  }, [fetchCamaras, fetchModelosIA, fetchEstadisticas]);

  return {
    // Estado
    camaras,
    modelosIA,
    eventos,
    estadisticas,
    loading,
    error,
    
    // Operaciones de cámaras
    fetchCamaras,
    fetchCamara,
    createCamara,
    updateCamara,
    deleteCamara,
    
    // Operaciones de modelos de IA
    fetchModelosIA,
    createModeloIA,
    updateModeloIA,
    deleteModeloIA,
    
    // Operaciones de asignación
    asignarModeloIA,
    desasignarModeloIA,
    
    // Operaciones de eventos
    fetchEventos,
    registrarEvento,
    
    // Operaciones de estadísticas
    fetchEstadisticas,
    
    // Utilidades
    getCamaraById,
    getCamarasPorEstado,
    getCamarasConModeloIA,
    clearError,
  };
}; 