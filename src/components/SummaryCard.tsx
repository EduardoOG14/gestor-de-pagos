import React from 'react';
import { DollarSign, Users, CheckCircle2, Coins } from 'lucide-react';

interface SummaryCardProps {
  totalPendingDebt: number;
  debtorCount: number;
  clearedCount: number;
  currencySymbol: string;
  collectedToday: number;
  todayPaymentCount: number;
  onOpenMonthlyReport?: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  totalPendingDebt,
  debtorCount,
  clearedCount,
  currencySymbol,
  collectedToday,
  todayPaymentCount,
  onOpenMonthlyReport,
}) => {
  const formattedDebt = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalPendingDebt);

  const formattedCollectedToday = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(collectedToday);

  return (
    <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-5 shadow-lg shadow-emerald-900/20 relative overflow-hidden border border-emerald-500/30">
      {/* Decorative background shape */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -left-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-lg pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-200" />
            Total Pendiente por Cobrar
          </span>
          <span className="text-[11px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-black tracking-wide">
            Control Interno
          </span>
        </div>

        {/* Big, impossible-to-miss amount */}
        <div className="flex items-baseline gap-1 my-1">
          <span className="text-2xl font-black text-emerald-200">{currencySymbol}</span>
          <span className="text-4xl sm:text-5xl font-black tracking-tight">{formattedDebt}</span>
        </div>

        {/* Breakdown counters */}
        <div className="mt-4 pt-3.5 border-t border-white/25 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1.5 font-bold">
            <Users className="w-4 h-4 text-emerald-200" />
            <span>
              <strong className="text-white text-sm font-black">{debtorCount}</strong>{' '}
              {debtorCount === 1 ? 'persona debe' : 'personas deben'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>
              <strong className="text-white text-sm font-black">{clearedCount}</strong> al día
            </span>
          </div>
        </div>

        {/* ARQUEO DEL DÍA: Cobrado Hoy (Clickable to open Monthly Report) */}
        <button
          type="button"
          onClick={onOpenMonthlyReport}
          className="w-[calc(100%+2.5rem)] mt-3.5 pt-3 border-t border-white/20 flex items-center justify-between bg-black/20 hover:bg-black/30 active:bg-black/40 -mx-5 -mb-5 px-5 py-3 rounded-b-3xl text-left transition group cursor-pointer"
          title="Toca para ver el desglose de cobros por mes"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 group-hover:bg-white/30 flex items-center justify-center text-emerald-200 shrink-0 transition">
              <Coins className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100 block leading-tight flex items-center gap-1.5">
                <span>💰 Cobrado Hoy</span>
                <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-md font-black text-white group-hover:bg-white/30">
                  Ver meses →
                </span>
              </span>
              <span className="text-[11px] text-emerald-200/90 font-medium">
                {todayPaymentCount === 0
                  ? 'Sin cobros registrados hoy'
                  : `${todayPaymentCount} ${todayPaymentCount === 1 ? 'abono recibido hoy' : 'abonos recibidos hoy'}`}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {currencySymbol}{formattedCollectedToday}
            </span>
          </div>
        </button>

      </div>
    </div>
  );
};
