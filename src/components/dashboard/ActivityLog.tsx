import React from 'react';
import { Activity } from 'lucide-react';

const ActivityLog: React.FC = () => (
  <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
      <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
      Actividad Reciente
    </h3>
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <div className="h-2 w-2 bg-green-400 rounded-full flex-shrink-0"></div>
        <div>
          <p className="text-sm">Movimiento detectado</p>
          <p className="text-xs text-gray-400">14:32 - Entrada Principal</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="h-2 w-2 bg-blue-400 rounded-full flex-shrink-0"></div>
        <div>
          <p className="text-sm">Grabación iniciada</p>
          <p className="text-xs text-gray-400">14:30 - Estacionamiento A</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="h-2 w-2 bg-red-400 rounded-full flex-shrink-0"></div>
        <div>
          <p className="text-sm">Cámara desconectada</p>
          <p className="text-xs text-gray-400">14:15 - Pasillo Piso 2</p>
        </div>
      </div>
    </div>
  </div>
);

export default ActivityLog; 