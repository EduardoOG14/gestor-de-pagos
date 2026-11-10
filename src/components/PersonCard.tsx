import React from 'react';
import { ChevronRight, PlusCircle, MinusCircle, MessageCircle, Clock } from 'lucide-react';
import type { PersonWithBalance } from '../types';

interface PersonCardProps {
  person: PersonWithBalance;
  currencySymbol: string;
  onClick: () => void;
  onAddDebt: () => void;
  onAddPayment: () => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  currencySymbol,
  onClick,
  onAddDebt,
  onAddPayment,
}) => {
  const isOwing = person.totalDebt > 0;
  const isCleared = person.totalDebt === 0;

  const formattedAmount = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(person.totalDebt));

  // Quick WhatsApp reminder
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phoneClean = (person.phone || '').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hola ${person.name} 👋 Te escribo para comentarte sobre el saldo pendiente de ${currencySymbol}${formattedAmount} en nuestro cuaderno de control. Por favor me avisas cuando puedas revisarlo. ¡Muchas gracias!`
    );
    const url = phoneClean
      ? `https://wa.me/${phoneClean}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  const lastTx = person.lastTransaction;
  const isLastTxDebt = lastTx?.type === 'DEBT';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative w-full text-left bg-white dark:bg-gray-800 rounded-3xl p-4.5 border-2 transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.99] select-none ${
        isOwing
          ? 'border-rose-300 dark:border-rose-800/80 bg-white dark:bg-gray-800'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Top Row: Name and Balance Badge */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-black text-gray-950 dark:text-white truncate leading-snug">
            {person.name}
          </h3>
          {person.notes && (
            <p className="text-xs text-gray-700 dark:text-gray-300 truncate mt-0.5 font-medium">
              {person.notes}
            </p>
          )}
        </div>

        {/* Big Balance Badge - High Contrast */}
        <div className="text-right shrink-0">
          <div
            className={`inline-flex flex-col items-end px-3.5 py-1.5 rounded-2xl border ${
              isOwing
                ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-800'
                : isCleared
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800'
                : 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider">
              {isOwing ? 'Debe Total' : isCleared ? 'Al Día' : 'Saldo a Favor'}
            </span>
            <span className="text-lg font-black leading-tight tracking-tight">
              {currencySymbol} {formattedAmount}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Last transaction hint - Clean, High Contrast, Super Legible */}
      {lastTx && (
        <div
          className={`flex items-center gap-2 text-xs mb-3.5 px-3 py-2 rounded-2xl border font-medium ${
            isLastTxDebt
              ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-gray-900 dark:text-gray-100'
              : 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-gray-900 dark:text-gray-100'
          }`}
        >
          <Clock className="w-4 h-4 shrink-0 text-gray-600 dark:text-gray-300" />
          <span className="font-extrabold uppercase text-[10px] tracking-wider text-gray-700 dark:text-gray-300 shrink-0">
            Último:
          </span>
          <span className="truncate">
            <strong
              className={`font-black ${
                isLastTxDebt
                  ? 'text-rose-700 dark:text-rose-300'
                  : 'text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {isLastTxDebt ? '➕ Deuda' : '💰 Abono'} ({currencySymbol}{lastTx.amount})
            </strong>{' '}
            <span className="text-gray-800 dark:text-gray-200 font-semibold">
              · {lastTx.concept}
            </span>
          </span>
        </div>
      )}

      {/* Bottom Row: Quick Action Buttons (Don't Make Me Think) */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        {/* Quick Payment Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddPayment();
          }}
          className="flex-1 py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
          title="Registrar un abono o pago de esta persona"
        >
          <MinusCircle className="w-4 h-4 text-emerald-100" />
          <span>Abonar</span>
        </button>

        {/* Quick Add Debt Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddDebt();
          }}
          className="flex-1 py-3 px-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
          title="Añadir una nueva deuda a esta persona"
        >
          <PlusCircle className="w-4 h-4 text-rose-100" />
          <span>+ Deuda</span>
        </button>

        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsApp}
          className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center transition shrink-0"
          title="Enviar recordatorio de deuda por WhatsApp"
          aria-label="Recordar por WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </button>

        {/* Open Details Arrow */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-gray-700 shrink-0">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
