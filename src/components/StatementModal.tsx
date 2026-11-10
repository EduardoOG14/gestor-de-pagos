import React, { useState, useMemo } from 'react';
import { X, MessageCircle, Copy, Check, FileText, Calendar } from 'lucide-react';
import type { PersonWithBalance, Transaction } from '../types';
import { generateStatementReport } from '../utils/statementHelper';

interface StatementModalProps {
  person: PersonWithBalance;
  transactions: Transaction[];
  currencySymbol: string;
  onClose: () => void;
}

export const StatementModal: React.FC<StatementModalProps> = ({
  person,
  transactions,
  currencySymbol,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const report = useMemo(() => {
    return generateStatementReport(person, transactions, currencySymbol);
  }, [person, transactions, currencySymbol]);

  const handleShareWhatsApp = () => {
    const phoneClean = (person.phone || '').replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(report.whatsappMessage);
    const url = phoneClean
      ? `https://wa.me/${phoneClean}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(report.whatsappMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = report.whatsappMessage;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isOwing = person.totalDebt > 0;
  const isCleared = person.totalDebt === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="w-full sm:max-w-lg max-h-[92vh] sm:max-h-[85vh] bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-300 dark:border-gray-700 flex flex-col">
        
        {/* Header */}
        <div className="p-4.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Historial de Cuenta
              </span>
              <h2 className="text-xl font-black text-gray-950 dark:text-white leading-tight">
                {person.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Summary Balance Banner */}
          <div
            className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
              isOwing
                ? 'bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800'
                : isCleared
                ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800'
                : 'bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800'
            }`}
          >
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Saldo Actual
              </span>
              <div
                className={`text-2xl font-black ${
                  isOwing
                    ? 'text-rose-700 dark:text-rose-300'
                    : isCleared
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-blue-700 dark:text-blue-300'
                }`}
              >
                {currencySymbol} {Math.abs(person.totalDebt).toFixed(2)}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-black ${
                isOwing
                  ? 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100'
                  : isCleared
                  ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100'
                  : 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
              }`}
            >
              {isOwing ? 'Debe' : isCleared ? 'Al Día' : 'A Favor'}
            </span>
          </div>

          {/* Chronological Movements Timeline */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              Línea de Movimientos ({report.items.length})
            </h3>

            {report.items.length === 0 ? (
              <div className="p-5 text-center text-xs font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                No hay movimientos registrados para este deudor.
              </div>
            ) : (
              <div className="space-y-2">
                {report.items.map((item, idx) => {
                  const isDebt = item.type === 'DEBT';
                  return (
                    <div
                      key={item.id || idx}
                      className="p-3 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                          {item.dateStr}
                        </span>
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                            isDebt
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                          }`}
                        >
                          {isDebt ? '🔴 Deuda por' : '🟢 Abono de'} {item.amount}
                          {currencySymbol}
                        </span>
                      </div>

                      <div className="text-sm font-black text-gray-950 dark:text-white truncate">
                        {item.concept}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold">
                        <span>Saldo acumulado:</span>
                        <span className="font-black text-gray-900 dark:text-white">
                          Deuda total = {item.runningDebt}
                          {currencySymbol}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Formatted Text Preview for WhatsApp */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                Texto para Enviar por WhatsApp
              </span>
              <span className="text-[10px] text-gray-500 font-semibold">
                (Formato listo para enviar)
              </span>
            </div>

            <div className="p-3.5 bg-gray-50 dark:bg-gray-700/60 rounded-2xl border-2 border-gray-200 dark:border-gray-600 text-xs font-mono text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto select-all">
              {report.whatsappMessage}
            </div>
          </div>

          {/* Big Action Buttons */}
          <div className="space-y-2 pt-2">
            {/* WhatsApp Share Button */}
            <button
              onClick={handleShareWhatsApp}
              className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Compartir Historial por WhatsApp</span>
            </button>

            {/* Copy Text Button */}
            <button
              onClick={handleCopyText}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border-2 transition ${
                copied
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>¡Copiado al Portapapeles!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  <span>Copiar Texto Completo</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
