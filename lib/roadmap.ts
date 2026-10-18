/**
 * Month-by-month illustrative purchase funding and repayment roadmap.
 * All balances, contributions, grants, loan amounts, and dates are user assumptions;
 * this does not infer eligibility, CPF rules, loan approval, or future income. Contributions
 * arrive at month end, after scheduled payments. Cash may go negative to expose a funding
 * gap; CPF is never allowed below the selected reserve. The booking option fee is paid in
 * cash and credited once against the signing price instalment. Renovation is cash-only.
 * Milestone cash and CPF fields are total household funding used at that event, including
 * fees; fees includes stamp duty and user-entered costs, and pricePayment is the price-stage amount.
 * Default fee and renovation inputs are fictional examples, not official fee estimates.
 */
import { monthlyPayment as diaMonthlyPayment } from './dia';
export type RoadmapPerson = { cash: number; cpf: number; monthlyCash: number; monthlyCpf: number; startsOn: string; annualGrowth: number };
export type RoadmapInputs = {
  startMonth: string; bookingMonth: string; signingMonth: string; keysMonth: string; renovationMonth: string;
  flatType: '2-room-flexi' | '3-room' | '4-room-or-larger'; price: number; marketValue: number;
  plan: 'dia' | 'staggered' | 'standard'; lender: 'hdb' | 'bank75' | 'bank55'; loan: number; grant: number;
  rate: number; years: number; signingFees: number; keyFees: number; renovation: number;
  emergencyCash: number; cpfReserve: number; paymentOrder: 'cpf-first' | 'cash-first';
  repayment: 'cpf-first' | 'cash-only'; people: [RoadmapPerson, RoadmapPerson];
};

const person = (): RoadmapPerson => ({ cash: 10000, cpf: 10000, monthlyCash: 1000, monthlyCpf: 690, startsOn: '2026-10', annualGrowth: 0 });
export const ROADMAP_DEFAULTS: RoadmapInputs = {
  startMonth: '2026-10', bookingMonth: '2026-11', signingMonth: '2027-05', keysMonth: '2030-11', renovationMonth: '2031-01',
  flatType: '4-room-or-larger', price: 500000, marketValue: 500000, plan: 'dia', lender: 'hdb', loan: 375000, grant: 0,
  rate: 2.6, years: 25, signingFees: 500, keyFees: 1500, renovation: 30000, emergencyCash: 10000, cpfReserve: 0,
  paymentOrder: 'cpf-first', repayment: 'cpf-first', people: [person(), person()],
};

export type RoadmapMonth = { month: string; cash: number; cpf: number; cashPayment: number; cpfPayment: number; shortfall: number; reserveGap: number; events: string[] };
export type RoadmapMilestone = { id: string; label: string; month: string; pricePayment: number; cpf: number; cash: number; grant: number; loan: number; stampDuty: number; fees: number; cashAfter: number; cpfAfter: number; shortfall: number; reserveGap: number };
export type RoadmapLoanYear = { year: number; balance: number; interest: number; principal: number };

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const monthIndex = (month: string) => Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1;
const moneyFields = ['price', 'marketValue', 'loan', 'grant', 'rate', 'years', 'signingFees', 'keyFees', 'renovation', 'emergencyCash', 'cpfReserve'] as const;
function milestonePercent(input: RoadmapInputs) {
  if (input.plan === 'dia') return 0.025;
  if (input.lender === 'hdb') return input.plan === 'staggered' ? 0.05 : 0.10;
  return input.plan === 'staggered' ? 0.10 : 0.20;
}
function maxLoanPercent(input: RoadmapInputs) { return input.lender === 'bank55' ? 0.55 : 0.75; }
function minCashPercent(input: RoadmapInputs) {
  if (input.lender === 'hdb') return 0;
  if (input.plan === 'dia') return input.lender === 'bank55' ? 0.10 : 0.05;
  return input.lender === 'bank55' ? 0.10 : 0.05;
}

