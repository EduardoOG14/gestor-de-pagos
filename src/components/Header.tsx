import React from 'react';
import { BookOpen, Settings, Sun, Moon, BarChart3 } from 'lucide-react';
import type { ThemeMode } from '../types';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenMonthlyReport: () => void;
  pendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenMonthlyReport,
  pendingCount,
}) => {
  const isDark = theme === 'dark' || (theme === 'system' && document.documentElement.classList.contains('dark'));

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 px-4 py-3 shadow-xs">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* App Title & Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-gray-950 dark:text-white leading-tight">
              Gestor de Pagos
            </h1>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Cuaderno de Deudas
            </p>
          </div>
        </div>

        {/* Action Buttons: Monthly Report, Theme Toggle & Settings */}
        <div className="flex items-center gap-2">
          {/* Monthly Report Button */}
          <button
            onClick={onOpenMonthlyReport}
            aria-label="Ver Cobros por Mes"
            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/70 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 transition-colors shadow-2xs"
            title="Ver cobros por mes"
          >
            <BarChart3 className="w-5 h-5" />
          </button>

          {/* Quick Theme Switcher */}
          <button
            onClick={onToggleTheme}
            aria-label="Cambiar modo de luz"
            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 transition-colors shadow-2xs"
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Abrir Ajustes"
            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 transition-colors shadow-2xs relative"
            title="Ajustes y Actualizaciones"
          >
            <Settings className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            {pendingCount > 0 && (
              <span className="sr-only">{pendingCount} deudas pendientes</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
