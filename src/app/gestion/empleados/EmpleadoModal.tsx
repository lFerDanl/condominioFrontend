import React, { useState, useEffect } from 'react';
import { X, User, Camera, Phone, Mail, Calendar, MapPin, Save, Building, Clock, DollarSign, Eye, UserCheck } from 'lucide-react';
import { Empleado, createEmpleado, updateEmpleado } from '../../../services/empleados';

interface EmpleadoModalProps {
  showModal: boolean;
  modalType: 'view' | 'edit' | 'create';
  selectedEmpleado: Empleado | null;
  handleCloseModal: () => void;
  onRefresh: () => void;
}

const EmpleadoModal: React.FC<EmpleadoModalProps> = ({ 
  showModal, 
  modalType, 
  selectedEmpleado, 
  handleCloseModal, 
  onRefresh 
}) => {
  const [formData, setFormData] = useState<Partial<Empleado>>({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    telefono: '',
    email: '',
    fecha_nacimiento: '',
    cargo: '',
    departamento: '',
    salario: 0,
    horario_entrada: '',
    horario_salida: '',
    dias_trabajo: '',
    estado: 'ACTIVO',
    foto_registrada: false,
    observaciones: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedEmpleado && (modalType === 'view' || modalType === 'edit')) {
      setFormData(selectedEmpleado);
    } else if (modalType === 'create') {
      setFormData({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        ci: '',
        telefono: '',
        email: '',
        fecha_nacimiento: '',
        cargo: '',
        departamento: '',
        salario: 0,
        horario_entrada: '',
        horario_salida: '',
        dias_trabajo: '',
        estado: 'ACTIVO',
        foto_registrada: false,
        observaciones: ''
      });
    }
  }, [selectedEmpleado, modalType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'salario') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (modalType === 'create') {
        const result = await createEmpleado(formData as Omit<Empleado, 'id' | 'fecha_contratacion' | 'fecha_actualizacion'>);
        if (result) {
          onRefresh();
          handleCloseModal();
        }
      } else if (modalType === 'edit' && selectedEmpleado) {
        const result = await updateEmpleado(selectedEmpleado.id, formData);
        if (result) {
          onRefresh();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error al guardar empleado:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return 'text-green-400';
      case 'INACTIVO':
        return 'text-gray-400';
      case 'SUSPENDIDO':
        return 'text-yellow-400';
      case 'DESPEDIDO':
        return 'text-red-400';
      case 'VACACIONES':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!showModal) return null;

  const isReadOnly = modalType === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <UserCheck className="h-6 w-6 text-green-400" />
            <span>
              {modalType === 'create' ? 'Nuevo Empleado' : 
               modalType === 'edit' ? 'Editar Empleado' : 'Detalles del Empleado'}
            </span>
          </h3>
          <button
            onClick={handleCloseModal}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del empleado */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-white">
                {formData.nombre} {formData.apellido_paterno} {formData.apellido_materno}
              </h4>
              <p className="text-gray-400">CI: {formData.ci}</p>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-2">
                  <Camera className="h-4 w-4 text-gray-500" />
                  <span className={`text-xs ${formData.foto_registrada ? 'text-green-400' : 'text-red-400'}`}>
                    {formData.foto_registrada ? 'Foto registrada' : 'Sin foto'}
                  </span>
                </div>
                {formData.estado && (
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${getEstadoColor(formData.estado).replace('text-', 'bg-')}`}></div>
                    <span className={`text-xs ${getEstadoColor(formData.estado)}`}>
                      {formData.estado}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-300 uppercase tracking-wide flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Información Personal</span>
              </h5>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre || ''}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Apellido Paterno *</label>
                  <input
                    type="text"
                    name="apellido_paterno"
                    value={formData.apellido_paterno || ''}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Apellido Materno</label>
                  <input
                    type="text"
                    name="apellido_materno"
                    value={formData.apellido_materno || ''}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">CI *</label>
                  <input
                    type="text"
                    name="ci"
                    value={formData.ci || ''}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono || ''}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Fecha de Nacimiento</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento || ''}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información Laboral */}
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-300 uppercase tracking-wide flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Información Laboral</span>
              </h5>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cargo *</label>
                  <input
                    type="text"
                    name="cargo"
                    value={formData.cargo || ''}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Departamento *</label>
                  <select
                    name="departamento"
                    value={formData.departamento || ''}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">Seleccionar departamento</option>
                    <option value="Seguridad">Seguridad</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Administración">Administración</option>
                    <option value="Jardinería">Jardinería</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Estado</label>
                  <select
                    name="estado"
                    value={formData.estado || 'ACTIVO'}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="SUSPENDIDO">Suspendido</option>
                    <option value="DESPEDIDO">Despedido</option>
                    <option value="VACACIONES">Vacaciones</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Salario</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="number"
                      name="salario"
                      value={formData.salario || ''}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Horario de Entrada</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="time"
                      name="horario_entrada"
                      value={formData.horario_entrada || ''}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Horario de Salida</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="time"
                      name="horario_salida"
                      value={formData.horario_salida || ''}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Días de Trabajo</label>
                  <input
                    type="text"
                    name="dias_trabajo"
                    value={formData.dias_trabajo || ''}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    placeholder="Ej: Lunes a Viernes"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="foto_registrada"
                  name="foto_registrada"
                  checked={formData.foto_registrada || false}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="foto_registrada" className="text-sm text-gray-400">
                  Foto registrada
                </label>
              </div>
            </div>
          </div>
          
          {/* Observaciones */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Observaciones</label>
            <textarea
              name="observaciones"
              value={formData.observaciones || ''}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Notas adicionales sobre el empleado..."
            />
          </div>

          {/* Botones */}
          {!isReadOnly && (
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? 'Guardando...' : modalType === 'create' ? 'Crear Empleado' : 'Guardar Cambios'}</span>
              </button>
            </div>
          )}
          
          {isReadOnly && (
            <div className="flex justify-end pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EmpleadoModal;