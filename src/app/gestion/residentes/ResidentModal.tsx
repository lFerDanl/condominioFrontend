import React, { useState, useEffect } from 'react';
import { X, User, Camera, Phone, Mail, Calendar, MapPin, Save, Home } from 'lucide-react';
import { Residente, Vivienda, createResidente, createVivienda, deleteResidente, updateResidente, updateVivienda } from '../../../services/residentes';

interface ResidentModalProps {
  showModal: boolean;
  modalType: 'view' | 'edit' | 'create' | 'delete';
  selectedResident: Residente | null;
  handleCloseModal: () => void;
  onRefresh: () => void;
}

const ResidentModal: React.FC<ResidentModalProps> = ({ 
  showModal, 
  modalType, 
  selectedResident, 
  handleCloseModal, 
  onRefresh 
}) => {
  const [formData, setFormData] = useState<Partial<Residente>>({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    telefono: '',
    email: '',
    fecha_nacimiento: '',
    foto_registrada: false,
    viviendaId: 0,
    vivienda: {
      id: 0,
      numero: '',
      bloque: '',
      zona: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedResident && (modalType === 'view' || modalType === 'edit')) {
      setFormData(selectedResident);
    } else if (modalType === 'create') {
      setFormData({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        ci: '',
        telefono: '',
        email: '',
        fecha_nacimiento: '',
        foto_registrada: false,
        viviendaId: 0,
        vivienda: {
          id: 0,
          numero: '',
          bloque: '',
          zona: ''
        }
      });
    }
  }, [selectedResident, modalType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name.startsWith('vivienda.')) {
      const viviendaField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vivienda: {
          ...prev.vivienda!,
          [viviendaField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (modalType === 'create') {
        const viviendaData = {
          numero: formData.vivienda?.numero,
          bloque: formData.vivienda?.bloque,
          zona: formData.vivienda?.zona
        };
        const result = await createVivienda(viviendaData as any);
        formData.viviendaId = result?.id || 0;

        const residenteData = {
          nombre: formData.nombre,
          apellido_paterno: formData.apellido_paterno,
          apellido_materno: formData.apellido_materno,
          ci: formData.ci,
          telefono: formData.telefono,
          email: formData.email,
          fecha_nacimiento: formData.fecha_nacimiento,
          viviendaId: formData.viviendaId,  
          foto_registrada: formData.foto_registrada,
          fecha_registro: formData.fecha_registro
        };
        const result2 = await createResidente(residenteData as any);

        if (result && result2) {
          onRefresh();
          handleCloseModal();
        }
      } else if (modalType === 'edit' && selectedResident) {
        const viviendaData = {
          numero: formData.vivienda?.numero,
          bloque: formData.vivienda?.bloque,
          zona: formData.vivienda?.zona
        };
        const result2 = await updateVivienda(selectedResident.viviendaId, viviendaData as any);
        const residenteData = {
          nombre: formData.nombre,
          apellido_paterno: formData.apellido_paterno,
          apellido_materno: formData.apellido_materno,
          ci: formData.ci,
          telefono: formData.telefono,
          email: formData.email,
          fecha_nacimiento: formData.fecha_nacimiento,
          viviendaId: formData.viviendaId,
          foto_registrada: formData.foto_registrada,
          fecha_registro: formData.fecha_registro
        };
        const result = await updateResidente(selectedResident.id, residenteData as any);
        if (result2 && result) {
          onRefresh();
          handleCloseModal();
        }
      }else{
        /*+if(modalType === 'delete'){
          const result2 = await deleteVivienda(selectedResident?.viviendaId || 0);
          const result = await deleteResidente(selectedResident?.id || 0);
          if (result) {
            onRefresh();
            handleCloseModal();
          }
        }*/
      }
    } catch (error) {
      console.error('Error al guardar residente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showModal) return null;

  const isReadOnly = modalType === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <User className="h-6 w-6 text-blue-400" />
            <span>
              {modalType === 'create' ? 'Nuevo Residente' : 
               modalType === 'edit' ? 'Editar Residente' : 'Detalles del Residente'}
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
          {/* Información del residente */}
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

            {/* Información de Residencia */}
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-300 uppercase tracking-wide flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Información de Residencia</span>
              </h5>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Número de Vivienda *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      name="vivienda.numero"
                      value={formData.vivienda?.numero || ''}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      required
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Bloque *</label>
                  <input
                    type="text"
                    name="vivienda.bloque"
                    value={formData.vivienda?.bloque || ''}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Zona *</label>
                  <select
                    name="vivienda.zona"
                    value={formData.vivienda?.zona || ''}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">Seleccionar zona</option>
                    <option value="A">Zona A</option>
                    <option value="B">Zona B</option>
                    <option value="C">Zona C</option>
                    <option value="D">Zona D</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Fecha de Registro</label>
                  <span className="text-white">{formData.fecha_registro || 'No disponible'}</span>
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
                <span>{isSubmitting ? 'Guardando...' : modalType === 'create' ? 'Crear Residente' : 'Guardar Cambios'}</span>
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

export default ResidentModal; 
