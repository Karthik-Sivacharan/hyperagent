// Number formatting for the fleet views. The formatters are built once with a
// fixed locale so the server and the client print the same string.

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const USD_WHOLE = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** `$3.88`, `$1,021.40`; `{ whole: true }` drops the cents: `$1,021`. */
export function formatUsd(value: number, options?: { whole?: boolean }): string {
  return (options?.whole ? USD_WHOLE : USD).format(value);
}

/** `<1m`, `15m`, `1h`, `1h 20m`, `26h 5m`. */
export function formatMinutes(minutes: number): string {
  const total = Math.round(minutes);
  if (total < 1) return "<1m";
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}
