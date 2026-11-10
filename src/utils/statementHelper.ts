import type { PersonWithBalance, Transaction } from '../types';

export interface StatementItem {
  id: string;
  dateStr: string;
  type: 'DEBT' | 'PAYMENT';
  amount: number;
  concept: string;
  runningDebt: number;
}

export interface StatementReport {
  personName: string;
  items: StatementItem[];
  totalDebt: number;
  whatsappMessage: string;
}

export function generateStatementReport(
  person: PersonWithBalance,
  transactions: Transaction[],
  currencySymbol: string
): StatementReport {
  // Filter for this person and sort chronologically (oldest first)
  const personTxs = transactions
    .filter((t) => t.personId === person.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningDebt = 0;
  const items: StatementItem[] = [];

  for (const tx of personTxs) {
    if (tx.type === 'DEBT') {
      runningDebt += Number(tx.amount) || 0;
    } else {
      runningDebt -= Number(tx.amount) || 0;
    }

    // Format date as DD/MM/YY
    const d = new Date(tx.date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    const dateStr = `${day}/${month}/${year}`;

    items.push({
      id: tx.id,
      dateStr,
      type: tx.type,
      amount: tx.amount,
      concept: tx.concept,
      runningDebt: Math.round(runningDebt * 100) / 100,
    });
  }

  // Generate beautiful WhatsApp formatted text
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = String(today.getFullYear()).slice(-2);
  const todayStr = `${day}/${month}/${year}`;

  const lines: string[] = [
    `📋 *HISTORIAL DE CUENTA - CONTROL INTERNO*`,
    `👤 *${person.name}*`,
    `📅 *Fecha de emisión:* ${todayStr}`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `📜 *HISTORIAL DE DEUDAS Y ABONOS:*`,
  ];

  if (items.length === 0) {
    lines.push(`_Sin movimientos registrados aún._`);
  } else {
    items.forEach((item) => {
      const typeLabel =
        item.type === 'DEBT'
          ? `🔴 Deuda por ${item.amount}${currencySymbol}`
          : `🟢 Abono de ${item.amount}${currencySymbol}`;
      const balanceLabel = `Deuda total = ${item.runningDebt}${currencySymbol}`;
      lines.push(`* ${item.dateStr} | ${typeLabel} | ${item.concept} | ${balanceLabel}`);
    });
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);

  if (person.totalDebt > 0) {
    lines.push(`💰 *DEUDA TOTAL PENDIENTE: ${currencySymbol}${person.totalDebt.toFixed(2)}*`);
  } else if (person.totalDebt === 0) {
    lines.push(`✅ *ESTADO: CUENTA AL DÍA (Saldada en 0${currencySymbol})*`);
  } else {
    lines.push(`🔵 *SALDO A FAVOR DEL CLIENTE: ${currencySymbol}${Math.abs(person.totalDebt).toFixed(2)}*`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`_Registro del cuaderno de control_`);

  const whatsappMessage = lines.join('\n');

  return {
    personName: person.name,
    items,
    totalDebt: person.totalDebt,
    whatsappMessage,
  };
}
