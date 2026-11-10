import React, { useState } from 'react';
import {
  X,
  Sun,
  Moon,
  Smartphone,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  FileDown,
  FileUp,
} from 'lucide-react';
import type { AppSettings, GitHubRelease } from '../types';
import { CURRENT_APP_VERSION, getCurrentAppVersion, fetchLatestRelease, isNewerVersion, downloadAndInstallApk } from '../services/updateService';
import { exportBackupData, importBackupData } from '../services/storageService';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
  onDataImported: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onDataImported,
}) => {
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(CURRENT_APP_VERSION);
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'up-to-date' | 'update-available' | 'error' | 'downloading'
  >('idle');
  const [latestRelease, setLatestRelease] = useState<GitHubRelease | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [backupMessage, setBackupMessage] = useState('');

  // Load actual installed app version on mount
  React.useEffect(() => {
    getCurrentAppVersion().then(setCurrentVersion);
  }, []);

  // Check updates now
  const handleCheckUpdates = async () => {
    try {
      setCheckingUpdate(true);
      setUpdateStatus('idle');
      setStatusMessage('');

      const [release, activeVer] = await Promise.all([
        fetchLatestRelease(settings.githubRepo),
        getCurrentAppVersion(),
      ]);

      setCurrentVersion(activeVer);

      if (!release) {
        setUpdateStatus('up-to-date');
        setStatusMessage('No hay versiones publicadas aún en el repositorio.');
        return;
      }

      setLatestRelease(release);

      if (isNewerVersion(release.tagName, activeVer)) {
        setUpdateStatus('update-available');
        setStatusMessage(`¡Nueva versión ${release.tagName} disponible!`);
      } else {
        setUpdateStatus('up-to-date');
        setStatusMessage(`¡Tienes la versión más reciente (v${activeVer})!`);
      }
    } catch (e: any) {
      setUpdateStatus('error');
      setStatusMessage('No se pudo verificar la actualización. Revisa tu conexión a internet.');
    } finally {
      setCheckingUpdate(false);
    }
  };

  // Download & install update
  const handleInstallUpdate = async () => {
    if (!latestRelease?.apkDownloadUrl) {
      if (latestRelease?.htmlUrl) {
        window.open(latestRelease.htmlUrl, '_blank');
      }
      return;
    }

    try {
      setUpdateStatus('downloading');
      setDownloadProgress(0);
      setStatusMessage('Descargando actualización directamente dentro de la app...');

      await downloadAndInstallApk(latestRelease.apkDownloadUrl, (progress) => {
        setDownloadProgress(progress);
      });

      setStatusMessage('Descarga lista. Abriendo instalador de Android...');
    } catch (e: any) {
      setUpdateStatus('error');
      setStatusMessage('Error al descargar: ' + (e.message || 'Intente nuevamente'));
    }
  };

  // Backup Export
  const handleExportBackup = () => {
    try {
      const dataStr = exportBackupData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `cuaderno_deudas_backup_${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupMessage('✅ Copia de seguridad guardada con éxito.');
      setTimeout(() => setBackupMessage(''), 4000);
    } catch (e) {
      setBackupMessage('❌ Error al exportar copia de seguridad');
    }
  };

  // Backup Import
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importBackupData(content)) {
        setBackupMessage('✅ Copia restaurada correctamente.');
        onDataImported();
        setTimeout(() => setBackupMessage(''), 4000);
      } else {
        setBackupMessage('❌ El archivo de respaldo no es válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full sm:max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-300 dark:border-gray-700 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
          <div>
            <h2 className="text-xl font-black text-gray-950 dark:text-white leading-tight">
              Ajustes de la Aplicación
            </h2>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Tema, actualizaciones y respaldos
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 transition"
            aria-label="Cerrar ajustes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-6 overflow-y-auto">
          
          {/* SECTION 1: THEME SELECTOR */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-2.5">
              Tema Visual (Modo Claro / Oscuro)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`py-3.5 px-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition ${
                  settings.theme === 'light'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500 font-black shadow-xs'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 hover:bg-gray-100'
                }`}
              >
                <Sun className="w-6 h-6 text-amber-500" />
                <span className="text-xs font-black">Claro</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`py-3.5 px-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition ${
                  settings.theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500 font-black shadow-xs'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 hover:bg-gray-100'
                }`}
              >
                <Moon className="w-6 h-6 text-indigo-500" />
                <span className="text-xs font-black">Oscuro</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'system' })}
                className={`py-3.5 px-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition ${
                  settings.theme === 'system'
                    ? 'border-gray-600 bg-gray-200 dark:bg-gray-700 text-gray-950 dark:text-white ring-2 ring-gray-400 font-black shadow-xs'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 hover:bg-gray-100'
                }`}
              >
                <Smartphone className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                <span className="text-xs font-black">Sistema</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: APP UPDATES (GitHub Releases) */}
          <div className="bg-gray-50 dark:bg-gray-750 rounded-3xl p-4.5 border-2 border-gray-300 dark:border-gray-700 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-wider">
                  Actualizaciones de la App
                </h3>
                <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
                  Versión actual: <strong className="text-gray-950 dark:text-white font-black">v{currentVersion}</strong>
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center border border-emerald-300 dark:border-emerald-800">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
            </div>

            {/* Toggle: Automatic check on startup */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 cursor-pointer shadow-2xs">
              <span className="text-xs font-black text-gray-900 dark:text-gray-100">
                Comprobar actualizaciones al abrir la app
              </span>
              <input
                type="checkbox"
                checked={settings.autoCheckUpdates}
                onChange={(e) => onUpdateSettings({ autoCheckUpdates: e.target.checked })}
                className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </label>

            {/* Check Updates Button */}
            <button
              onClick={handleCheckUpdates}
              disabled={checkingUpdate || updateStatus === 'downloading'}
              className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white font-black text-sm rounded-2xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${checkingUpdate ? 'animate-spin' : ''}`} />
              <span>{checkingUpdate ? 'Buscando en GitHub...' : 'Buscar Actualizaciones Ahora'}</span>
            </button>

            {/* Status and Results */}
            {statusMessage && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2 border-2 ${
                  updateStatus === 'update-available'
                    ? 'bg-amber-50 text-amber-950 border-amber-300 dark:bg-amber-950/60 dark:text-amber-100 dark:border-amber-800'
                    : updateStatus === 'up-to-date'
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-100 dark:border-emerald-800'
                    : updateStatus === 'error'
                    ? 'bg-rose-50 text-rose-950 border-rose-300 dark:bg-rose-950/60 dark:text-rose-100 dark:border-rose-800'
                    : 'bg-blue-50 text-blue-950 border-blue-300 dark:bg-blue-950/60 dark:text-blue-100'
                }`}
              >
                {updateStatus === 'update-available' ? (
                  <Download className="w-4 h-4 shrink-0 mt-0.5" />
                ) : updateStatus === 'up-to-date' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                )}
                <div className="flex-1 font-bold">
                  <p>{statusMessage}</p>
                </div>
              </div>
            )}

            {/* Download Progress Bar */}
            {updateStatus === 'downloading' && (
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white dark:bg-gray-800 border-2 border-emerald-300 dark:border-emerald-800">
                <div className="flex justify-between text-xs font-black text-emerald-700 dark:text-emerald-300">
                  <span>Descargando actualización...</span>
                  <span>{downloadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Direct Install Button if update is found */}
            {updateStatus === 'update-available' && (
              <div className="p-3.5 bg-white dark:bg-gray-800 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 space-y-2">
                <div className="text-xs text-gray-800 dark:text-gray-200">
                  <strong className="text-gray-950 dark:text-white font-black text-sm">
                    {latestRelease?.name || latestRelease?.tagName}
                  </strong>
                  {latestRelease?.body && (
                    <p className="mt-1 text-[11px] text-gray-700 dark:text-gray-300 line-clamp-3 font-medium">
                      {latestRelease.body}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleInstallUpdate}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar Actualización Directamente</span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION 3: BACKUP & DATA */}
          <div className="space-y-2.5">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
              Copias de Seguridad (Tus Datos Están Seguros)
            </label>

            {backupMessage && (
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-900 dark:text-gray-100">
                {backupMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportBackup}
                className="py-3.5 px-3 rounded-2xl bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-black text-xs flex items-center justify-center gap-1.5 transition border-2 border-gray-300 dark:border-gray-600 shadow-2xs"
              >
                <FileDown className="w-4 h-4 text-emerald-600" />
                <span>Exportar Copia</span>
              </button>

              <label className="py-3.5 px-3 rounded-2xl bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-black text-xs flex items-center justify-center gap-1.5 transition border-2 border-gray-300 dark:border-gray-600 shadow-2xs cursor-pointer">
                <FileUp className="w-4 h-4 text-indigo-600" />
                <span>Restaurar Copia</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* SECTION 4: GITHUB REPOSITORY */}
          <div className="text-xs text-gray-700 dark:text-gray-300 pt-2 border-t border-gray-300 dark:border-gray-700 flex items-center justify-between font-bold">
            <span>Repositorio de releases:</span>
            <span className="font-mono text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg border border-gray-300 dark:border-gray-600">
              {settings.githubRepo}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
