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
  FileText,
} from 'lucide-react';
import type { PersonWithBalance, Transaction } from '../types';
import { getCollectionReminderMessage } from '../utils/reminderHelper';
import { getPaymentReceiptMessage } from '../utils/debtorAlerts';

interface PersonDetailModalProps {
  person: PersonWithBalance;
  transactions: Transaction[];
  currencySymbol: string;
  onClose: () => void;
  onAddDebt: () => void;
  onAddPayment: () => void;
  onQuickSettle: () => void;
  onOpenStatement: () => void;
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
  onOpenStatement,
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
    const reminderText = getCollectionReminderMessage(
      person.name,
      formattedAmount,
      currencySymbol
    );
    const message = encodeURIComponent(reminderText);
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

  const handleSendPaymentReceipt = (tx: Transaction) => {
    const phoneClean = (person.phone || '').replace(/[^0-9]/g, '');
    const amountPaidStr = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(tx.amount);

    const message = encodeURIComponent(
      getPaymentReceiptMessage(
        person.name,
        amountPaidStr,
        tx.concept,
        formattedAmount,
        currencySymbol
      )
    );
    const url = phoneClean
      ? `https://wa.me/${phoneClean}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-gray-300 dark:border-gray-700">
        
        {/* Header */}
        <div className="p-4.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
          <div className="flex-1 min-w-0 pr-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Ficha del Deudor
            </span>
            <h2 className="text-2xl font-black text-gray-950 dark:text-white truncate">
              {person.name}
            </h2>
            {person.notes && (
              <p className="text-xs text-gray-700 dark:text-gray-300 truncate font-semibold">
                {person.notes}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition shrink-0"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
          {/* Main Debt Display Box */}
          <div
            className={`rounded-3xl p-5 text-center border-2 ${
              isOwing
                ? 'bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800'
                : isCleared
                ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800'
                : 'bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800'
            }`}
          >
            <span
              className={`text-xs font-black uppercase tracking-wider ${
                isOwing
                  ? 'text-rose-800 dark:text-rose-200'
                  : isCleared
                  ? 'text-emerald-800 dark:text-emerald-200'
                  : 'text-blue-800 dark:text-blue-200'
              }`}
            >
              {isOwing ? 'Deuda Total Pendiente' : isCleared ? 'Cuenta Saldada (Al Día)' : 'Saldo a Favor'}
            </span>
            <div
              className={`text-4xl sm:text-5xl font-black tracking-tight my-1.5 ${
                isOwing
                  ? 'text-rose-700 dark:text-rose-300'
                  : isCleared
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-blue-700 dark:text-blue-300'
              }`}
            >
              {currencySymbol} {formattedAmount}
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-bold">
              {transactions.length}{' '}
              {transactions.length === 1 ? 'movimiento registrado' : 'movimientos registrados'}
            </p>

            {person.dormantAlert && (
              <div className="mt-2.5 flex justify-center">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border tracking-wide shadow-2xs ${
                    person.dormantAlert.level === 'danger'
                      ? 'bg-rose-100 text-rose-950 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800'
                      : 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800'
                  }`}
                >
                  <span>{person.dormantAlert.label}</span>
                </span>
              </div>
            )}
          </div>

          {/* Quick Contact Bar if Phone is present */}
          {person.phone && (
            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700/60 rounded-2xl border border-gray-300 dark:border-gray-600">
              <span className="text-xs text-gray-900 dark:text-white flex-1 truncate font-bold pl-1">
                📞 {person.phone}
              </span>
              <button
                onClick={handleCall}
                className="px-3.5 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-600 flex items-center gap-1.5 shadow-2xs hover:bg-gray-50"
              >
                <Phone className="w-3.5 h-3.5" /> Llamar
              </button>
              <button
                onClick={handleWhatsApp}
                className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-emerald-700"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </button>
            </div>
          )}

          {/* Action Buttons: Big & Unmistakable (Don't Make Me Think) */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onAddPayment}
              className="py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition active:scale-[0.98]"
            >
              <MinusCircle className="w-5 h-5 text-emerald-100" />
              <span>Registrar Abono (-)</span>
            </button>

            <button
              onClick={onAddDebt}
              className="py-4 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5 text-rose-100" />
              <span>Anotar Deuda (+)</span>
            </button>
          </div>

          {/* Extract History & Share on WhatsApp Button */}
          <button
            onClick={onOpenStatement}
            className="w-full py-3.5 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-950 dark:text-indigo-100 font-black text-xs flex items-center justify-center gap-2 transition border-2 border-indigo-300 dark:border-indigo-700 shadow-2xs"
          >
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Sacar Historial Completo (WhatsApp)</span>
          </button>

          {/* 1-Tap Quick Settle Button if they have debt */}
          {isOwing && (
            <button
              onClick={onQuickSettle}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-950 dark:text-emerald-100 font-black text-xs flex items-center justify-center gap-2 transition border-2 border-emerald-300 dark:border-emerald-700 shadow-2xs"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Saldar Deuda Completa ({currencySymbol}{formattedAmount})</span>
            </button>
          )}

          {/* Movement History / Timeline */}
          <div className="pt-2">
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              Historial de Movimientos
            </h3>

            {sortedTransactions.length === 0 ? (
              <div className="p-6 text-center text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
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
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isTxDebt
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {isTxDebt ? (
                            <PlusCircle className="w-5 h-5" />
                          ) : (
                            <MinusCircle className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-gray-950 dark:text-white truncate">
                            {tx.concept}
                          </p>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-bold">{dateStr}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-base font-black tracking-tight ${
                            isTxDebt
                              ? 'text-rose-700 dark:text-rose-300'
                              : 'text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {isTxDebt ? '+' : '-'} {currencySymbol}
                          {Number(tx.amount).toFixed(2)}
                        </span>

                        {/* Send Receipt button if it's an abono/payment */}
                        {!isTxDebt && (
                          <button
                            onClick={() => handleSendPaymentReceipt(tx)}
                            className="p-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition"
                            title="Enviar comprobante de este abono por WhatsApp"
                            aria-label="Enviar recibo por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}

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
                              className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 text-[10px] font-bold rounded-lg"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingTxId(tx.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-300 transition"
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
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-rose-900 dark:text-rose-100 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>¿Seguro que deseas eliminar a {person.name} del cuaderno?</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onDeletePerson}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
                  >
                    Sí, Eliminar Definitivamente
                  </button>
                  <button
                    onClick={() => setShowConfirmDeletePerson(false)}
                    className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmDeletePerson(true)}
                className="w-full py-2.5 text-xs font-bold text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 transition flex items-center justify-center gap-1"
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
