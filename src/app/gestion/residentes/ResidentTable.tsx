import React from 'react';
import { User, Camera, MapPin, Phone, Mail, Eye, Edit, Trash2 } from 'lucide-react';
import { Residente } from '../../../services/residentes';

interface ResidentTableProps {
  filteredResidents: Residente[];
  handleOpenModal: (type: 'view' | 'edit', resident: Residente) => void;
}

const ResidentTable: React.FC<ResidentTableProps> = ({ filteredResidents, handleOpenModal }) => (
  <div className="bg-gray-800 rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Residente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">CI</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vivienda</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Zona</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Foto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contacto</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {filteredResidents.map((residente) => (
            <tr key={residente.id} className="hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-300" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">
                      {residente.nombre} {residente.apellido_paterno} {residente.apellido_materno}
                    </div>
                    <div className="text-sm text-gray-400">
                      Registro: {residente.fecha_registro}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {residente.ci}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{residente.vivienda.numero} - Bloque {residente.vivienda.bloque}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {residente.vivienda.zona}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <Camera className="h-4 w-4 text-gray-400" />
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    residente.foto_registrada 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {residente.foto_registrada ? 'Registrada' : 'Pendiente'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <div className="space-y-1">
                  {residente.telefono && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span className="text-xs">{residente.telefono}</span>
                    </div>
                  )}
                  {residente.email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                      <span className="text-xs">{residente.email}</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleOpenModal('view', residente)}
                    className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleOpenModal('edit', residente)}
                    className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
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
);

export default ResidentTable; 