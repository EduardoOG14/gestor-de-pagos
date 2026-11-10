import React, { useState } from 'react';
import { X, PlusCircle, MinusCircle, Check, MessageCircle, CheckCircle2 } from 'lucide-react';
import type { PersonWithBalance, TransactionType } from '../types';
import { getPaymentReceiptMessage } from '../utils/debtorAlerts';

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
  const [receiptData, setReceiptData] = useState<{
    amount: string;
    concept: string;
    remainingDebt: string;
  } | null>(null);

  const quickAmounts = [5, 10, 15, 20, 30, 50];
  const quickPaymentConcepts = ['Efectivo', 'Pago Móvil / Transferencia', 'Zelle', 'Dólares en efectivo'];
  const quickDebtConcepts = [
    'Pantalón',
    'Camisa',
    'Zapatos',
    'Vestido',
    'Franela',
    'Conjunto',
    'Chaqueta',
    'Ropa variada',
  ];

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
    const finalConcept = concept.trim() || defaultConcept;

    onSave(type, parsedAmount, finalConcept);

    if (type === 'PAYMENT') {
      const remaining = Math.max(0, person.totalDebt - parsedAmount);
      const formattedRemaining = new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(remaining);

      const formattedPaid = new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(parsedAmount);

      setReceiptData({
        amount: formattedPaid,
        concept: finalConcept,
        remainingDebt: formattedRemaining,
      });
    } else {
      onClose();
    }
  };

  const handleSendWhatsAppReceipt = () => {
    if (!receiptData) return;
    const phoneClean = (person.phone || '').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      getPaymentReceiptMessage(
        person.name,
        receiptData.amount,
        receiptData.concept,
        receiptData.remainingDebt,
        currencySymbol
      )
    );
    const url = phoneClean
      ? `https://wa.me/${phoneClean}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
    onClose();
  };

  const isPayment = type === 'PAYMENT';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full sm:max-w-md bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-300 dark:border-gray-700 flex flex-col">
        
        {/* Header */}
        <div className="p-4.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
          <div>
            <h2 className="text-xl font-black text-gray-950 dark:text-white leading-tight">
              {receiptData
                ? '¡Abono Registrado!'
                : isPayment
                ? 'Registrar Abono'
                : 'Anotar Nueva Deuda'}
            </h2>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Para: <strong className="text-gray-950 dark:text-white font-black">{person.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RECEIPT SUCCESS VIEW */}
        {receiptData ? (
          <div className="p-5 space-y-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-600/20 border border-emerald-300 dark:border-emerald-800 animate-bounce-subtle">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Abono guardado en el cuaderno
              </span>
              <h3 className="text-2xl font-black text-gray-950 dark:text-white mt-0.5">
                +{currencySymbol}{receiptData.amount}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-bold mt-1">
                {receiptData.concept}
              </p>
            </div>

            {/* Breakdown Card */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/60 rounded-2xl border-2 border-gray-200 dark:border-gray-600 text-left space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 dark:text-gray-400 font-bold">Cliente:</span>
                <span className="font-black text-gray-900 dark:text-white">{person.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 dark:text-gray-400 font-bold">Monto abonado:</span>
                <span className="font-black text-emerald-700 dark:text-emerald-300">
                  +{currencySymbol}{receiptData.amount}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-700 dark:text-gray-300 font-bold">Saldo restante:</span>
                <span className="font-black text-gray-950 dark:text-white text-sm">
                  {currencySymbol}{receiptData.remainingDebt}
                </span>
              </div>
            </div>

            {/* Actions: Send receipt via WhatsApp or Close */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSendWhatsAppReceipt}
                className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Enviar Recibo por WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-black text-xs rounded-2xl transition"
              >
                <span>Listo / No enviar</span>
              </button>
            </div>
          </div>
        ) : (
          /* FORM BODY */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 text-xs font-black">
                {error}
              </div>
            )}

            {/* Type Selector (Abono vs Deuda) */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 dark:bg-gray-700/60 rounded-2xl border border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setType('PAYMENT')}
                className={`py-3.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition ${
                  isPayment
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-800 dark:text-gray-200 hover:text-gray-950 font-bold'
                }`}
              >
                <MinusCircle className="w-4 h-4" />
                <span>Abono (Resta)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('DEBT')}
                className={`py-3.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition ${
                  !isPayment
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-gray-800 dark:text-gray-200 hover:text-gray-950 font-bold'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Deuda (Suma)</span>
              </button>
            </div>

            {/* Amount input with big keypad focus */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-1.5">
                Monto ({currencySymbol})
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-2xl font-black text-gray-600 dark:text-gray-300">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="0.00"
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 rounded-2xl text-2xl font-black text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAmount(amt)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-xs font-black text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-2xs transition"
                  >
                    +{currencySymbol}{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Concept / Note */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-1.5">
                Motivo o Concepto
              </label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder={isPayment ? 'Ej: Abono en efectivo, transferencia...' : 'Ej: Pantalón, Camisa, Zapatos...'}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 rounded-2xl text-sm font-semibold text-gray-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {/* Quick concept chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(isPayment ? quickPaymentConcepts : quickDebtConcepts).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setConcept(c)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 transition"
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
        )}

      </div>
    </div>
  );
};
