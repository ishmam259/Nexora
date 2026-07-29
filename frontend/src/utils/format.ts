export function formatMoney(amount: number, currency = 'BDT') {
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Short badge form for tight UI (e.g. home wallet chip). */
export function formatMoneyCompact(amount: number, currency = 'BDT') {
  const value = amount.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  if (currency === 'BDT') return `৳${value}`;
  return `${currency} ${value}`;
}

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Converts a status enum value like "OUT_FOR_DELIVERY" into "Out for delivery". */
export function humanizeStatus(status: string) {
  const words = status.split('_').map((w) => w.toLowerCase());
  return words.map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(' ');
}
