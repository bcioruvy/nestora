export function formatCurrency(amount: number, currency: string = 'PKR') {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
