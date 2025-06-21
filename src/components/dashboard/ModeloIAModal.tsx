import React, { useState, useEffect } from 'react';
import { X, Cpu, Settings, AlertCircle } from 'lucide-react';
import { ModeloIA, CreateModeloIADto, UpdateModeloIADto } from '../../services/camaras';

interface ModeloIAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (modelo: CreateModeloIADto | UpdateModeloIADto) => Promise<void>;
  modelo?: ModeloIA | null;
  loading?: boolean;
}

const TIPOS_MODELO_IA = [
  'DETECCION_FACIAL',
  'RECONOCIMIENTO_FACIAL',
  'VERIFICACION_FACIAL',
  'DETECCION_ACTIVIDAD_SOSPECHOSA',
  'DETECCION_INTRUSION_ZONA_RESTRINGIDA',
  'DETECCION_ACTIVIDAD_VIOLENTA',
  'DETECCION_MOVIMIENTO',
];

const ModeloIAModal: React.FC<ModeloIAModalProps> = ({
  isOpen,
  onClose,
  onSave,
  modelo,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateModeloIADto>({
    nombre: '',
    descripcion: '',
    tipo: 'RECONOCIMIENTO_FACIAL',
    version: '',
    proveedor: '',
    activo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (modelo) {
      setFormData({
        nombre: modelo.nombre,
        descripcion: modelo.descripcion || '',
        tipo: modelo.tipo,
        version: modelo.version,
        proveedor: modelo.proveedor || '',
        activo: modelo.activo,
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        tipo: 'RECONOCIMIENTO_FACIAL',
        version: '1.0',
        proveedor: '',
        activo: true,
      });
    }
    setErrors({});
  }, [modelo, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.version.trim()) {
      newErrors.version = 'La version es requerida';
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
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar modelo de IA:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Cpu className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold">
              {modelo ? 'Editar Modelo de IA' : 'Agregar Nuevo Modelo de IA'}
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
                placeholder="Ej: Reconocimiento Facial"
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
                Versión *
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.version ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Ej: 1.0.0"
              />
              {errors.version && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.version}
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
              placeholder="Descripción opcional del modelo"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Modelo *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIPOS_MODELO_IA.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo.replace(/_/g, ' ').toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Proveedor
              </label>
              <input
                type="text"
                value={formData.proveedor}
                onChange={(e) => handleInputChange('proveedor', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: CompreFace"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => handleInputChange('activo', e.target.checked)}
              className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="activo" className="text-sm font-medium">
              Activo
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 mr-3 text-white bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <Settings className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <Cpu className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Guardando...' : 'Guardar Modelo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModeloIAModal; 