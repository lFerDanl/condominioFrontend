'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Upload, Download, Clock, DollarSign } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import EmpleadoModal from './EmpleadoModal';
import EmpleadoTable from './EmpleadoTabla';
import EmpleadoStats from './EmpleadoStats';
import EmpleadoFilters from './EmpleadoFilters';
import { getEmpleados, Empleado } from '../../../services/empleados';

export default function GestionEmpleados() {
  const [allEmpleados, setAllEmpleados] = useState<Empleado[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [departmentFilter, setDepartmentFilter] = useState('todos');
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create'>('view');
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchEmpleados = async () => {
      const empleadosData = await getEmpleados();
      setAllEmpleados(empleadosData);
    };

    fetchEmpleados();
  }, []);

  // Filtrar empleados
  const filteredEmpleados = allEmpleados.filter(empleado => {
    const matchesSearch = 
      empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.apellido_paterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.apellido_materno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.ci.includes(searchTerm) ||
      empleado.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.departamento.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatusFilter = 
      selectedFilter === 'todos' || 
      (selectedFilter === 'activos' && empleado.estado === 'ACTIVO') ||
      (selectedFilter === 'inactivos' && empleado.estado === 'INACTIVO') ||
      (selectedFilter === 'con_foto' && empleado.foto_registrada) ||
      (selectedFilter === 'sin_foto' && !empleado.foto_registrada);

    const matchesDepartmentFilter = 
      departmentFilter === 'todos' || 
      empleado.departamento.toLowerCase() === departmentFilter.toLowerCase();

    return matchesSearch && matchesStatusFilter && matchesDepartmentFilter;
  });

  // Calcular estadísticas
  const totalEmpleados = allEmpleados.length;
  const empleadosActivos = allEmpleados.filter(e => e.estado === 'ACTIVO').length;
  const empleadosInactivos = allEmpleados.filter(e => e.estado === 'INACTIVO').length;
  const conFotoRegistrada = allEmpleados.filter(e => e.foto_registrada).length;
  const sinFotoRegistrada = allEmpleados.filter(e => !e.foto_registrada).length;
  
  // Departamentos únicos
  const departamentos = [...new Set(allEmpleados.map(e => e.departamento))];
  const totalDepartamentos = departamentos.length;

  const handleOpenModal = (type: 'view' | 'edit' | 'create', empleado?: Empleado) => {
    setModalType(type);
    setSelectedEmpleado(empleado || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmpleado(null);
  };

  const handleRefresh = async () => {
    const empleadosData = await getEmpleados();
    setAllEmpleados(empleadosData);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col">
        {/* Sub-header específico de la página */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <UserCheck className="h-8 w-8 text-green-400" />
              <div>
                <h2 className="text-2xl font-bold">Gestión de Empleados</h2>
                <p className="text-sm text-gray-400">Administración del personal del condominio</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Horarios</span>
              </button>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Nómina</span>
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Importar</span>
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
              <button 
                onClick={() => handleOpenModal('create')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nuevo Empleado</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido de la página */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Estadísticas */}
          <EmpleadoStats
            totalEmpleados={totalEmpleados}
            empleadosActivos={empleadosActivos}
            empleadosInactivos={empleadosInactivos}
            totalDepartamentos={totalDepartamentos}
            conFotoRegistrada={conFotoRegistrada}
            sinFotoRegistrada={sinFotoRegistrada}
          />

          {/* Filtros y búsqueda */}
          <EmpleadoFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            departamentos={departamentos}
          />

          {/* Lista de empleados */}
          <EmpleadoTable
            filteredEmpleados={filteredEmpleados}
            handleOpenModal={handleOpenModal}
            onRefresh={handleRefresh}
          />

          {filteredEmpleados.length === 0 && (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No se encontraron empleados que coincidan con los criterios de búsqueda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <EmpleadoModal
        showModal={showModal}
        modalType={modalType}
        selectedEmpleado={selectedEmpleado}
        handleCloseModal={handleCloseModal}
        onRefresh={handleRefresh}
      />
    </div>
  );
}