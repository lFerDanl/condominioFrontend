import React, { useState, useEffect } from 'react';
import { X, Camera, Settings, AlertCircle, Cpu } from 'lucide-react';
import { Camara, CreateCamaraDto, UpdateCamaraDto, ModeloIA } from '../../services/camaras';

interface CamaraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (camara: CreateCamaraDto | UpdateCamaraDto, selectedModelos?: number[]) => Promise<void>;
  camara?: Camara | null;
  modelosIA: ModeloIA[];
  loading?: boolean;
}

const CamaraModal: React.FC<CamaraModalProps> = ({
  isOpen,
  onClose,
  onSave,
  camara,
  modelosIA,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateCamaraDto>({
    nombre: '',
    ubicacion: '',
    descripcion: '',
    tipo: 'IP',
    estado: 'ACTIVA',
    ip_address: '',
    puerto: undefined,
    username: '',
    password: '',
    url_stream: '',
    grabacion_activa: false,
    retencion_dias: 30,
  });

  const [selectedModelos, setSelectedModelos] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (camara) {
      setFormData({
        nombre: camara.nombre,
        ubicacion: camara.ubicacion,
        descripcion: camara.descripcion || '',
        tipo: camara.tipo,
        estado: camara.estado,
        ip_address: camara.ip_address || '',
        puerto: camara.puerto || undefined,
        username: camara.username || '',
        password: camara.password || '',
        url_stream: camara.url_stream || '',
        grabacion_activa: camara.grabacion_activa,
        retencion_dias: camara.retencion_dias,
      });
      setSelectedModelos(camara.modelos_ia?.map(m => m.modeloIAId) || []);
    } else {
      setFormData({
        nombre: '',
        ubicacion: '',
        descripcion: '',
        tipo: 'IP',
        estado: 'ACTIVA',
        ip_address: '',
        puerto: undefined,
        username: '',
        password: '',
        url_stream: '',
        grabacion_activa: false,
        retencion_dias: 30,
      });
      setSelectedModelos([]);
    }
    setErrors({});
  }, [camara, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = 'La ubicación es requerida';
    }

    if (formData.tipo === 'IP') {
      if (!formData.ip_address?.trim()) {
        newErrors.ip_address = 'La dirección IP es requerida para cámaras IP';
      }
      if (!formData.puerto) {
        newErrors.puerto = 'El puerto es requerido para cámaras IP';
      }
    }

    if (formData.tipo === 'RTSP' || formData.tipo === 'HTTP') {
      if (!formData.url_stream?.trim()) {
        newErrors.url_stream = 'La URL del stream es requerida';
      }
    }

    if (formData.retencion_dias && (formData.retencion_dias < 1 || formData.retencion_dias > 365)) {
      newErrors.retencion_dias = 'La retención debe estar entre 1 y 365 días';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData, selectedModelos);
      onClose();
    } catch (error) {
      console.error('Error al guardar cámara:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleModelosChange = (modeloId: number) => {
    setSelectedModelos(prev => 
      prev.includes(modeloId) 
        ? prev.filter(id => id !== modeloId)
        : [...prev, modeloId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Camera className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold">
              {camara ? 'Editar Cámara' : 'Agregar Nueva Cámara'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Ej: Cámara Principal"
              />
              {errors.nombre && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.nombre}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ubicación *
              </label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.ubicacion ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Ej: Portón Principal"
              />
              {errors.ubicacion && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.ubicacion}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Descripción opcional de la cámara"
            />
          </div>

          {/* Tipo y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Cámara *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="IP">IP</option>
                <option value="WEBCAM">Webcam</option>
                <option value="USB">USB</option>
                <option value="RTSP">RTSP</option>
                <option value="HTTP">HTTP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Estado *
              </label>
              <select
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
                <option value="FALLA">Falla</option>
                <option value="DESCONECTADA">Desconectada</option>
              </select>
            </div>
          </div>

          {/* Configuración de Conexión */}
          {(formData.tipo === 'IP' || formData.tipo === 'RTSP' || formData.tipo === 'HTTP') && (
            <div className="border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configuración de Conexión
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.tipo === 'IP' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Dirección IP *
                      </label>
                      <input
                        type="text"
                        value={formData.ip_address}
                        onChange={(e) => handleInputChange('ip_address', e.target.value)}
                        className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.ip_address ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="192.168.1.100"
                      />
                      {errors.ip_address && (
                        <p className="text-red-400 text-sm mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.ip_address}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Puerto *
                      </label>
                      <input
                        type="number"
                        value={formData.puerto || ''}
                        onChange={(e) => handleInputChange('puerto', parseInt(e.target.value) || undefined)}
                        className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.puerto ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="8080"
                        min="1"
                        max="65535"
                      />
                      {errors.puerto && (
                        <p className="text-red-400 text-sm mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.puerto}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {(formData.tipo === 'RTSP' || formData.tipo === 'HTTP') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      URL del Stream *
                    </label>
                    <input
                      type="url"
                      value={formData.url_stream}
                      onChange={(e) => handleInputChange('url_stream', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.url_stream ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="rtsp://192.168.1.100:554/stream"
                    />
                    {errors.url_stream && (
                      <p className="text-red-400 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.url_stream}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Configuración de Grabación */}
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Configuración de Grabación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="grabacion_activa"
                  checked={formData.grabacion_activa}
                  onChange={(e) => handleInputChange('grabacion_activa', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="grabacion_activa" className="text-sm font-medium">
                  Grabación Activa
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Retención (días)
                </label>
                <input
                  type="number"
                  value={formData.retencion_dias}
                  onChange={(e) => handleInputChange('retencion_dias', parseInt(e.target.value) || 30)}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.retencion_dias ? 'border-red-500' : 'border-gray-600'
                  }`}
                  min="1"
                  max="365"
                />
                {errors.retencion_dias && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.retencion_dias}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Configuración de IA */}
          {camara && (
            <div>
              <h3 className="text-lg font-semibold border-t border-gray-700 pt-6 mt-6 mb-4 flex items-center">
                <Cpu className="h-5 w-5 mr-2" />
                Asignación de Modelos de IA
              </h3>
              <div className="space-y-2">
                {modelosIA.map(modelo => (
                  <div key={modelo.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                    <div>
                      <p className="font-medium">{modelo.nombre}</p>
                      <p className="text-sm text-gray-400">{modelo.tipo.replace(/_/g, ' ')} - v{modelo.version}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedModelos.includes(modelo.id)}
                      onChange={() => handleModelosChange(modelo.id)}
                      className="h-5 w-5 rounded bg-gray-900 border-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {loading ? 'Guardando...' : camara ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CamaraModal; 