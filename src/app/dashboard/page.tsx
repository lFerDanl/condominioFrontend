'use client';

import React, { useState, useEffect } from 'react';
import { useCamaras } from '../../hooks/useCamaras';
import { Camara, CreateCamaraDto, UpdateCamaraDto, ModeloIA, CreateModeloIADto, UpdateModeloIADto } from '../../services/camaras';
import Header from '../../components/dashboard/Header';
import Sidebar from '../../components/dashboard/Sidebar';
import VideoFeed from '../../components/dashboard/VideoFeed';
import QuickActions from '../../components/dashboard/QuickActions';
import SystemStatus from '../../components/dashboard/SystemStatus';
import ActivityLog from '../../components/dashboard/ActivityLog';
import CamaraModal from '../../components/dashboard/CamaraModal';
import ModeloIAModal from '../../components/dashboard/ModeloIAModal';

import VideoStreem from '../../components/dashboard/VideoStreem';

export default function DashboardPage() {
  const {
    camaras,
    modelosIA,
    eventos,
    estadisticas,
    loading,
    error,
    fetchCamaras,
    createCamara,
    updateCamara,
    deleteCamara,
    fetchModelosIA,
    createModeloIA,
    updateModeloIA,
    deleteModeloIA,
    asignarModeloIA,
    desasignarModeloIA,
    clearError,
  } = useCamaras();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [camaraModalOpen, setCamaraModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camara | null>(null);
  const [modeloIAModalOpen, setModeloIAModalOpen] = useState(false);
  const [editingModeloIA, setEditingModeloIA] = useState<ModeloIA | null>(null);
  const [videoMode, setVideoMode] = useState<'feed' | 'stream'>('feed');

  useEffect(() => {
    fetchModelosIA();
  }, [fetchModelosIA]);

  const selectedCamera = camaras.find(cam => cam.id === selectedCameraId);

  const handleAddCamera = () => {
    setEditingCamera(null);
    setCamaraModalOpen(true);
  };

  const handleEditCamera = (camara: Camara) => {
    setEditingCamera(camara);
    setCamaraModalOpen(true);
  };

  const handleDeleteCamera = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta cámara?')) {
      try {
        await deleteCamara(id);
        if (selectedCameraId === id) {
          setSelectedCameraId(null);
        }
      } catch (error) {
        console.error('Error al eliminar cámara:', error);
      }
    }
  };

  const handleSaveCamera = async (camaraData: CreateCamaraDto | UpdateCamaraDto, selectedModelos?: number[]) => {
    try {
      if (editingCamera) {
        await updateCamara(editingCamera.id, camaraData as UpdateCamaraDto);
        if (selectedModelos) {
          const originalModelos = editingCamera.modelos_ia?.map(m => m.modeloIAId) || [];
          const toAssign = selectedModelos.filter(id => !originalModelos.includes(id));
          const toUnassign = originalModelos.filter(id => !selectedModelos.includes(id));

          for (const modeloId of toAssign) {
            await asignarModeloIA({ camaraId: editingCamera.id, modeloIAId: modeloId });
          }

          for (const modeloId of toUnassign) {
            await desasignarModeloIA(editingCamera.id, modeloId);
          }
        }
      } else {
        await createCamara(camaraData as CreateCamaraDto);
      }
      setCamaraModalOpen(false);
      fetchCamaras();
    } catch (error) {
      console.error('Error al guardar cámara:', error);
    }
  };

  const handleCloseCamaraModal = () => {
    setCamaraModalOpen(false);
    setEditingCamera(null);
  };

  const handleAddModeloIA = () => {
    setEditingModeloIA(null);
    setModeloIAModalOpen(true);
  };

  const handleEditModeloIA = (modelo: ModeloIA) => {
    setEditingModeloIA(modelo);
    setModeloIAModalOpen(true);
  };

  const handleDeleteModeloIA = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este modelo de IA?')) {
      try {
        await deleteModeloIA(id);
      } catch (error) {
        console.error('Error al eliminar modelo de IA:', error);
      }
    }
  };

  const handleSaveModeloIA = async (modeloData: CreateModeloIADto | UpdateModeloIADto) => {
    try {
      if (editingModeloIA) {
        await updateModeloIA(editingModeloIA.id, modeloData as UpdateModeloIADto);
      } else {
        await createModeloIA(modeloData as CreateModeloIADto);
      }
      setModeloIAModalOpen(false);
    } catch (error) {
      console.error('Error al guardar modelo de IA:', error);
    }
  };

  const handleCloseModeloIAModal = () => {
    setModeloIAModalOpen(false);
    setEditingModeloIA(null);
  };

  // Handlers para QuickActions
  const handleExportRecording = () => {
    alert('Función de exportación de grabación - En desarrollo');
  };

  const handleTakeSnapshot = () => {
    alert('Función de captura de pantalla - En desarrollo');
  };

  const handleCreateReport = () => {
    alert('Función de creación de reporte - En desarrollo');
  };

  const handleSystemSettings = () => {
    alert('Función de configuración del sistema - En desarrollo');
  };

  const handleViewAlerts = () => {
    alert('Función de visualización de alertas - En desarrollo');
  };

  const handleManageUsers = () => {
    alert('Función de gestión de usuarios - En desarrollo');
  };

  // Si no hay cámara seleccionada y hay cámaras disponibles, seleccionar la primera
  React.useEffect(() => {
    if (!selectedCameraId && camaras.length > 0) {
      setSelectedCameraId(camaras[0].id);
    }
  }, [camaras, selectedCameraId]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <Header 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          camaras={camaras}
          selectedCameraId={selectedCameraId}
          setSelectedCameraId={setSelectedCameraId}
          modelosIA={modelosIA}
          eventos={eventos}
          estadisticas={estadisticas}
          onAddCamera={handleAddCamera}
          onEditCamera={handleEditCamera}
          onDeleteCamera={handleDeleteCamera}
          onAddModeloIA={handleAddModeloIA}
          onEditModeloIA={handleEditModeloIA}
          onDeleteModeloIA={handleDeleteModeloIA}
          loading={loading}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Video Feed - Takes up 2/3 of the space on xl screens */}
            <div className="xl:col-span-2">
              {/* Selector de modo de video */}
              <div className="mb-4 flex space-x-2">
                <button
                  onClick={() => setVideoMode('feed')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    videoMode === 'feed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Video Feed
                </button>
                <button
                  onClick={() => setVideoMode('stream')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    videoMode === 'stream'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Video Stream
                </button>
              </div>

              {/* Renderizado condicional de componentes de video */}
              {videoMode === 'feed' ? (
                <VideoFeed
                  camara={selectedCamera || null}
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                  isMuted={isMuted}
                  setIsMuted={setIsMuted}
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                  onEditCamera={handleEditCamera}
                />
              ) : (
                <VideoStreem />
              )}
            </div>

            {/* Right Sidebar - Takes up 1/3 of the space on xl screens */}
            <div className="xl:col-span-1 space-y-6">
              {/* Quick Actions */}
              <QuickActions
                onExportRecording={handleExportRecording}
                onTakeSnapshot={handleTakeSnapshot}
                onCreateReport={handleCreateReport}
                onSystemSettings={handleSystemSettings}
                onViewAlerts={handleViewAlerts}
                onManageUsers={handleManageUsers}
              />

              {/* System Status */}
              <SystemStatus />

              {/* Activity Log */}
              <ActivityLog />
            </div>
          </div>
        </main>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      <CamaraModal
        isOpen={camaraModalOpen}
        onClose={handleCloseCamaraModal}
        onSave={handleSaveCamera}
        camara={editingCamera}
        modelosIA={modelosIA}
        loading={loading}
      />

      {/* ModeloIA Modal */}
      <ModeloIAModal
        isOpen={modeloIAModalOpen}
        onClose={handleCloseModeloIAModal}
        onSave={handleSaveModeloIA}
        modelo={editingModeloIA}
        loading={loading}
      />
    </div>
  );
}