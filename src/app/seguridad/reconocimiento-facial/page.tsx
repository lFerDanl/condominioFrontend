'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from './Sidebar';
import RecognitionVideoFeed from './VideoFeed';
import CamaraModal from '@/components/dashboard/CamaraModal';
import { useCamaras } from '@/hooks/useCamaras';
import { Camara, CreateCamaraDto, UpdateCamaraDto, ModeloIA } from '@/services/camaras';

export default function ReconocimientoFacialPage() {
  const {
    camaras,
    eventos,
    estadisticas,
    loading,
    createCamara,
    updateCamara,
    deleteCamara,
    updateModeloIA,
  } = useCamaras();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camara | null>(null);
  const [isRecognitionEnabled, setIsRecognitionEnabled] = useState(false);

  useEffect(() => {
    if (!selectedCameraId && camaras.length > 0) {
      setSelectedCameraId(camaras[0].id);
    }
     if (selectedCameraId && !camaras.some(c => c.id === selectedCameraId)) {
      setSelectedCameraId(camaras.length > 0 ? camaras[0].id : null);
    }
  }, [camaras, selectedCameraId]);

  const handleAddCamera = () => {
    setEditingCamera(null);
    setIsModalOpen(true);
  };

  const handleEditCamera = (camara: Camara) => {
    setEditingCamera(camara);
    setIsModalOpen(true);
  };

  const handleDeleteCamera = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cámara?')) {
      deleteCamara(id);
    }
  };

  const handleSaveCamera = async (data: CreateCamaraDto | UpdateCamaraDto) => {
    try {
      if (editingCamera) {
        await updateCamara(editingCamera.id, data as UpdateCamaraDto);
      } else {
        await createCamara(data as CreateCamaraDto);
      }
      setIsModalOpen(false);
      setEditingCamera(null);
    } catch (error) {
      console.error("Error al guardar la cámara:", error);
      // Aquí podrías mostrar una notificación de error al usuario
    }
  };

  const selectedCamera = camaras.find((c) => c.id === selectedCameraId) || null;

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }

    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col relative">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          camaras={camaras}
          selectedCameraId={selectedCameraId}
          setSelectedCameraId={setSelectedCameraId}
          eventos={eventos}
          estadisticas={estadisticas}
          onAddCamera={handleAddCamera}
          onEditCamera={handleEditCamera}
          onDeleteCamera={handleDeleteCamera}
          loading={loading}
        />
        <main className={`flex-1 p-4 sm:p-6 overflow-y-auto transition-all duration-300 main-content relative z-40 ${
          sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'
        }`}>
          <RecognitionVideoFeed
            camera={selectedCamera}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isRecognitionEnabled={isRecognitionEnabled}
            onToggleRecognition={() => setIsRecognitionEnabled(prev => !prev)}
          />
        </main>
      </div>
      
      {isModalOpen && (
        <CamaraModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCamera}
          camara={editingCamera}
          modelosIA={[]}
        />
      )}
    </div>
  );
}