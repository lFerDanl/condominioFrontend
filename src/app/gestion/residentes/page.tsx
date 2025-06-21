'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Upload, Download } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import ResidentModal from './ResidentModal';
import ResidentTable from './ResidentTable';
import ResidentStats from './ResidentStats';
import ResidentFilters from './ResidentFilters';
import { getResidentes, Residente } from '../../../services/residentes';

export default function GestionResidentes() {
  const [allResidentes, setAllResidentes] = useState<Residente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [selectedResident, setSelectedResident] = useState<Residente | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create'>('view');
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchResidentes = async () => {
      const residentesData = await getResidentes();
      setAllResidentes(residentesData);
    };

    fetchResidentes();
  }, []);

  // Filtrar residentes
  const filteredResidents = allResidentes.filter(residente => {
    const matchesSearch = 
      residente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      residente.apellido_paterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      residente.apellido_materno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      residente.ci.includes(searchTerm) ||
      residente.vivienda.numero.includes(searchTerm) ||
      residente.vivienda.bloque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      residente.vivienda.zona.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      selectedFilter === 'todos' || 
      (selectedFilter === 'con_foto' && residente.foto_registrada) ||
      (selectedFilter === 'sin_foto' && !residente.foto_registrada);

    return matchesSearch && matchesFilter;
  });

  // Calcular estadísticas
  const totalResidentes = allResidentes.length;
  const uniqueViviendaIds = new Set(allResidentes.map(r => r.vivienda.id));
  const totalViviendas = uniqueViviendaIds.size;
  const conFotoRegistrada = allResidentes.filter((r: Residente) => r.foto_registrada).length;
  const sinFotoRegistrada = allResidentes.filter((r: Residente) => !r.foto_registrada).length;

  const handleOpenModal = (type: 'view' | 'edit' | 'create', resident?: Residente) => {
    setModalType(type);
    setSelectedResident(resident || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResident(null);
  };

  const refreshResidentes = async () => {
    const residentesData = await getResidentes();
    setAllResidentes(residentesData);
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
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold">Gestión de Residentes</h2>
                <p className="text-sm text-gray-400">Administración de residentes del condominio</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
                <span className="hidden sm:inline">Nuevo Residente</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido de la página */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Estadísticas */}
          <ResidentStats
            totalResidentes={totalResidentes}
            totalViviendas={totalViviendas}
            conFotoRegistrada={conFotoRegistrada}
            sinFotoRegistrada={sinFotoRegistrada}
          />

          {/* Filtros y búsqueda */}
          <ResidentFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />

          {/* Lista de residentes */}
          <ResidentTable
            filteredResidents={filteredResidents}
            handleOpenModal={handleOpenModal}
          />

          {filteredResidents.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No se encontraron residentes que coincidan con los criterios de búsqueda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ResidentModal
        showModal={showModal}
        modalType={modalType}
        selectedResident={selectedResident}
        handleCloseModal={handleCloseModal}
        onRefresh={refreshResidentes}
      />
    </div>
  );
}