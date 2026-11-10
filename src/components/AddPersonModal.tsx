import React, { useState } from 'react';
import { X, UserPlus, DollarSign } from 'lucide-react';

interface AddPersonModalProps {
  currencySymbol: string;
  onClose: () => void;
  onSave: (name: string, phone: string, notes: string, initialDebt: number, initialConcept: string) => void;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({
  currencySymbol,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [initialDebt, setInitialDebt] = useState('');
  const [initialConcept, setInitialConcept] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const quickAmounts = [10, 20, 50, 100, 200, 360];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor escribe el nombre de la persona (ej. Carlos Mecánico)');
      return;
    }

    const debtNumber = parseFloat(initialDebt) || 0;
    onSave(name, phone, notes, debtNumber, initialConcept);
  };

  const handleQuickAmount = (amount: number) => {
    const current = parseFloat(initialDebt) || 0;
    setInitialDebt((current + amount).toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full sm:max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-300 dark:border-gray-700 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-950 dark:text-white leading-tight">
                Registrar Nuevo Deudor
              </h2>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Añadir al cuaderno de control
              </p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 text-xs font-black">
              {error}
            </div>
          )}

          {/* Name Field (Key required field) */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-1.5">
              Nombre de la Persona <span className="text-rose-600 font-black">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ej: Carlos Mecánico, María Vecina..."
              className="w-full px-4 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 rounded-2xl text-base font-bold text-gray-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>

          {/* Initial Debt Field */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-1.5">
              ¿Cuánto debe de inicio? ({currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-2xl font-black text-gray-400">
                {currencySymbol}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                value={initialDebt}
                onChange={(e) => setInitialDebt(e.target.value)}
                placeholder="0.00 (opcional)"
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 rounded-2xl text-2xl font-black text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300 self-center mr-1">Sumar:</span>
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

          {/* Initial Concept if debt is set */}
          {parseFloat(initialDebt) > 0 && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-1.5">
                ¿Por qué motivo debe este monto?
              </label>
              <input
                type="text"
                value={initialConcept}
                onChange={(e) => setInitialConcept(e.target.value)}
                placeholder="Ej: Reparación de camioneta, repuestos, préstamo..."
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 rounded-2xl text-sm font-semibold text-gray-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Optional Details: Phone & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-black text-gray-800 dark:text-gray-200 mb-1">
                Teléfono / WhatsApp (Opcional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: +58 412 1234567"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 rounded-xl text-sm font-semibold text-gray-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-800 dark:text-gray-200 mb-1">
                Nota o Referencia (Opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Taller en la esquina"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 rounded-xl text-sm font-semibold text-gray-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit Button: Big and Clear */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <DollarSign className="w-5 h-5" />
              <span>Guardar en el Cuaderno</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
