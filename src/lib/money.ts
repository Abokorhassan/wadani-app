/**
 * Reads an amount the member typed, or null when it is not a real one.
 *
 * Deliberately strict. The API takes `amount` as a decimal string and charges
 * exactly that, so anything ambiguous has to be refused here, not repaired: a
 * lenient parser once turned "10.999" into a $11.00 charge, "1e3" into $13, and
 * "0.001" into a $0.00 one.
 *
 * Accepts "10", "10.5", "10.50" and "$10.50" -- at most two decimals, and at
 * least one cent.
 */
export function parseMoney(input: string): number | null {
  const text = input.trim().replace(/^\$\s*/, '');
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(text)) return null;

  const amount = Number(text);
  return amount >= 0.01 ? amount : null;
}
