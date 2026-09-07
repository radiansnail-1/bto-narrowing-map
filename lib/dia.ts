/** Illustrative first-HDB-loan scenario; eligibility and CPF usability are external inputs. */
export interface DiaInputs {
  price: number;
  income: number;
  years: number;
  rate: number;
  cpfAtSigning: number;
  cpfAtKeys: number;
  grant: number;
  cashAtKeys: number;
}
export const DIA_DEFAULTS: DiaInputs = { price: 500000, income: 6000, years: 25, rate: 2.6, cpfAtSigning: 0, cpfAtKeys: 60000, grant: 0, cashAtKeys: 30000 };
export const DIA_LIMITS: Record<keyof DiaInputs, [number, number]> = {
  price: [1, 3000000], income: [0, 100000], years: [1, 25], rate: [0, 15],
  cpfAtSigning: [0, 3000000], cpfAtKeys: [0, 3000000], grant: [0, 120000], cashAtKeys: [0, 3000000],
};
export function validateDia(input: DiaInputs): Partial<Record<keyof DiaInputs, string>> {
  const errors: Partial<Record<keyof DiaInputs, string>> = {};
  for (const key of Object.keys(DIA_LIMITS) as (keyof DiaInputs)[]) {
    const [min, max] = DIA_LIMITS[key];
    if (!Number.isFinite(input[key]) || input[key] < min || input[key] > max) errors[key] = `Enter a number from ${min.toLocaleString('en-SG')} to ${max.toLocaleString('en-SG')}.`;
  }
  if (Number.isFinite(input.years) && !Number.isInteger(input.years)) errors.years = 'Enter a whole number of years.';
  if (!errors.grant && !errors.price && input.grant > input.price * .95) errors.grant = 'Grants above 95% of the flat price are outside this model. HDB requires at least 5% from your own cash/CPF in that case; confirm the excess-grant treatment with HDB.';
  return errors;
}
export function monthlyPayment(principal: number, annualPercent: number, years: number): number {
  const months = years * 12;
  const rate = annualPercent / 1200;
  return rate === 0 ? principal / months : principal * rate / -Math.expm1(-months * Math.log1p(rate));
}
export function calculateDia(input: DiaInputs) {
  if (Object.keys(validateDia(input)).length) throw new RangeError('Invalid DIA inputs');
  const initial = input.price * .025;
  const initialCpf = Math.min(initial, input.cpfAtSigning);
  const assessmentRate = Math.max(3, input.rate);
  const incomeLoan = input.income * .3 / monthlyPayment(1, assessmentRate, input.years);
  const loanCap = Math.min(input.price * .75, incomeLoan);
  const remainingAfterGrant = input.price - initial - input.grant;
  // Enter CPF remaining at keys AFTER signing, and only the usable amount committed to purchase.
  const keyCpf = Math.min(input.cpfAtKeys, remainingAfterGrant);
  const loan = Math.min(loanCap, Math.max(0, remainingAfterGrant - keyCpf));
  const keyCashRequired = Math.max(0, remainingAfterGrant - keyCpf - loan);
  return { initial, initialCpf, initialCash: initial - initialCpf, assessmentRate, incomeLoan, loanCap,
    keyCpf, loan, keyFunding: remainingAfterGrant - loan, keyCashRequired,
    shortfall: Math.max(0, keyCashRequired - input.cashAtKeys),
    cashLeft: Math.max(0, input.cashAtKeys - keyCashRequired),
    monthly: monthlyPayment(loan, input.rate, input.years),
    monthlyLimit: input.income * .3,
  };
}
