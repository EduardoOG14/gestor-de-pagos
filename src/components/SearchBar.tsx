import React from 'react';
import { Search, X } from 'lucide-react';

export type FilterStatus = 'ALL' | 'PENDING' | 'CLEARED';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  totalCount: number;
  pendingCount: number;
  clearedCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  totalCount,
  pendingCount,
  clearedCount,
}) => {
  return (
    <div className="space-y-3">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-5 h-5 absolute left-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar deudor por nombre (ej. Carlos)..."
          className="w-full pl-11 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-xs transition"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Chips - Big and Easy to Tap */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => onFilterChange('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === 'ALL'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
          }`}
        >
          <span>Todos</span>
          <span className="px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-black/20 text-[10px]">
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => onFilterChange('PENDING')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === 'PENDING'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 border border-gray-200 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-rose-950/20'
          }`}
        >
          <span>Con Deuda</span>
          <span className="px-1.5 py-0.2 rounded-md bg-rose-700/20 text-[10px]">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => onFilterChange('CLEARED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === 'CLEARED'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
          }`}
        >
          <span>Al Día</span>
          <span className="px-1.5 py-0.2 rounded-md bg-emerald-700/20 text-[10px]">
            {clearedCount}
          </span>
        </button>
      </div>
    </div>
  );
};
