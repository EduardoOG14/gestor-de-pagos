import React from 'react';
import { BookOpen, Settings, Sun, Moon } from 'lucide-react';
import type { ThemeMode } from '../types';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  pendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenSettings,
  pendingCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-xs">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* App Title & Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white leading-tight">
              Gestor de Pagos
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Cuaderno de Deudas
            </p>
          </div>
        </div>

        {/* Action Buttons: Theme Toggle & Settings */}
        <div className="flex items-center gap-2">
          {/* Quick Theme Switcher */}
          <button
            onClick={onToggleTheme}
            aria-label="Cambiar modo de luz"
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Abrir Ajustes"
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors relative"
            title="Ajustes y Actualizaciones"
          >
            <Settings className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            {pendingCount > 0 && (
              <span className="sr-only">{pendingCount} deudas pendientes</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
