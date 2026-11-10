import React, { useState } from 'react';
import { X, PlusCircle, MinusCircle, Check } from 'lucide-react';
import type { PersonWithBalance, TransactionType } from '../types';

interface AddTransactionModalProps {
  person: PersonWithBalance;
  initialType?: TransactionType;
  currencySymbol: string;
  onClose: () => void;
  onSave: (type: TransactionType, amount: number, concept: string) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  person,
  initialType = 'PAYMENT',
  currencySymbol,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [error, setError] = useState('');

  const quickAmounts = [5, 10, 20, 50, 100];
  const quickPaymentConcepts = ['Efectivo', 'Pago Móvil / Transferencia', 'Zelle', 'Abono parcial'];
  const quickDebtConcepts = ['Repuestos', 'Mano de obra', 'Préstamo', 'Mercancía'];

  const handleQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Por favor indica un monto válido mayor a 0');
      return;
    }

    const defaultConcept =
      type === 'PAYMENT' ? 'Abono recibido' : 'Nueva deuda anotada';
    onSave(type, parsedAmount, concept.trim() || defaultConcept);
  };

  const isPayment = type === 'PAYMENT';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full sm:max-w-md bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/80 dark:bg-gray-800/80">
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
              {isPayment ? 'Registrar Abono' : 'Anotar Nueva Deuda'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Para: <strong className="text-gray-800 dark:text-gray-200">{person.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Type Selector (Abono vs Deuda) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-700/60 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('PAYMENT')}
              className={`py-3 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition ${
                isPayment
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              <span>Abono / Pago (-)</span>
            </button>

            <button
              type="button"
              onClick={() => setType('DEBT')}
              className={`py-3 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition ${
                !isPayment
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nueva Deuda (+)</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Monto ({currencySymbol}) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-2xl font-black text-gray-400">
                {currencySymbol}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                autoFocus
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError('');
                }}
                placeholder="0.00"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-2xl font-black text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-gray-400 self-center mr-1">Sumar:</span>
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 transition"
                >
                  +{currencySymbol}{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Concept / Note */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Motivo o Concepto
            </label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder={isPayment ? 'Ej: Abono en efectivo, transferencia...' : 'Ej: Repuestos, mano de obra...'}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* Quick concept chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(isPayment ? quickPaymentConcepts : quickDebtConcepts).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConcept(c)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/60 dark:hover:bg-gray-700 rounded-xl text-[11px] font-medium text-gray-600 dark:text-gray-300 transition"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-4 px-4 font-black text-base text-white rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-[0.99] ${
                isPayment
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
              }`}
            >
              <Check className="w-5 h-5" />
              <span>
                {isPayment
                  ? `Guardar Abono de ${currencySymbol}${amount || '0'}`
                  : `Anotar Deuda de ${currencySymbol}${amount || '0'}`}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
