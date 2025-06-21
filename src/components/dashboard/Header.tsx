import React, { useState, useEffect } from 'react';
import { Menu, Shield, Settings, ChevronDown, Users, UserCheck, Camera, FileText, Home, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type HeaderProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

type DropdownMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const DropdownMenu: React.FC<DropdownMenuProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute top-full left-0 mt-2 w-56 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-20">
        {children}
      </div>
    </>
  );
};

type MenuItemProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full px-4 py-3 text-left hover:bg-gray-600 transition-colors border-b border-gray-600 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
  >
    <div className="flex items-start space-x-3">
      <div className="text-blue-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </div>
  </button>
);

// Componente para el menú móvil de navegación
const MobileNavigationMenu: React.FC<{ isOpen: boolean; onClose: () => void; onNavigation: (page: string) => void }> = ({ 
  isOpen, 
  onClose, 
  onNavigation 
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Menú móvil */}
      <div className={`md:hidden fixed top-0 right-0 h-full w-80 bg-gray-800 border-l border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Navegación</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto h-full pb-20">
          {/* Dashboard */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">PRINCIPAL</h3>
            <button
              onClick={() => {
                onNavigation('dashboard');
                onClose();
              }}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="h-5 w-5 text-blue-400" />
              <div className="text-left">
                <p className="text-sm font-medium">Dashboard</p>
                <p className="text-xs text-gray-400">Panel principal</p>
              </div>
            </button>
          </div>

          {/* Gestión */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">GESTIÓN</h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onNavigation('residentes');
                  onClose();
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Users className="h-5 w-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-sm font-medium">Gestión de Residentes</p>
                  <p className="text-xs text-gray-400">Administrar información de residentes</p>
                </div>
              </button>
              <button
                onClick={() => {
                  onNavigation('personal');
                  onClose();
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <UserCheck className="h-5 w-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-sm font-medium">Gestión de Personal</p>
                  <p className="text-xs text-gray-400">Administrar empleados y personal</p>
                </div>
              </button>
            </div>
          </div>

          {/* Seguridad */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">SEGURIDAD</h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onNavigation('reconocimiento-facial');
                  onClose();
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Camera className="h-5 w-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-sm font-medium">Reconocimiento Facial</p>
                  <p className="text-xs text-gray-400">Sistema de autenticación biométrica</p>
                </div>
              </button>
              <button
                onClick={() => {
                  onNavigation('control-acceso');
                  onClose();
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Shield className="h-5 w-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-sm font-medium">Control de Acceso</p>
                  <p className="text-xs text-gray-400">Gestionar permisos y accesos</p>
                </div>
              </button>
            </div>
          </div>

          {/* Reportes */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">REPORTES</h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onNavigation('reportes-seguridad');
                  onClose();
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FileText className="h-5 w-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-sm font-medium">Reportes de Seguridad</p>
                  <p className="text-xs text-gray-400">Incidentes y actividad del sistema</p>
                </div>
              </button>
              <button
                onClick={() => {
                  onNavigation('reportes-residentes');
                  onClose();
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Users className="h-5 w-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-sm font-medium">Reportes de Residentes</p>
                  <p className="text-xs text-gray-400">Actividad y estadísticas</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleDropdownToggle = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  const handleNavigation = (page: string) => {
    const routes: { [key: string]: string } = {
      'dashboard': '/dashboard',
      'residentes': '/gestion/residentes',
      'personal': '/gestion/empleados',
      'reconocimiento-facial': '/seguridad/reconocimiento-facial',
      'control-acceso': '/control-acceso',
      'reportes-seguridad': '/reportes/seguridad',
      'reportes-residentes': '/reportes/residentes',
    };
    
    const path = routes[page];
    if (path) {
      router.push(path);
    }
    closeDropdown();
  };

  useEffect(() => {
    const handleBodyScroll = () => {
      if (mobileNavOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    };

    handleBodyScroll();

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileNavOpen]);

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0 relative z-50">
      <div className="flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
            <h1 className="text-lg sm:text-2xl font-bold">SecureWatch</h1>
          </div>
          <div className="hidden sm:block text-sm text-gray-400">
            Condominio Vista Real
          </div>
        </div>

        {/* Navegación Principal - Solo visible en desktop */}
        <nav className="hidden md:flex items-center space-x-1">
          {/* Dashboard */}
          <button
            onClick={() => handleNavigation('dashboard')}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="text-sm">Dashboard</span>
          </button>

          {/* Gestión de Personas */}
          <div className="relative">
            <button
              onClick={() => handleDropdownToggle('personas')}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span className="text-sm">Gestión</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${activeDropdown === 'personas' ? 'rotate-180' : ''}`} />
            </button>
            <DropdownMenu isOpen={activeDropdown === 'personas'} onClose={closeDropdown}>
              <MenuItem
                icon={<Users className="h-4 w-4" />}
                title="Gestión de Residentes"
                description="Administrar información de residentes"
                onClick={() => handleNavigation('residentes')}
              />
              <MenuItem
                icon={<UserCheck className="h-4 w-4" />}
                title="Gestión de Personal"
                description="Administrar empleados y personal"
                onClick={() => handleNavigation('personal')}
              />
            </DropdownMenu>
          </div>

          {/* Seguridad */}
          <div className="relative">
            <button
              onClick={() => handleDropdownToggle('seguridad')}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Camera className="h-4 w-4" />
              <span className="text-sm">Seguridad</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${activeDropdown === 'seguridad' ? 'rotate-180' : ''}`} />
            </button>
            <DropdownMenu isOpen={activeDropdown === 'seguridad'} onClose={closeDropdown}>
              <MenuItem
                icon={<Camera className="h-4 w-4" />}
                title="Reconocimiento Facial"
                description="Sistema de autenticación biométrica"
                onClick={() => handleNavigation('reconocimiento-facial')}
              />
              <MenuItem
                icon={<Shield className="h-4 w-4" />}
                title="Control de Acceso"
                description="Gestionar permisos y accesos"
                onClick={() => handleNavigation('control-acceso')}
              />
            </DropdownMenu>
          </div>

          {/* Reportes */}
          <div className="relative">
            <button
              onClick={() => handleDropdownToggle('reportes')}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm">Reportes</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${activeDropdown === 'reportes' ? 'rotate-180' : ''}`} />
            </button>
            <DropdownMenu isOpen={activeDropdown === 'reportes'} onClose={closeDropdown}>
              <MenuItem
                icon={<FileText className="h-4 w-4" />}
                title="Reportes de Seguridad"
                description="Incidentes y actividad del sistema"
                onClick={() => handleNavigation('reportes-seguridad')}
              />
              <MenuItem
                icon={<Users className="h-4 w-4" />}
                title="Reportes de Residentes"
                description="Actividad y estadísticas"
                onClick={() => handleNavigation('reportes-residentes')}
              />
            </DropdownMenu>
          </div>

          {/* Estado del sistema y configuración */}
          <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm text-green-400">Sistema Activo</span>
            </div>
            
            <button className="hidden sm:block p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </nav>

        {/* Botón de menú móvil y elementos móviles */}
        <div className="flex items-center space-x-2">
          <div className="md:hidden flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Activo</span>
          </div>
          
          {/* Botón de menú móvil */}
          <button 
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <button className="hidden md:block p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

      {/* Menú móvil de navegación */}
      <MobileNavigationMenu 
        isOpen={mobileNavOpen} 
        onClose={() => setMobileNavOpen(false)}
        onNavigation={handleNavigation}
      />
    </header>
  );
};

export default Header;