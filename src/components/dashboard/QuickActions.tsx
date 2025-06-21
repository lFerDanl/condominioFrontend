import React from 'react';
import { Download, Camera, FileText, Settings, AlertTriangle, Users } from 'lucide-react';

type QuickActionsProps = {
  onExportRecording?: () => void;
  onTakeSnapshot?: () => void;
  onCreateReport?: () => void;
  onSystemSettings?: () => void;
  onViewAlerts?: () => void;
  onManageUsers?: () => void;
};

const QuickActions: React.FC<QuickActionsProps> = ({
  onExportRecording,
  onTakeSnapshot,
  onCreateReport,
  onSystemSettings,
  onViewAlerts,
  onManageUsers
}) => (
  <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Acciones Rápidas</h3>
    <div className="space-y-2">
      <button 
        onClick={onExportRecording}
        className="w-full p-2 sm:p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm sm:text-base flex items-center justify-center space-x-2"
      >
        <Download className="h-4 w-4" />
        <span>Exportar Grabación</span>
      </button>
      <button 
        onClick={onTakeSnapshot}
        className="w-full p-2 sm:p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm sm:text-base flex items-center justify-center space-x-2"
      >
        <Camera className="h-4 w-4" />
        <span>Tomar Captura</span>
      </button>
      <button 
        onClick={onCreateReport}
        className="w-full p-2 sm:p-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors text-sm sm:text-base flex items-center justify-center space-x-2"
      >
        <FileText className="h-4 w-4" />
        <span>Crear Reporte</span>
      </button>
      <button 
        onClick={onViewAlerts}
        className="w-full p-2 sm:p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm sm:text-base flex items-center justify-center space-x-2"
      >
        <AlertTriangle className="h-4 w-4" />
        <span>Ver Alertas</span>
      </button>
      <button 
        onClick={onManageUsers}
        className="w-full p-2 sm:p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm sm:text-base flex items-center justify-center space-x-2"
      >
        <Users className="h-4 w-4" />
        <span>Gestionar Usuarios</span>
      </button>
      <button 
        onClick={onSystemSettings}
        className="w-full p-2 sm:p-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm sm:text-base flex items-center justify-center space-x-2"
      >
        <Settings className="h-4 w-4" />
        <span>Configuración</span>
      </button>
    </div>
  </div>
);

export default QuickActions; 