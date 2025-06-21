import React from 'react';
import { Camera, Monitor, X, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

type CameraType = {
  id: number;
  name: string;
  location: string;
  status: string;
  lastSeen: string;
  type: 'ip' | 'webcam';
  ipAddress?: string;
  port?: string;
  username?: string;
  password?: string;
  stream?: MediaStream;
  recognitionActive?: boolean;
};

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  cameras: CameraType[];
  selectedCamera: number;
  setSelectedCamera: (index: number) => void;
  getStatusColor: (status: string) => string;
  onAddCamera: () => void;
  onDeleteCamera: (index: number) => void;
  onToggleRecognition: (index: number) => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  cameras,
  selectedCamera,
  setSelectedCamera,
  getStatusColor,
  onAddCamera,
  onDeleteCamera,
  onToggleRecognition,
}) => (
  <>
    {/* Overlay para móvil */}
    {sidebarOpen && (
      <div 
        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setSidebarOpen(false)}
      />
    )}
    
    {/* Sidebar */}
    <aside className={`${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 fixed lg:relative top-0 left-0 lg:top-auto lg:left-auto z-50 lg:z-auto w-80 xl:w-96 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto flex-shrink-0 transition-transform duration-300 ease-in-out h-screen lg:h-full`}>
      {/* Botón de cerrar para móvil */}
      <button 
        onClick={() => setSidebarOpen(false)}
        className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-lg transition-colors z-10"
      >
        <X className="h-5 w-5" />
      </button>
      
      {/* Contenido del sidebar */}
      <div className="pt-12 lg:pt-0">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              <span className="text-xl sm:text-2xl font-bold">{cameras.length}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Cámaras</p>
          </div>
          <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
              <span className="text-xl sm:text-2xl font-bold">{cameras.filter(c => c.recognitionActive).length}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Activas</p>
          </div>
        </div>
        
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center">
              <Monitor className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Cámaras de Reconocimiento
            </h3>
            <button
              onClick={onAddCamera}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              title="Agregar cámara"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {cameras.map((camera, index) => (
              <div
                key={camera.id}
                className={`p-2 sm:p-3 rounded-lg transition-colors ${
                  selectedCamera === index 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedCamera(index);
                      setSidebarOpen(false);
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm sm:text-base">{camera.name}</p>
                        <p className="text-xs sm:text-sm opacity-75">{camera.location}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs opacity-60">
                            {camera.type === 'ip' ? `IP: ${camera.ipAddress}` : 'Webcam'}
                          </span>
                          <div className={`h-2 w-2 rounded-full ${camera.recognitionActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                          <span className="text-xs opacity-60">
                            {camera.recognitionActive ? 'Reconociendo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(camera.status)}`}></div>
                        <span className="text-xs opacity-75">{camera.lastSeen}</span>
                      </div>
                    </div>
                  </button>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => onToggleRecognition(index)}
                      className={`p-1 rounded transition-colors ${
                        camera.recognitionActive 
                          ? 'hover:bg-red-600 text-green-400' 
                          : 'hover:bg-green-600 text-gray-400'
                      }`}
                      title={camera.recognitionActive ? 'Desactivar reconocimiento' : 'Activar reconocimiento'}
                    >
                      {camera.recognitionActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={() => onDeleteCamera(index)}
                      className="p-1 hover:bg-red-600 rounded transition-colors"
                      title="Eliminar cámara"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  </>
);

export default Sidebar; 