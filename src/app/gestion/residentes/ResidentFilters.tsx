import React from 'react';
import { Search, Filter } from 'lucide-react';

interface ResidentFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  selectedFilter: string;
  setSelectedFilter: (value: string) => void;
}

const ResidentFilters: React.FC<ResidentFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  selectedFilter,
  setSelectedFilter
}) => (
  <div className="bg-gray-800 rounded-lg p-4 mb-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, CI, vivienda o zona..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filtros</span>
        </button>
      </div>
    </div>
    {showFilters && (
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFilter('todos')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedFilter === 'todos' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedFilter('con_foto')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedFilter === 'con_foto' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Con Foto
          </button>
          <button
            onClick={() => setSelectedFilter('sin_foto')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedFilter === 'sin_foto' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Sin Foto
          </button>
        </div>
      </div>
    )}
  </div>
);

export default ResidentFilters; 