import React, { useState } from 'react';
import { User, Camera, Phone, Mail, Eye, Edit, Trash2, Building, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { Empleado, deleteEmpleado } from '../../../services/empleados';

interface EmpleadoTableProps {
  filteredEmpleados: Empleado[];
  handleOpenModal: (type: 'view' | 'edit', empleado: Empleado) => void;
  onRefresh: () => void;
}

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'ACTIVO':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'INACTIVO':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'SUSPENDIDO':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'DESPEDIDO':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'VACACIONES':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getDepartmentColor = (departamento: string) => {
  switch (departamento.toLowerCase()) {
    case 'seguridad':
      return 'text-blue-400';
    case 'limpieza':
      return 'text-green-400';
    case 'mantenimiento':
      return 'text-yellow-400';
    case 'administración':
      return 'text-purple-400';
    case 'jardinería':
      return 'text-emerald-400';
    default:
      return 'text-gray-400';
  }
};

const EmpleadoTable: React.FC<EmpleadoTableProps> = ({ filteredEmpleados, handleOpenModal, onRefresh }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [empleadoToDelete, setEmpleadoToDelete] = useState<Empleado | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (empleado: Empleado) => {
    setEmpleadoToDelete(empleado);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!empleadoToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deleteEmpleado(empleadoToDelete.id);
      if (success) {
        onRefresh();
        setShowDeleteModal(false);
        setEmpleadoToDelete(null);
      }
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setEmpleadoToDelete(null);
  };

  const formatSalary = (salario?: number) => {
    if (!salario) return 'No especificado';
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(salario);
  };

  const formatTime = (time?: string) => {
    if (!time) return 'No especificado';
    return time;
  };

  return (
    <>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">CI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Departamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Horario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Foto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredEmpleados.map((empleado) => (
                <tr key={empleado.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-300" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {empleado.nombre} {empleado.apellido_paterno} {empleado.apellido_materno}
                        </div>
                        <div className="text-sm text-gray-400">
                          Contratado: {new Date(empleado.fecha_contratacion).toLocaleDateString('es-BO')}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {empleado.ci}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{empleado.cargo}</div>
                    {empleado.salario && (
                      <div className="text-sm text-gray-400 flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{formatSalary(empleado.salario)}</span>
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <Building className={`h-4 w-4 ${getDepartmentColor(empleado.departamento)}`} />
                      <span className={`font-medium ${getDepartmentColor(empleado.departamento)}`}>
                        {empleado.departamento}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(empleado.estado)}`}>
                      {empleado.estado}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">
                          {formatTime(empleado.horario_entrada)} - {formatTime(empleado.horario_salida)}
                        </span>
                      </div>
                      {empleado.dias_trabajo && (
                        <div className="text-xs text-gray-400">
                          {empleado.dias_trabajo}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Camera className="h-4 w-4 text-gray-400" />
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        empleado.foto_registrada 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {empleado.foto_registrada ? 'Registrada' : 'Pendiente'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="space-y-1">
                      {empleado.telefono && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span className="text-xs">{empleado.telefono}</span>
                        </div>
                      )}
                      {empleado.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">{empleado.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenModal('view', empleado)}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal('edit', empleado)}
                        className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(empleado)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Confirmar eliminación</h3>
                <p className="text-sm text-gray-400">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-white">
                ¿Estás seguro que deseas eliminar al empleado{' '}
                <span className="font-semibold">
                  {empleadoToDelete?.nombre} {empleadoToDelete?.apellido_paterno}
                </span>
                ?
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg transition-colors"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmpleadoTable;