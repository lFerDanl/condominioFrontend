import React from 'react';
import { UserCheck, Users, Building, Camera, UserX } from 'lucide-react';

interface EmpleadoStatsProps {
  totalEmpleados: number;
  empleadosActivos: number;
  empleadosInactivos: number;
  totalDepartamentos: number;
  conFotoRegistrada: number;
  sinFotoRegistrada: number;
}

const EmpleadoStats: React.FC<EmpleadoStatsProps> = ({ 
  totalEmpleados, 
  empleadosActivos, 
  empleadosInactivos, 
  totalDepartamentos,
  conFotoRegistrada,
  sinFotoRegistrada 
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Total Empleados</p>
          <p className="text-2xl font-bold text-white">{totalEmpleados}</p>
        </div>
        <Users className="h-8 w-8 text-blue-400" />
      </div>
    </div>
    
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Activos</p>
          <p className="text-2xl font-bold text-green-400">{empleadosActivos}</p>
        </div>
        <UserCheck className="h-8 w-8 text-green-400" />
      </div>
    </div>
    
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Inactivos</p>
          <p className="text-2xl font-bold text-red-400">{empleadosInactivos}</p>
        </div>
        <UserX className="h-8 w-8 text-red-400" />
      </div>
    </div>
    
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Departamentos</p>
          <p className="text-2xl font-bold text-purple-400">{totalDepartamentos}</p>
        </div>
        <Building className="h-8 w-8 text-purple-400" />
      </div>
    </div>
    
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Con Foto</p>
          <p className="text-2xl font-bold text-green-400">{conFotoRegistrada}</p>
        </div>
        <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
          <Camera className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
    
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Sin Foto</p>
          <p className="text-2xl font-bold text-red-400">{sinFotoRegistrada}</p>
        </div>
        <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
          <Camera className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  </div>
);

export default EmpleadoStats;