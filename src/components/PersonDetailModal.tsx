import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  MinusCircle,
  MessageCircle,
  Phone,
  Trash2,
  Calendar,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import type { PersonWithBalance, Transaction } from '../types';

interface PersonDetailModalProps {
  person: PersonWithBalance;
  transactions: Transaction[];
  currencySymbol: string;
  onClose: () => void;
  onAddDebt: () => void;
  onAddPayment: () => void;
  onQuickSettle: () => void;
  onDeleteTransaction: (txId: string) => void;
  onDeletePerson: () => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  person,
  transactions,
  currencySymbol,
  onClose,
  onAddDebt,
  onAddPayment,
  onQuickSettle,
  onDeleteTransaction,
  onDeletePerson,
}) => {
  const [showConfirmDeletePerson, setShowConfirmDeletePerson] = useState(false);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  const isOwing = person.totalDebt > 0;
  const isCleared = person.totalDebt === 0;

  const formattedAmount = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(person.totalDebt));

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleWhatsApp = () => {
    const phoneClean = (person.phone || '').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hola ${person.name} 👋 Te escribo para comentarte sobre el saldo pendiente de ${currencySymbol}${formattedAmount} en nuestro cuaderno de control. Por favor me avisas cuando puedas revisarlo. ¡Muchas gracias!`
    );
    const url = phoneClean
      ? `https://wa.me/${phoneClean}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  const handleCall = () => {
    if (person.phone) {
      window.open(`tel:${person.phone}`, '_self');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/80 dark:bg-gray-800/80">
          <div className="flex-1 min-w-0 pr-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Ficha del Deudor
            </span>
            <h2 className="text-xl font-black text-gray-900 dark:text-white truncate">
              {person.name}
            </h2>
            {person.notes && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {person.notes}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 transition shrink-0"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {/* Main Debt Display Box */}
          <div
            className={`rounded-3xl p-5 text-center border ${
              isOwing
                ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/60'
                : isCleared
                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/60'
                : 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/60'
            }`}
          >
            <span
              className={`text-xs font-black uppercase tracking-wider ${
                isOwing
                  ? 'text-rose-600 dark:text-rose-400'
                  : isCleared
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              {isOwing ? 'Deuda Total Pendiente' : isCleared ? 'Cuenta Saldada (Al Día)' : 'Saldo a Favor'}
            </span>
            <div
              className={`text-4xl sm:text-5xl font-black tracking-tight my-1.5 ${
                isOwing
                  ? 'text-rose-600 dark:text-rose-400'
                  : isCleared
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              {currencySymbol} {formattedAmount}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {transactions.length}{' '}
              {transactions.length === 1 ? 'movimiento registrado' : 'movimientos registrados'}
            </p>
          </div>

          {/* Quick Contact Bar if Phone is present */}
          {person.phone && (
            <div className="flex items-center gap-2 p-2.5 bg-gray-100 dark:bg-gray-700/50 rounded-2xl">
              <span className="text-xs text-gray-600 dark:text-gray-300 flex-1 truncate font-medium pl-1">
                📞 {person.phone}
              </span>
              <button
                onClick={handleCall}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-600 flex items-center gap-1 shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" /> Llamar
              </button>
              <button
                onClick={handleWhatsApp}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs hover:bg-emerald-700"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </button>
            </div>
          )}

          {/* Action Buttons: Big & Unmistakable (Don't Make Me Think) */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onAddPayment}
              className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition active:scale-[0.98]"
            >
              <MinusCircle className="w-5 h-5 text-emerald-200" />
              <span>Registrar Abono (-)</span>
            </button>

            <button
              onClick={onAddDebt}
              className="py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5 text-rose-200" />
              <span>Anotar Deuda (+)</span>
            </button>
          </div>

          {/* 1-Tap Quick Settle Button if they have debt */}
          {isOwing && (
            <button
              onClick={onQuickSettle}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-extrabold text-xs flex items-center justify-center gap-2 transition border border-emerald-300 dark:border-emerald-800"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Saldar Deuda Completa ({currencySymbol}{formattedAmount})</span>
            </button>
          )}

          {/* Movement History / Timeline */}
          <div className="pt-2">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-500" />
              Historial de Movimientos
            </h3>

            {sortedTransactions.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                Aún no hay movimientos registrados.
              </div>
            ) : (
              <div className="space-y-2">
                {sortedTransactions.map((tx) => {
                  const isTxDebt = tx.type === 'DEBT';
                  const dateStr = new Date(tx.date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isTxDebt
                              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                          }`}
                        >
                          {isTxDebt ? (
                            <PlusCircle className="w-5 h-5" />
                          ) : (
                            <MinusCircle className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {tx.concept}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{dateStr}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-base font-black tracking-tight ${
                            isTxDebt
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isTxDebt ? '+' : '-'} {currencySymbol}
                          {Number(tx.amount).toFixed(2)}
                        </span>

                        {/* Delete single transaction */}
                        {deletingTxId === tx.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                onDeleteTransaction(tx.id);
                                setDeletingTxId(null);
                              }}
                              className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg"
                            >
                              Borrar
                            </button>
                            <button
                              onClick={() => setDeletingTxId(null)}
                              className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-[10px] font-bold rounded-lg"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingTxId(tx.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                            title="Eliminar este movimiento"
                            aria-label="Eliminar movimiento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delete Person Area */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            {showConfirmDeletePerson ? (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>¿Seguro que deseas eliminar a {person.name} del cuaderno?</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onDeletePerson}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
                  >
                    Sí, Eliminar Definitivamente
                  </button>
                  <button
                    onClick={() => setShowConfirmDeletePerson(false)}
                    className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmDeletePerson(true)}
                className="w-full py-2.5 text-xs font-bold text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 transition flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar a este deudor del cuaderno</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
