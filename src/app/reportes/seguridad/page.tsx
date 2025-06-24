'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, FileText, Download, Filter, Calendar, Camera, Activity, Clock, AlertCircle } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import { camarasService, EventoDeteccion } from '@/services/camaras';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportesSeguridad() {
  const [allEventos, setAllEventos] = useState<EventoDeteccion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [tipoEventoFilter, setTipoEventoFilter] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventosData = await camarasService.getEventosDeteccion();
        setAllEventos(eventosData);
      } catch (error) {
        console.error('Error al cargar eventos:', error);
        setError('Error al cargar los eventos de detección. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  const filteredEventos = useMemo(() => {
    return allEventos.filter(evento => {
      const matchesSearch = 
        evento.tipo_evento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evento.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evento.camaraModeloIA?.camara?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evento.camaraModeloIA?.camara?.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatusFilter = 
        selectedFilter === 'todos' || 
        (selectedFilter === 'procesados' && evento.procesado) ||
        (selectedFilter === 'no_procesados' && !evento.procesado);

      const matchesEstadoFilter = 
        estadoFilter === 'todos' || 
        evento.estado.toLowerCase() === estadoFilter.toLowerCase();

      const matchesTipoEventoFilter = 
        tipoEventoFilter === 'todos' || 
        evento.tipo_evento.toLowerCase() === tipoEventoFilter.toLowerCase();

      return matchesSearch && matchesStatusFilter && matchesEstadoFilter && matchesTipoEventoFilter;
    });
  }, [allEventos, searchTerm, selectedFilter, estadoFilter, tipoEventoFilter]);

  const estadisticas = useMemo(() => {
    const totalEventos = allEventos.length;
    const eventosProcesados = allEventos.filter(e => e.procesado).length;
    const eventosNoProcesados = allEventos.filter(e => !e.procesado).length;
    
    const camarasUnicas = [...new Set(allEventos.map(e => e.camaraModeloIA?.camara?.nombre).filter(Boolean))];
    const totalCamaras = camarasUnicas.length;

    const hoy = new Date();
    const eventosHoy = allEventos.filter(e => {
      const fechaEvento = new Date(e.fecha_deteccion);
      return fechaEvento.toDateString() === hoy.toDateString();
    }).length;

    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    const eventosSemana = allEventos.filter(e => {
      const fechaEvento = new Date(e.fecha_deteccion);
      return fechaEvento >= inicioSemana;
    }).length;

    return {
      totalEventos,
      eventosProcesados,
      eventosNoProcesados,
      totalCamaras,
      eventosHoy,
      eventosSemana
    };
  }, [allEventos]);

  const { 
    totalEventos, 
    eventosProcesados, 
    eventosNoProcesados, 
    totalCamaras, 
    eventosHoy, 
    eventosSemana 
  } = estadisticas;

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventosData = await camarasService.getEventosDeteccion();
      setAllEventos(eventosData);
    } catch (error) {
      console.error('Error al actualizar eventos:', error);
      setError('Error al actualizar los eventos. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    try {
      if (filteredEventos.length === 0) {
        setError('No hay eventos para generar el reporte.');
        return;
      }

      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text('Reporte de Eventos de Seguridad', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 35);
      doc.text(`Total de eventos: ${filteredEventos.length}`, 20, 45);
      
      doc.setFontSize(14);
      doc.text('Estadísticas Generales:', 20, 60);
      doc.setFontSize(10);
      doc.text(`• Total de eventos: ${totalEventos}`, 25, 70);
      doc.text(`• Eventos procesados: ${eventosProcesados}`, 25, 80);
      doc.text(`• Eventos no procesados: ${eventosNoProcesados}`, 25, 90);
      doc.text(`• Cámaras involucradas: ${totalCamaras}`, 25, 100);
      doc.text(`• Eventos hoy: ${eventosHoy}`, 25, 110);
      doc.text(`• Eventos esta semana: ${eventosSemana}`, 25, 120);

      const tableData = filteredEventos.map(evento => [
        evento.tipo_evento,
        evento.camaraModeloIA?.camara?.nombre || 'N/A',
        evento.camaraModeloIA?.camara?.ubicacion || 'N/A',
        `${Math.round(evento.confianza * 100)}%`,
        evento.estado,
        evento.procesado ? 'Sí' : 'No',
        new Date(evento.fecha_deteccion).toLocaleDateString('es-ES')
      ]);

      autoTable(doc, {
        head: [['Tipo Evento', 'Cámara', 'Ubicación', 'Confianza', 'Estado', 'Procesado', 'Fecha']],
        body: tableData,
        startY: 140,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      doc.save(`reporte-eventos-seguridad-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setError('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  const generateDetailedPDF = () => {
    try {
      if (filteredEventos.length === 0) {
        setError('No hay eventos para generar el reporte detallado.');
        return;
      }

      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text('Reporte Detallado de Eventos de Seguridad', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 35);
      doc.text(`Total de eventos: ${filteredEventos.length}`, 20, 45);
      
      let currentY = 60;
      
      const eventosPorTipo = filteredEventos.reduce((acc, evento) => {
        const tipo = evento.tipo_evento;
        if (!acc[tipo]) acc[tipo] = [];
        acc[tipo].push(evento);
        return acc;
      }, {} as Record<string, EventoDeteccion[]>);

      Object.entries(eventosPorTipo).forEach(([tipo, eventos]) => {
        doc.setFontSize(14);
        doc.text(`Tipo: ${tipo}`, 20, currentY);
        currentY += 10;
        
        const tableData = eventos.map(evento => [
          evento.camaraModeloIA?.camara?.nombre || 'N/A',
          evento.camaraModeloIA?.camara?.ubicacion || 'N/A',
          `${Math.round(evento.confianza * 100)}%`,
          evento.estado,
          evento.procesado ? 'Sí' : 'No',
          evento.descripcion || 'N/A',
          new Date(evento.fecha_deteccion).toLocaleDateString('es-ES')
        ]);

        autoTable(doc, {
          head: [['Cámara', 'Ubicación', 'Confianza', 'Estado', 'Procesado', 'Descripción', 'Fecha']],
          body: tableData,
          startY: currentY,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          didDrawPage: function(data) {
            currentY = (data.cursor?.y || currentY) + 10;
          }
        });
        
        currentY += 15;
      });

      doc.save(`reporte-detallado-eventos-seguridad-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF detallado:', error);
      setError('Error al generar el PDF detallado. Por favor, inténtalo de nuevo.');
    }
  };

  const tiposEventos = useMemo(() => {
    return [...new Set(allEventos.map(e => e.tipo_evento))];
  }, [allEventos]);

  const estados = useMemo(() => {
    return [...new Set(allEventos.map(e => e.estado))];
  }, [allEventos]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <div>
                <h2 className="text-2xl font-bold">Reportes de Seguridad</h2>
                <p className="text-sm text-gray-400">Generación y descarga de reportes de eventos detectados</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={generatePDF}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Reporte Básico</span>
              </button>
              <button 
                onClick={generateDetailedPDF}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Reporte Detallado</span>
              </button>
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6">
          {error && (
            <div className="mb-6 bg-red-900 border border-red-700 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-red-200 font-medium">Error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Total Eventos</p>
                  <p className="text-2xl font-bold">{totalEventos}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center">
                <Camera className="h-8 w-8 text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Cámaras Involucradas</p>
                  <p className="text-2xl font-bold">{totalCamaras}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Eventos Hoy</p>
                  <p className="text-2xl font-bold">{eventosHoy}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Esta Semana</p>
                  <p className="text-2xl font-bold">{eventosSemana}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filtros de Búsqueda</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>{showFilters ? 'Ocultar' : 'Mostrar'} Filtros</span>
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Búsqueda
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por tipo, cámara, ubicación..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado de Procesamiento
                  </label>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos</option>
                    <option value="procesados">Procesados</option>
                    <option value="no_procesados">No Procesados</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado del Evento
                  </label>
                  <select
                    value={estadoFilter}
                    onChange={(e) => setEstadoFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos los estados</option>
                    {estados.map((estado) => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Evento
                  </label>
                  <select
                    value={tipoEventoFilter}
                    onChange={(e) => setTipoEventoFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos los tipos</option>
                    {tiposEventos.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold">
                Eventos de Detección ({filteredEventos.length})
              </h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="mt-2 text-gray-400">Cargando eventos...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Evento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Cámara
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Ubicación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Confianza
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Procesado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredEventos.map((evento) => (
                      <tr key={evento.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {evento.tipo_evento}
                            </div>
                            {evento.descripcion && (
                              <div className="text-sm text-gray-400">
                                {evento.descripcion}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {evento.camaraModeloIA?.camara?.nombre || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {evento.camaraModeloIA?.camara?.ubicacion || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            evento.confianza >= 0.8 
                              ? 'bg-green-100 text-green-800' 
                              : evento.confianza >= 0.6
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {Math.round(evento.confianza * 100)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            evento.estado === 'NUEVO' 
                              ? 'bg-red-100 text-red-800' 
                              : evento.estado === 'PROCESANDO'
                              ? 'bg-yellow-100 text-yellow-800'
                              : evento.estado === 'PROCESADO'
                              ? 'bg-green-100 text-green-800'
                              : evento.estado === 'FALSO_POSITIVO'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {evento.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            evento.procesado 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {evento.procesado ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(evento.fecha_deteccion).toLocaleDateString('es-ES')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!loading && filteredEventos.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No se encontraron eventos que coincidan con los criterios de búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
