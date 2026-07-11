const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCurrency(amountInPesos: number): string {
  return copFormatter.format(amountInPesos);
}
