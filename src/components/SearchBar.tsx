import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';

export type FilterStatus = 'ALL' | 'PENDING' | 'CLEARED';
export type SortOption = 'HIGHEST_DEBT' | 'RECENT' | 'NAME';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
  pendingCount: number;
  clearedCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  totalCount,
  pendingCount,
  clearedCount,
}) => {
  return (
    <div className="space-y-3">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-5 h-5 absolute left-3.5 text-gray-500 dark:text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar deudor por nombre (ej. Juanito)..."
          className="w-full pl-11 pr-10 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-2xl text-base font-semibold text-gray-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 p-1.5 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter and Sort Row */}
      <div className="space-y-2.5">
        {/* Row 1: Filter Chips - Big, High Contrast, Easy to Tap */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            onClick={() => onFilterChange('ALL')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-colors whitespace-nowrap flex items-center gap-1.5 border-2 ${
              activeFilter === 'ALL'
                ? 'bg-gray-950 text-white border-gray-950 dark:bg-white dark:text-gray-950 dark:border-white shadow-xs'
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>Todos</span>
            <span className="px-1.5 py-0.5 rounded-md bg-black/15 dark:bg-black/25 text-[10px]">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => onFilterChange('PENDING')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-colors whitespace-nowrap flex items-center gap-1.5 border-2 ${
              activeFilter === 'PENDING'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white dark:bg-gray-800 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
          >
            <span>Con Deuda</span>
            <span className="px-1.5 py-0.5 rounded-md bg-rose-700/20 dark:bg-rose-400/20 text-[10px]">
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => onFilterChange('CLEARED')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-colors whitespace-nowrap flex items-center gap-1.5 border-2 ${
              activeFilter === 'CLEARED'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            }`}
          >
            <span>Al Día</span>
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-700/20 dark:bg-emerald-400/20 text-[10px]">
              {clearedCount}
            </span>
          </button>
        </div>

        {/* Row 2: Sort Selector */}
        <div className="flex items-center justify-between gap-1.5 pt-0.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Ordenar por:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => onSortChange('HIGHEST_DEBT')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-colors whitespace-nowrap border-2 flex items-center gap-1 ${
                sortBy === 'HIGHEST_DEBT'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100'
              }`}
              title="Mostrar los que más deben primero"
            >
              <span>🔥 Mayor Deuda</span>
            </button>

            <button
              onClick={() => onSortChange('RECENT')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-colors whitespace-nowrap border-2 flex items-center gap-1 ${
                sortBy === 'RECENT'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100'
              }`}
              title="Mostrar los últimos movimientos primero"
            >
              <span>⏱️ Recientes</span>
            </button>

            <button
              onClick={() => onSortChange('NAME')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-colors whitespace-nowrap border-2 flex items-center gap-1 ${
                sortBy === 'NAME'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100'
              }`}
              title="Ordenar por nombre de la A a la Z"
            >
              <span>A-Z</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
