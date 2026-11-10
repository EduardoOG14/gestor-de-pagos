// Generates the single standard WhatsApp reminder message
export function getCollectionReminderMessage(name: string, amount: string, currency: string): string {
  return `Hola ${name} 👋 Te escribo para comentarte sobre la deuda pendiente de ${currency}${amount} que tenemos. Por favor me avisas cuando puedas hacer un abono. ¡Muchas gracias!`;
}
