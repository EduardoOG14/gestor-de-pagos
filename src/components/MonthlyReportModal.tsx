import React, { useState, useMemo } from 'react';
import {
  X,
  CalendarDays,
  TrendingUp,
  Coins,
  ChevronDown,
  ChevronUp,
  Wallet,
  Sparkles,
} from 'lucide-react';
import type { Person, Transaction } from '../types';

interface MonthlyReportModalProps {
  transactions: Transaction[];
  persons: Person[];
  currencySymbol: string;
  onClose: () => void;
}

interface MonthSummary {
  key: string; // e.g. "2026-11"
  label: string; // e.g. "Noviembre 2026"
  year: number;
  month: number;
  totalCollected: number;
  paymentCount: number;
  payments: {
    txId: string;
    personName: string;
    amount: number;
    concept: string;
    date: string;
  }[];
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  transactions,
  persons,
  currencySymbol,
  onClose,
}) => {
  // State for expanded months in the accordion
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Build person lookup map
  const personMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of persons) {
      map.set(p.id, p.name);
    }
    return map;
  }, [persons]);

  // Group payments by month
  const { monthlyData, totalHistoricalCollected, totalHistoricalPayments, bestMonth } = useMemo(() => {
    const map = new Map<string, MonthSummary>();
    let totalCollected = 0;
    let totalPayments = 0;

    for (const tx of transactions) {
      if (tx.type !== 'PAYMENT') continue;

      const dateObj = new Date(tx.date || tx.createdAt);
      if (isNaN(dateObj.getTime())) continue;

      const year = dateObj.getFullYear();
      const month = dateObj.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;

      const monthName = dateObj.toLocaleDateString('es-ES', { month: 'long' });
      const label = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          label,
          year,
          month,
          totalCollected: 0,
          paymentCount: 0,
          payments: [],
        });
      }

      const current = map.get(key)!;
      current.totalCollected += tx.amount;
      current.paymentCount += 1;
      current.payments.push({
        txId: tx.id,
        personName: personMap.get(tx.personId) || 'Cliente',
        amount: tx.amount,
        concept: tx.concept || 'Abono recibido',
        date: tx.date || tx.createdAt,
      });

      totalCollected += tx.amount;
      totalPayments += 1;
    }

    const list = Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));

    // Sort internal payments per month newest first
    for (const m of list) {
      m.payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Determine the highest month
    let best: MonthSummary | null = null;
    for (const m of list) {
      if (!best || m.totalCollected > best.totalCollected) {
        best = m;
      }
    }

    return {
      monthlyData: list,
      totalHistoricalCollected: totalCollected,
      totalHistoricalPayments: totalPayments,
      bestMonth: best,
    };
  }, [transactions, personMap]);

  // Max month collection for bar percentages
  const maxMonthCollection = useMemo(() => {
    return Math.max(...monthlyData.map((m) => m.totalCollected), 1);
  }, [monthlyData]);

  // Format money helper
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-gray-300 dark:border-gray-700">
        
        {/* Header */}
        <div className="p-4.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-950 dark:text-white leading-tight">
                Cobros por Mes
              </h2>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Historial de ingresos y arqueos mensuales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 transition"
            aria-label="Cerrar reporte mensual"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          
          {/* Hero Stats Card */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-5 shadow-lg shadow-emerald-900/20 relative overflow-hidden border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-200" />
                Total Histórico Cobrado
              </span>
              <span className="text-[11px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-black tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Arqueo General
              </span>
            </div>

            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-black text-emerald-200">{currencySymbol}</span>
              <span className="text-4xl sm:text-5xl font-black tracking-tight">
                {formatMoney(totalHistoricalCollected)}
              </span>
            </div>

            <div className="mt-4 pt-3.5 border-t border-white/20 grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col">
                <span className="text-emerald-200 font-bold text-[11px] uppercase tracking-wider">
                  Total de Abonos
                </span>
                <span className="text-base font-black text-white">
                  {totalHistoricalPayments} {totalHistoricalPayments === 1 ? 'abono' : 'abonos'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-emerald-200 font-bold text-[11px] uppercase tracking-wider">
                  Mejor Mes
                </span>
                <span className="text-base font-black text-white truncate">
                  {bestMonth ? `${bestMonth.label.split(' ')[0]}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Section: List of Months */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Desglose Mes a Mes
              </h3>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {monthlyData.length} {monthlyData.length === 1 ? 'mes registrado' : 'meses registrados'}
              </span>
            </div>

            {monthlyData.length === 0 ? (
              /* Empty State */
              <div className="text-center py-10 px-6 bg-gray-50 dark:bg-gray-800/80 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 space-y-2.5">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Coins className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-gray-900 dark:text-white">
                  Sin cobros registrados aún
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                  A medida que registres abonos en tus ventas de ropa, verás aquí el resumen automático de cada mes.
                </p>
              </div>
            ) : (
              /* Monthly Cards */
              monthlyData.map((item) => {
                const isExpanded = !!expandedMonths[item.key];
                const percentage = Math.round((item.totalCollected / maxMonthCollection) * 100);

                return (
                  <div
                    key={item.key}
                    className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-xs transition hover:shadow-md"
                  >
                    {/* Month Summary Bar (Clickable) */}
                    <button
                      type="button"
                      onClick={() => toggleMonth(item.key)}
                      className="w-full p-4.5 text-left flex flex-col gap-2.5 transition active:bg-gray-50 dark:active:bg-gray-750"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-gray-950 dark:text-white">
                            {item.label}
                          </span>
                          <span className="text-[11px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                            {item.paymentCount} {item.paymentCount === 1 ? 'abono' : 'abonos'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                            {currencySymbol}{formatMoney(item.totalCollected)}
                          </span>
                          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Visual Relative Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                          <span>{isExpanded ? 'Toca para ocultar abonos' : 'Toca para ver abonos de este mes'}</span>
                          <span>{percentage}% del mes récord</span>
                        </div>
                      </div>
                    </button>

                    {/* Accordion Detail: Payments received in this month */}
                    {isExpanded && (
                      <div className="border-t-2 border-gray-100 dark:border-gray-700/80 bg-gray-50/70 dark:bg-gray-900/60 p-3.5 space-y-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 block px-1">
                          Abonos recibidos en {item.label}:
                        </span>
                        <div className="space-y-2">
                          {item.payments.map((p) => {
                            const dateObj = new Date(p.date);
                            const formattedDate = dateObj.toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                            });

                            return (
                              <div
                                key={p.txId}
                                className="p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-2xs"
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black text-gray-950 dark:text-white truncate">
                                      {p.personName}
                                    </span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold shrink-0">
                                      · {formattedDate}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium truncate">
                                    {p.concept}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                                    +{currencySymbol}{formatMoney(p.amount)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
