import React, { useState } from 'react';
import { Sparkles, Download } from 'lucide-react';
import type { GitHubRelease } from '../types';
import { CURRENT_APP_VERSION, downloadAndInstallApk } from '../services/updateService';

interface UpdateDialogProps {
  release: GitHubRelease;
  onDismiss: () => void;
}

export const UpdateDialog: React.FC<UpdateDialogProps> = ({ release, onDismiss }) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    if (!release.apkDownloadUrl) {
      if (release.htmlUrl) {
        window.open(release.htmlUrl, '_blank');
      }
      return;
    }

    try {
      setDownloading(true);
      setError('');
      setProgress(0);

      await downloadAndInstallApk(release.apkDownloadUrl, (p) => {
        setProgress(p);
      });
    } catch (e: any) {
      setError(e.message || 'Error al descargar la actualización');
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-emerald-200 dark:border-emerald-800 p-6 text-center space-y-4">
        
        {/* Animated Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Actualización de la App
          </span>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
            ¡Nueva versión {release.tagName}!
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Tienes la versión v{CURRENT_APP_VERSION}. Actualiza para tener las últimas mejoras y correcciones.
          </p>
        </div>

        {/* Release notes summary */}
        {release.body && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-2xl text-left max-h-24 overflow-y-auto text-xs text-gray-600 dark:text-gray-300">
            <p className="font-bold text-gray-800 dark:text-gray-200 mb-1">Novedades:</p>
            <p className="whitespace-pre-line text-[11px]">{release.body}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Progress Bar */}
        {downloading && (
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between text-xs font-black text-emerald-600">
              <span>Descargando...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 text-center pt-1">
              La actualización se instalará automáticamente al terminar.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {!downloading && (
          <div className="space-y-2 pt-1">
            <button
              onClick={handleUpdate}
              className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Download className="w-5 h-5" />
              <span>Actualizar Ahora</span>
            </button>

            <button
              onClick={onDismiss}
              className="w-full py-3 px-4 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
            >
              Recordar más tarde
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
