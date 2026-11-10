import type { Transaction } from '../types';

export interface DormantAlert {
  days: number;
  label: string;
  level: 'warning' | 'danger';
}

/**
 * Calculates days without payment for a debtor with active debt.
 * - If they have made payments, it calculates from the most recent PAYMENT date.
 * - If they have NEVER made a payment, it calculates from their earliest debt/creation date.
 * - Returns null if debt is <= 0 or if inactivity is under 14 days.
 */
export function getDormantDebtorAlert(
  totalDebt: number,
  transactions: Transaction[],
  personCreatedAt: string
): DormantAlert | null {
  if (totalDebt <= 0) return null;

  const now = new Date().getTime();

  // Find all PAYMENT transactions
  const payments = transactions.filter((t) => t.type === 'PAYMENT');

  let referenceTime: number;
  let hasEverPaid = false;

  if (payments.length > 0) {
    hasEverPaid = true;
    // Most recent payment
    const sorted = [...payments].sort(
      (a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
    );
    referenceTime = new Date(sorted[0].date || sorted[0].createdAt).getTime();
  } else {
    // Never paid: find earliest transaction or person creation date
    const dates = transactions.map((t) => new Date(t.date || t.createdAt).getTime());
    dates.push(new Date(personCreatedAt).getTime());
    referenceTime = Math.min(...dates.filter((d) => !isNaN(d)));
  }

  if (isNaN(referenceTime)) return null;

  const diffMs = now - referenceTime;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // If under 14 days, don't show alarm badge
  if (days < 14) return null;

  if (days >= 30) {
    const months = Math.floor(days / 30);
    const label = !hasEverPaid
      ? `🚨 Nunca ha abonado (${days} días)`
      : months === 1
      ? `🚨 1 mes sin abonar (${days}d)`
      : `🚨 +${months} meses sin abonar (${days}d)`;

    return { days, label, level: 'danger' };
  }

  // 14 to 29 days
  const label = !hasEverPaid
    ? `⏳ ${days} días sin abonar`
    : `⏳ ${days} días sin abonar`;

  return { days, label, level: 'warning' };
}

/**
 * Generates formatted payment receipt message for WhatsApp.
 */
export function getPaymentReceiptMessage(
  personName: string,
  amountPaid: string,
  concept: string,
  remainingDebt: string,
  currency: string
): string {
  const numericRemaining = parseFloat(remainingDebt.replace('.', '').replace(',', '.'));

  if (numericRemaining <= 0) {
    return `Hola ${personName} 👋 ¡Deuda saldada en su totalidad! 🎉\n\n` +
      `🧾 *RECIBO DE PAGO*\n` +
      `• Monto pagado: *${currency}${amountPaid}*\n` +
      `• Concepto: *${concept}*\n` +
      `• Saldo restante: *${currency}0,00 (Totalmente al día)*\n\n` +
      `¡Muchísimas gracias por tu pago y seriedad! Queda constancia de que tu cuenta está en cero. 🤝`;
  }

  return `Hola ${personName} 👋 Te comparto el comprobante de tu abono:\n\n` +
    `🧾 *RECIBO DE ABONO*\n` +
    `• Abono recibido: *${currency}${amountPaid}*\n` +
    `• Concepto: *${concept}*\n` +
    `• Saldo pendiente: *${currency}${remainingDebt}*\n\n` +
    `¡Muchas gracias por tu pago! Queda registrado en nuestro cuaderno de control. 🤝`;
}
