import React from 'react';
import { Users, Home, Camera } from 'lucide-react';

interface ResidentStatsProps {
  totalResidentes: number;
  totalViviendas: number;
  conFotoRegistrada: number;
  sinFotoRegistrada: number;
}

const ResidentStats: React.FC<ResidentStatsProps> = ({ totalResidentes, totalViviendas, conFotoRegistrada, sinFotoRegistrada }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Total Residentes</p>
          <p className="text-2xl font-bold text-white">{totalResidentes}</p>
        </div>
        <Users className="h-8 w-8 text-blue-400" />
      </div>
    </div>
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Total Viviendas</p>
          <p className="text-2xl font-bold text-purple-400">{totalViviendas}</p>
        </div>
        <Home className="h-8 w-8 text-purple-400" />
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

export default ResidentStats; 