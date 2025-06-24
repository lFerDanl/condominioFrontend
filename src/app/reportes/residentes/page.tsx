'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Users, FileText, Download, Filter, Calendar, Home, Phone, Mail, AlertCircle } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import { getResidentes, Residente } from '@/services/residentes';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportesResidentes() {
  const [allResidentes, setAllResidentes] = useState<Residente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [zonaFilter, setZonaFilter] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResidentes = async () => {
      try {
        setLoading(true);
        setError(null);
        const residentesData = await getResidentes();
        setAllResidentes(residentesData);
      } catch (error) {
        console.error('Error al cargar residentes:', error);
        setError('Error al cargar los residentes. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchResidentes();
  }, []);

  // Filtrar residentes con useMemo para optimización
  const filteredResidentes = useMemo(() => {
    return allResidentes.filter(residente => {
      const matchesSearch = 
        residente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        residente.apellido_paterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        residente.apellido_materno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        residente.ci.includes(searchTerm) ||
        residente.vivienda.numero.includes(searchTerm) ||
        residente.vivienda.bloque.toLowerCase().includes(searchTerm.toLowerCase()) ||
        residente.vivienda.zona.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatusFilter = 
        selectedFilter === 'todos' || 
        (selectedFilter === 'con_foto' && residente.foto_registrada) ||
        (selectedFilter === 'sin_foto' && !residente.foto_registrada);

      const matchesZonaFilter = 
        zonaFilter === 'todos' || 
        residente.vivienda.zona.toLowerCase() === zonaFilter.toLowerCase();

      return matchesSearch && matchesStatusFilter && matchesZonaFilter;
    });
  }, [allResidentes, searchTerm, selectedFilter, zonaFilter]);

  // Calcular estadísticas con useMemo
  const estadisticas = useMemo(() => {
    const totalResidentes = allResidentes.length;
    const conFotoRegistrada = allResidentes.filter(r => r.foto_registrada).length;
    const sinFotoRegistrada = allResidentes.filter(r => !r.foto_registrada).length;
    
    // Zonas únicas
    const zonas = [...new Set(allResidentes.map(r => r.vivienda.zona))];
    const totalZonas = zonas.length;

    // Bloques únicos
    const bloques = [...new Set(allResidentes.map(r => r.vivienda.bloque))];
    const totalBloques = bloques.length;

    return {
      totalResidentes,
      conFotoRegistrada,
      sinFotoRegistrada,
      zonas,
      totalZonas,
      bloques,
      totalBloques
    };
  }, [allResidentes]);

  const { totalResidentes, conFotoRegistrada, sinFotoRegistrada, zonas, totalZonas, totalBloques } = estadisticas;

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const residentesData = await getResidentes();
      setAllResidentes(residentesData);
    } catch (error) {
      console.error('Error al actualizar residentes:', error);
      setError('Error al actualizar los residentes. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    try {
      if (filteredResidentes.length === 0) {
        setError('No hay residentes para generar el reporte.');
        return;
      }

      const doc = new jsPDF();
      
      // Título del reporte
      doc.setFontSize(20);
      doc.text('Reporte de Residentes', 105, 20, { align: 'center' });
      
      // Información del reporte
      doc.setFontSize(12);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 35);
      doc.text(`Total de residentes: ${filteredResidentes.length}`, 20, 45);
      
      // Estadísticas
      doc.setFontSize(14);
      doc.text('Estadísticas Generales:', 20, 60);
      doc.setFontSize(10);
      doc.text(`• Total de residentes: ${totalResidentes}`, 25, 70);
      doc.text(`• Con foto registrada: ${conFotoRegistrada}`, 25, 80);
      doc.text(`• Sin foto registrada: ${sinFotoRegistrada}`, 25, 90);
      doc.text(`• Total de zonas: ${totalZonas}`, 25, 100);
      doc.text(`• Total de bloques: ${totalBloques}`, 25, 110);

      // Tabla de residentes
      const tableData = filteredResidentes.map(residente => [
        `${residente.nombre} ${residente.apellido_paterno} ${residente.apellido_materno}`,
        residente.ci,
        `${residente.vivienda.bloque} - ${residente.vivienda.numero}`,
        residente.vivienda.zona,
        residente.telefono || 'N/A',
        residente.email || 'N/A',
        residente.foto_registrada ? 'Sí' : 'No'
      ]);

      autoTable(doc, {
        head: [['Nombre Completo', 'CI', 'Vivienda', 'Zona', 'Teléfono', 'Email', 'Foto']],
        body: tableData,
        startY: 130,
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

      // Descargar el PDF
      doc.save(`reporte-residentes-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setError('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  const generateDetailedPDF = () => {
    try {
      if (filteredResidentes.length === 0) {
        setError('No hay residentes para generar el reporte detallado.');
        return;
      }

      const doc = new jsPDF();
      
      // Título del reporte detallado
      doc.setFontSize(20);
      doc.text('Reporte Detallado de Residentes', 105, 20, { align: 'center' });
      
      // Información del reporte
      doc.setFontSize(12);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 35);
      doc.text(`Total de residentes: ${filteredResidentes.length}`, 20, 45);
      
      let currentY = 60;
      
      // Agrupar por zona
      const residentesPorZona = filteredResidentes.reduce((acc, residente) => {
        const zona = residente.vivienda.zona;
        if (!acc[zona]) acc[zona] = [];
        acc[zona].push(residente);
        return acc;
      }, {} as Record<string, Residente[]>);

      Object.entries(residentesPorZona).forEach(([zona, residentes]) => {
        // Título de zona
        doc.setFontSize(14);
        doc.text(`Zona: ${zona}`, 20, currentY);
        currentY += 10;
        
        // Tabla de residentes de esta zona
        const tableData = residentes.map(residente => [
          `${residente.nombre} ${residente.apellido_paterno} ${residente.apellido_materno}`,
          residente.ci,
          `${residente.vivienda.bloque} - ${residente.vivienda.numero}`,
          residente.telefono || 'N/A',
          residente.email || 'N/A',
          residente.fecha_nacimiento ? new Date(residente.fecha_nacimiento).toLocaleDateString('es-ES') : 'N/A',
          residente.foto_registrada ? 'Sí' : 'No'
        ]);

        autoTable(doc, {
          head: [['Nombre Completo', 'CI', 'Vivienda', 'Teléfono', 'Email', 'Fecha Nac.', 'Foto']],
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

      // Descargar el PDF
      doc.save(`reporte-detallado-residentes-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF detallado:', error);
      setError('Error al generar el PDF detallado. Por favor, inténtalo de nuevo.');
    }
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
              <FileText className="h-8 w-8 text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold">Reportes de Residentes</h2>
                <p className="text-sm text-gray-400">Generación y descarga de reportes en PDF</p>
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

        {/* Contenido de la página */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Mostrar error si existe */}
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

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Total Residentes</p>
                  <p className="text-2xl font-bold">{totalResidentes}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center">
                <Home className="h-8 w-8 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Zonas</p>
                  <p className="text-2xl font-bold">{totalZonas}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center">
                <Home className="h-8 w-8 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Bloques</p>
                  <p className="text-2xl font-bold">{totalBloques}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Con Foto</p>
                  <p className="text-2xl font-bold">{conFotoRegistrada}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Búsqueda
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, CI, vivienda..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado de Foto
                  </label>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos</option>
                    <option value="con_foto">Con Foto</option>
                    <option value="sin_foto">Sin Foto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Zona
                  </label>
                  <select
                    value={zonaFilter}
                    onChange={(e) => setZonaFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todas las zonas</option>
                    {zonas.map((zona) => (
                      <option key={zona} value={zona}>{zona}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Lista de residentes */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold">
                Residentes ({filteredResidentes.length})
              </h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="mt-2 text-gray-400">Cargando residentes...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Residente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        CI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Vivienda
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Zona
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Foto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredResidentes.map((residente) => (
                      <tr key={residente.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {residente.nombre} {residente.apellido_paterno} {residente.apellido_materno}
                            </div>
                            {residente.fecha_nacimiento && (
                              <div className="text-sm text-gray-400">
                                {new Date(residente.fecha_nacimiento).toLocaleDateString('es-ES')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {residente.ci}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {residente.vivienda.bloque} - {residente.vivienda.numero}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {residente.vivienda.zona}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {residente.telefono && (
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {residente.telefono}
                              </div>
                            )}
                            {residente.email && (
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {residente.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            residente.foto_registrada 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {residente.foto_registrada ? 'Sí' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!loading && filteredResidentes.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No se encontraron residentes que coincidan con los criterios de búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
