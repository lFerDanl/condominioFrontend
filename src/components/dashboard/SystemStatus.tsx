import React from 'react';

const SystemStatus: React.FC = () => (
  <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Estado del Sistema</h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm">Almacenamiento</span>
        <span className="text-sm text-green-400">68% usado</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className="bg-green-500 h-2 rounded-full" style={{width: '68%'}}></div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">CPU</span>
        <span className="text-sm text-yellow-400">45%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '45%'}}></div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Red</span>
        <span className="text-sm text-green-400">Estable</span>
      </div>
    </div>
  </div>
);

export default SystemStatus; 