export function validateRoadmap(input: RoadmapInputs): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const key of ['startMonth', 'bookingMonth', 'signingMonth', 'keysMonth', 'renovationMonth'] as const) {
    if (typeof input[key] !== 'string' || !monthPattern.test(input[key])) errors[key] = 'Enter a valid month in YYYY-MM format.';
  }
  if (input.people?.length !== 2) errors.people = 'Enter two household members.';
  else input.people.forEach((p, i) => {
    for (const key of ['cash', 'cpf', 'monthlyCash', 'monthlyCpf', 'annualGrowth'] as const) {
      if (!Number.isFinite(p[key]) || p[key] < 0 || (key === 'annualGrowth' && p[key] > 100) || (key !== 'annualGrowth' && p[key] > 100000000)) errors[`people.${i}.${key}`] = 'Enter a valid amount (growth must be at most 100%; balances and contributions at most $100,000,000).';
    }
    if (typeof p.startsOn !== 'string' || !monthPattern.test(p.startsOn)) errors[`people.${i}.startsOn`] = 'Enter a valid month in YYYY-MM format.';
  });
  for (const key of moneyFields) {
    const value = input[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100000000) errors[key] = 'Enter a finite number from 0 to $100,000,000.';
  }
  if (input.price <= 0) errors.price = 'Price must be greater than zero.';
  if (input.marketValue <= 0) errors.marketValue = 'Market value must be greater than zero.';
  if (!['2-room-flexi', '3-room', '4-room-or-larger'].includes(input.flatType)) errors.flatType = 'Choose a supported flat type.';
  if (!['dia', 'staggered', 'standard'].includes(input.plan)) errors.plan = 'Choose a supported payment plan.';
  if (!['hdb', 'bank75', 'bank55'].includes(input.lender)) errors.lender = 'Choose a supported lender assumption.';
  if (!['cpf-first', 'cash-first'].includes(input.paymentOrder)) errors.paymentOrder = 'Choose a supported payment order.';
  if (!['cpf-first', 'cash-only'].includes(input.repayment)) errors.repayment = 'Choose a supported repayment source.';
  if (Number.isFinite(input.years)) {
    const max = input.lender === 'bank55' ? 30 : 25;
    if (!Number.isInteger(input.years) || input.years < 1 || input.years > max) errors.years = `Enter a whole number of years from 1 to ${max}.`;
  }
  if (input.rate > 15) errors.rate = 'Enter an annual rate no higher than 15%.';
  if (input.grant > 120000 || input.grant > input.price * 0.95) errors.grant = 'Grant assumption must be no more than $120,000 or 95% of price.';
  if (input.loan > input.price * maxLoanPercent(input)) errors.loan = `Loan assumption exceeds the ${Math.round(maxLoanPercent(input) * 100)}% price cap.`;
  if (!errors.price && !errors.grant && !errors.loan && input.loan > input.price - input.price * milestonePercent(input) - input.grant) errors.loan = 'Loan exceeds the price remaining after the signing payment and grant.';
  if (!errors.price && !errors.grant && !errors.loan && input.plan === 'dia' && input.lender !== 'hdb') {
    const keyCashMinimum = input.price * (minCashPercent(input) - .025);
    if (input.price * .975 - input.loan - input.grant < keyCashMinimum - .000001) errors.loan = 'Reduce the assumed loan or grant so the required bank cash payment at keys remains payable.';
  }
  if (input.lender === 'hdb' && input.cpfReserve > 40000) errors.cpfReserve = 'For this HDB illustration, the household CPF reserve is capped at $40,000.';
  if (['startMonth', 'bookingMonth', 'signingMonth', 'keysMonth', 'renovationMonth'].every((key) => !errors[key])) {
    const [start, booking, signing, keys, reno] = [input.startMonth, input.bookingMonth, input.signingMonth, input.keysMonth, input.renovationMonth].map(monthIndex);
    if (!(start <= booking && booking <= signing && signing < keys && keys <= reno)) errors.keysMonth = 'Use start ≤ booking ≤ signing < keys ≤ renovation.';
    if (monthPattern.test(input.startMonth) && monthPattern.test(input.renovationMonth) && monthIndex(input.renovationMonth) - monthIndex(input.startMonth) > 180) errors.renovationMonth = 'Roadmap horizon cannot exceed 15 years.';
    input.people?.forEach((p, i) => {
      if (monthPattern.test(p.startsOn) && monthIndex(p.startsOn) < start - 180) errors[`people.${i}.startsOn`] = 'Use an addition start month within 15 years before the roadmap start.';
    });
  }
  const optionFee = input.flatType === '2-room-flexi' ? 500 : input.flatType === '3-room' ? 1000 : 2000;
  const signingGross = input.price * milestonePercent(input);
  if (!errors.price && signingGross < optionFee) errors.price = 'Signing instalment must cover the booking option fee credited against it.';
  const bankMinimum = input.price * minCashPercent(input);
  const cashAtSigning = input.plan === 'dia' ? 0 : bankMinimum;
  if (input.lender !== 'hdb' && cashAtSigning > signingGross) errors.lender = 'This bank minimum cash assumption exceeds the signing instalment.';
  return errors;
}

