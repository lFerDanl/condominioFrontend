'use client';

import React, { useState } from 'react';
import { Camera, Monitor, Shield, AlertTriangle, Settings, Users, Calendar, Activity, Play, Pause, Square, RotateCcw, ZoomIn, ZoomOut, Volume2, VolumeX, Menu, X } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import VideoFeed from '@/components/dashboard/VideoFeed';
import QuickActions from '@/components/dashboard/QuickActions';
import ActivityLog from '@/components/dashboard/ActivityLog';
import SystemStatus from '@/components/dashboard/SystemStatus';

export default function CameraMonitoringDashboard() {
  const [selectedCamera, setSelectedCamera] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const cameras = [
    { id: 1, name: 'Entrada Principal', location: 'Lobby', status: 'online', lastSeen: '2 min ago' },
    { id: 2, name: 'Estacionamiento A', location: 'Exterior', status: 'online', lastSeen: '1 min ago' },
    { id: 3, name: 'Pasillo Piso 2', location: 'Interior', status: 'offline', lastSeen: '15 min ago' },
    { id: 4, name: 'Área de Juegos', location: 'Exterior', status: 'online', lastSeen: '30 sec ago' },
    { id: 5, name: 'Salida Emergencia', location: 'Interior', status: 'online', lastSeen: '1 min ago' },
    { id: 6, name: 'Azotea', location: 'Exterior', status: 'maintenance', lastSeen: '2 hours ago' },
  ];

  const alerts = [
    { id: 1, type: 'motion', camera: 'Entrada Principal', time: '14:32', severity: 'medium' },
    { id: 2, type: 'offline', camera: 'Pasillo Piso 2', time: '14:15', severity: 'high' },
    { id: 3, type: 'motion', camera: 'Estacionamiento A', time: '14:10', severity: 'low' },
  ];

  const getStatusColor = (status: String) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: String) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
    </div>
  );
}