function stampDuty(amount: number): number {
  const tiers: Array<[number, number]> = [[180000, .01], [180000, .02], [640000, .03], [500000, .04], [1500000, .05], [Infinity, .06]];
  let left = amount, total = 0;
  for (const [width, rate] of tiers) { const slice = Math.min(left, width); total += slice * rate; left -= slice; if (left <= 0) break; }
  return Math.floor(total + 1e-9);
}
function rounded(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100; }

export function calculateRoadmap(input: RoadmapInputs) {
  if (Object.keys(validateRoadmap(input)).length) throw new RangeError('Invalid roadmap inputs');
  const duty = stampDuty(Math.max(input.price, input.marketValue));
  const optionFee = input.flatType === '2-room-flexi' ? 500 : input.flatType === '3-room' ? 1000 : 2000;
  const signingGross = input.price * milestonePercent(input);
  const signingPricePayment = signingGross - optionFee;
  const keysPayment = input.price - signingGross - input.loan - input.grant;
  if (keysPayment < -0.005) throw new RangeError('Loan and grant exceed the remaining price after signing.');
  const totalRepaid = input.loan <= 0 ? 0 : diaMonthlyPayment(input.loan, input.rate, input.years) * input.years * 12;
  const totalInterest = totalRepaid - input.loan;
  const pay = diaMonthlyPayment(input.loan, input.rate, input.years);
  const start = monthIndex(input.startMonth), end = Math.max(monthIndex(input.keysMonth) + 12, monthIndex(input.renovationMonth));
  const indexes = { booking: monthIndex(input.bookingMonth), signing: monthIndex(input.signingMonth), keys: monthIndex(input.keysMonth), renovation: monthIndex(input.renovationMonth) };
  let cash = input.people.reduce((s, p) => s + p.cash, 0), cpf = input.people.reduce((s, p) => s + p.cpf, 0);
  const initialCash = cash, initialCpf = cpf, months: RoadmapMonth[] = [], milestones: RoadmapMilestone[] = [];
  let minCash = cash, minimumCashMonth = input.startMonth, maxShortfall = 0, maxReserveGap = Math.max(0, input.emergencyCash - cash), balance = input.loan;
  let cashPricePaid = 0;
  let installmentCount = 0;
  for (let mi = start; mi <= end; mi++) {
    const month = `${Math.floor(mi / 12).toString().padStart(4, '0')}-${String(mi % 12 + 1).padStart(2, '0')}`;
    let cashPayment = 0, cpfPayment = 0; const events: string[] = [];
    const take = (amount: number, allowCpf: boolean, forcedCash = 0) => {
      let remaining = amount;
      let paidCash = 0;
      const forced = Math.min(remaining, forcedCash);
      if (forced > 0) { cash -= forced; cashPayment += forced; paidCash += forced; remaining -= forced; }
      if (input.paymentOrder === 'cash-first') {
        const usableCash = Math.max(0, cash - input.emergencyCash);
        const c = Math.min(remaining, usableCash); cash -= c; cashPayment += c; paidCash += c; remaining -= c;
      }
      if (allowCpf && remaining > 0) {
        const available = Math.max(0, cpf - input.cpfReserve);
        const p = Math.min(remaining, available); cpf -= p; cpfPayment += p; remaining -= p;
      }
      if (remaining > 0) { cash -= remaining; cashPayment += remaining; paidCash += remaining; remaining = 0; }
      return paidCash;
    };
    if (mi === indexes.booking) { cashPricePaid += take(optionFee, false); events.push('Booking option fee credited to price'); }
    if (mi === indexes.signing) {
      const minimumCash = input.lender === 'hdb' ? 0 : input.price * minCashPercent(input);
      const requiredSigningCash = input.plan === 'dia' && input.lender !== 'hdb'
        ? signingPricePayment
        : input.plan === 'dia' ? 0 : Math.max(0, minimumCash - cashPricePaid);
      const beforeMilestoneCash = cashPayment, beforeMilestoneCpf = cpfPayment;
      cashPricePaid += take(signingPricePayment, true, requiredSigningCash);
      take(duty, true); take(input.signingFees, false); events.push('Signing price payment', 'Stamp duty and signing fees');
      const m = { id: 'signing', label: 'Signing', month, pricePayment: signingPricePayment, cpf: cpfPayment - beforeMilestoneCpf, cash: cashPayment - beforeMilestoneCash, grant: 0, loan: 0, stampDuty: duty, fees: duty + input.signingFees, cashAfter: 0, cpfAfter: 0, shortfall: 0, reserveGap: 0 };
      milestones.push(m);
    }
    if (mi === indexes.keys) {
      const minimumCash = input.lender === 'hdb' ? 0 : input.price * minCashPercent(input);
      const requiredKeysCash = input.plan === 'dia' ? Math.max(0, minimumCash - cashPricePaid) : 0;
      const beforeMilestoneCash = cashPayment, beforeMilestoneCpf = cpfPayment;
      take(Math.max(0, keysPayment), true, requiredKeysCash);
      take(input.keyFees, false);
      events.push('Keys price payment', 'Keys fees');
      const milestoneCash = cashPayment - beforeMilestoneCash, milestoneCpf = cpfPayment - beforeMilestoneCpf;
      milestones.push({ id: 'keys', label: 'Keys', month, pricePayment: Math.max(0, keysPayment), cpf: milestoneCpf, cash: milestoneCash, grant: input.grant, loan: input.loan, stampDuty: 0, fees: input.keyFees, cashAfter: 0, cpfAfter: 0, shortfall: 0, reserveGap: 0 });
    }
    if (mi === indexes.renovation) { take(input.renovation, false); events.push('Cash-only renovation'); }
    // Loan repayment begins in the month after keys. Never amortize below zero.
    let firstRepayment: { cash: number; cpf: number } | null = null;
    if (mi > indexes.keys && balance > 0 && installmentCount < input.years * 12) {
      const interest = balance * input.rate / 1200;
      const principal = Math.min(balance, Math.max(0, pay - interest));
      const due = interest + principal;
      let cashDue = due, cpfDue = 0;
      if (input.repayment === 'cpf-first') {
        cpfDue = Math.min(due, Math.max(0, cpf - input.cpfReserve)); cpf -= cpfDue; cashDue -= cpfDue;
      }
      cash -= cashDue; cashPayment += cashDue; cpfPayment += cpfDue; balance = Math.max(0, balance - principal); installmentCount++;
      if (installmentCount === 1) firstRepayment = { cash: cashDue, cpf: cpfDue };
      events.push(installmentCount === 1 ? 'First loan repayment' : 'Loan repayment');
    }
    const lowestDuringMonth = cash;
    // Contribution growth steps up every 12 months from each person's own start month.
    input.people.forEach((p) => {
      if (mi < monthIndex(p.startsOn)) return;
      const yearsActive = Math.floor((mi - monthIndex(p.startsOn)) / 12);
      const factor = (1 + p.annualGrowth / 100) ** yearsActive;
      cash += p.monthlyCash * factor; cpf += p.monthlyCpf * factor;
    });
    cash = rounded(cash); cpf = Math.max(0, rounded(cpf));
    const monthLow = Math.min(cash, lowestDuringMonth);
    if (monthLow < minCash) { minCash = monthLow; minimumCashMonth = month; }
    const shortfall = Math.max(0, -monthLow), reserveGap = Math.max(0, input.emergencyCash - monthLow);
    maxShortfall = Math.max(maxShortfall, shortfall); maxReserveGap = Math.max(maxReserveGap, reserveGap);
    const monthRow: RoadmapMonth = { month, cash, cpf, cashPayment: rounded(cashPayment), cpfPayment: rounded(cpfPayment), shortfall: rounded(shortfall), reserveGap: rounded(reserveGap), events };
    months.push(monthRow);
    const milestone = milestones.find((m) => m.month === month && (m.id === 'signing' || m.id === 'keys'));
    if (milestone) Object.assign(milestone, { cashAfter: cash, cpfAfter: cpf, shortfall: monthRow.shortfall, reserveGap: monthRow.reserveGap });
    if (mi === indexes.booking) milestones.push({ id: 'booking', label: 'Booking', month, pricePayment: optionFee, cpf: 0, cash: optionFee, grant: 0, loan: 0, stampDuty: 0, fees: 0, cashAfter: cash, cpfAfter: cpf, shortfall, reserveGap });
    if (mi === indexes.renovation) milestones.push({ id: 'renovation', label: 'Renovation', month, pricePayment: 0, cpf: 0, cash: input.renovation, grant: 0, loan: 0, stampDuty: 0, fees: 0, cashAfter: cash, cpfAfter: cpf, shortfall, reserveGap });
    if (firstRepayment) milestones.push({ id: 'first-repayment', label: 'First loan repayment', month, pricePayment: 0, cpf: rounded(firstRepayment.cpf), cash: rounded(firstRepayment.cash), grant: 0, loan: 0, stampDuty: 0, fees: 0, cashAfter: cash, cpfAfter: cpf, shortfall, reserveGap });
  }
  // The signing milestone can share booking month; establish its ending balances from that month row.
  milestones.forEach((m) => { const row = months.find((r) => r.month === m.month); if (row) { m.cashAfter = row.cash; m.cpfAfter = row.cpf; m.shortfall = row.shortfall; m.reserveGap = row.reserveGap; } });
  // This chart is independent of the shorter household-cash projection and always covers the full term.
  const loanSchedule: RoadmapLoanYear[] = [{ year: 0, balance: input.loan, interest: 0, principal: 0 }];
  let scheduleBalance = input.loan, scheduleInterest = 0, schedulePrincipal = 0;
  for (let n = 1; n <= input.years * 12 && scheduleBalance > 0; n++) {
    const interest = scheduleBalance * input.rate / 1200;
    const principal = Math.min(scheduleBalance, Math.max(0, pay - interest));
    scheduleBalance = Math.max(0, scheduleBalance - principal); scheduleInterest += interest; schedulePrincipal += principal;
    if (n % 12 === 0 || scheduleBalance === 0) {
      loanSchedule.push({ year: Math.ceil(n / 12), balance: rounded(scheduleBalance), interest: rounded(scheduleInterest), principal: rounded(schedulePrincipal) });
      scheduleInterest = 0; schedulePrincipal = 0;
    }
  }
  const milestoneOrder: Record<string, number> = { booking: 0, signing: 1, keys: 2, renovation: 3, 'first-repayment': 4 };
  milestones.sort((a, b) => monthIndex(a.month) - monthIndex(b.month) || milestoneOrder[a.id] - milestoneOrder[b.id]);
  return { stampDuty: duty, optionFee, signingPricePayment, monthlyPayment: rounded(pay), totalInterest: rounded(totalInterest), totalRepaid: rounded(totalRepaid), initialCash, initialCpf, lowestCash: rounded(minCash), minimumCashMonth, maxShortfall: rounded(maxShortfall), maxReserveGap: rounded(maxReserveGap), months, milestones, loanSchedule };
}

export function monthLabel(month: string): string {
  if (!monthPattern.test(month)) return month;
  return new Intl.DateTimeFormat('en-SG', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`));
}
