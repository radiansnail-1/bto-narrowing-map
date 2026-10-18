import { describe, expect, it } from 'vitest';
import { calculateRoadmap, monthLabel, ROADMAP_DEFAULTS, validateRoadmap } from '../lib/roadmap';

describe('funding roadmap', () => {
  it('does not let a grant and loan replace the mandatory bank cash payment at keys', () => {
    expect(validateRoadmap({ ...ROADMAP_DEFAULTS, lender: 'bank75', grant: 100000 })).toEqual({});
    expect(validateRoadmap({ ...ROADMAP_DEFAULTS, lender: 'bank75', grant: 112500 }).loan).toContain('bank cash');
    expect(validateRoadmap({ ...ROADMAP_DEFAULTS, lender: 'bank55', price: 200000, marketValue: 200000, loan: 110000, grant: 70000 })).toEqual({});
    expect(validateRoadmap({ ...ROADMAP_DEFAULTS, lender: 'bank55', price: 200000, marketValue: 200000, loan: 110000, grant: 80000 }).loan).toContain('bank cash');
  });

  it('bounds contribution growth lookback so every accepted projection stays finite', () => {
    const people = [{ ...ROADMAP_DEFAULTS.people[0], startsOn: '0000-01', annualGrowth: 100 }, ROADMAP_DEFAULTS.people[1]] as typeof ROADMAP_DEFAULTS.people;
    expect(validateRoadmap({ ...ROADMAP_DEFAULTS, people })['people.0.startsOn']).toBeDefined();
  });
  it('has a dated fictional example and projects through at least a year after keys', () => {
    const result = calculateRoadmap(ROADMAP_DEFAULTS);
    expect(ROADMAP_DEFAULTS.startMonth).toBe('2026-10');
    expect(result.months.at(-1)?.month).toBe('2031-11');
    expect(result.milestones.map((m) => m.id)).toEqual(['booking', 'signing', 'keys', 'first-repayment', 'renovation']);
    expect(result.loanSchedule[0]).toMatchObject({ year: 0, balance: 375000 });
    expect(result.loanSchedule.at(-1)?.year).toBe(25);
    expect(result.loanSchedule.at(-1)?.balance).toBe(0);
    expect(result.milestones.find((m) => m.id === 'first-repayment')?.month).toBe('2030-12');
    expect(result.months.find((m) => m.month === '2030-12')?.events).toContain('First loan repayment');
  });

  it('credits the option fee once and conserves the purchase price across stages', () => {
    const result = calculateRoadmap(ROADMAP_DEFAULTS);
    const booking = result.milestones.find((m) => m.id === 'booking')!;
    const signing = result.milestones.find((m) => m.id === 'signing')!;
    const keys = result.milestones.find((m) => m.id === 'keys')!;
    expect(result.optionFee).toBe(2000);
    expect(result.signingPricePayment).toBe(10500);
    expect(booking.pricePayment + signing.pricePayment + keys.pricePayment + keys.grant + keys.loan).toBeCloseTo(500000, 2);
    expect(booking.pricePayment + signing.pricePayment).toBe(12500);
    expect(signing.cash + signing.cpf).toBeCloseTo(signing.pricePayment + signing.fees, 2);
    expect(keys.cash + keys.cpf).toBeCloseTo(keys.pricePayment + keys.fees, 2);
    expect(signing.fees).toBe(result.stampDuty + ROADMAP_DEFAULTS.signingFees);
  });

  it('uses marginal stamp duty on the greater of price and market value', () => {
    const result = calculateRoadmap({ ...ROADMAP_DEFAULTS, marketValue: 600000 });
    expect(result.stampDuty).toBe(12600);
  });

  it('handles zero-interest amortization and caps the final loan balance at zero', () => {
    const result = calculateRoadmap({ ...ROADMAP_DEFAULTS, rate: 0, loan: 100000, years: 1, keysMonth: '2027-01', renovationMonth: '2027-01', signingMonth: '2026-11', bookingMonth: '2026-11', plan: 'dia' });
    expect(result.monthlyPayment).toBeCloseTo(100000 / 12, 2);
    expect(result.loanSchedule.at(-1)?.balance).toBe(0);
  });

  it('starts monthly contributions at each person’s selected month and applies growth yearly', () => {
    const people = [
      { ...ROADMAP_DEFAULTS.people[0], cash: 100000, cpf: 0, monthlyCash: 100, monthlyCpf: 0, startsOn: '2026-11', annualGrowth: 10 },
      { ...ROADMAP_DEFAULTS.people[1], cash: 0, cpf: 0, monthlyCash: 0, monthlyCpf: 0, startsOn: '2026-10', annualGrowth: 0 },
    ] as const;
    const result = calculateRoadmap({ ...ROADMAP_DEFAULTS, bookingMonth: '2026-11', signingMonth: '2026-11', keysMonth: '2027-01', renovationMonth: '2027-01', people: [...people] as unknown as typeof ROADMAP_DEFAULTS.people, loan: 0, plan: 'dia' });
    expect(result.months.find((m) => m.month === '2026-10')?.cash).toBe(100000);
    expect(result.months.find((m) => m.month === '2027-11')!.cash - result.months.find((m) => m.month === '2027-10')!.cash).toBe(110);
  });

  it('keeps cash-only renovation separate from CPF and surfaces low cash reserves', () => {
    const result = calculateRoadmap({ ...ROADMAP_DEFAULTS, repayment: 'cash-only', renovation: 25000, emergencyCash: 15000, people: ROADMAP_DEFAULTS.people.map((p) => ({ ...p, cash: 5000, cpf: 100000, monthlyCash: 0, monthlyCpf: 0 })) as typeof ROADMAP_DEFAULTS.people });
    const row = result.months.find((m) => m.month === ROADMAP_DEFAULTS.renovationMonth)!;
    expect(row.cashPayment).toBeGreaterThan(25000);
    expect(row.cpfPayment).toBe(0);
    expect(result.maxShortfall).toBeGreaterThan(0);
    expect(result.maxReserveGap).toBeGreaterThan(0);
  });

  it('captures a payment shortfall before month-end contributions recover the balance', () => {
    const people = ROADMAP_DEFAULTS.people.map((p) => ({ ...p, cash: 0, cpf: 0, monthlyCash: 5000, monthlyCpf: 0, startsOn: '2026-11' })) as typeof ROADMAP_DEFAULTS.people;
    const result = calculateRoadmap({ ...ROADMAP_DEFAULTS, people });
    const booking = result.months.find((m) => m.month === '2026-11')!;
    expect(booking.cash).toBeGreaterThan(0);
    expect(result.maxShortfall).toBeGreaterThanOrEqual(2000);
  });

  it('rejects a flat price whose signing instalment cannot cover the credited option fee', () => {
    const bad = { ...ROADMAP_DEFAULTS, flatType: '4-room-or-larger' as const, price: 79999 };
    expect(validateRoadmap(bad).price).toContain('option fee');
    expect(() => calculateRoadmap(bad)).toThrow(RangeError);
  });

  it('records an initial reserve gap even when no later event worsens it', () => {
    const people = ROADMAP_DEFAULTS.people.map((p) => ({ ...p, cash: 1000, cpf: 0, monthlyCash: 0, monthlyCpf: 0 })) as typeof ROADMAP_DEFAULTS.people;
    const result = calculateRoadmap({ ...ROADMAP_DEFAULTS, emergencyCash: 5000, people });
    expect(result.maxReserveGap).toBeGreaterThanOrEqual(3000);
  });

  it('keeps grants separate from household balances and applies a CPF reserve', () => {
    const input = { ...ROADMAP_DEFAULTS, grant: 50000, cpfReserve: 10000, loan: 325000 };
    const result = calculateRoadmap(input);
    const keys = result.milestones.find((m) => m.id === 'keys')!;
    expect(keys.grant).toBe(50000);
    expect(keys.cpfAfter).toBeGreaterThanOrEqual(0);
    expect(keys.grant).not.toBe(keys.cpfAfter);
  });

  it('models bank DIA signing as cash-only, then enforces the cumulative minimum cash at keys', () => {
    const people = ROADMAP_DEFAULTS.people.map((p) => ({ ...p, cash: 50000, cpf: 50000, monthlyCash: 0, monthlyCpf: 0 })) as typeof ROADMAP_DEFAULTS.people;
    const result = calculateRoadmap({ ...ROADMAP_DEFAULTS, lender: 'bank75', plan: 'dia', people });
    const signing = result.milestones.find((m) => m.id === 'signing')!;
    const keys = result.milestones.find((m) => m.id === 'keys')!;
    expect(signing.cpf).toBe(result.stampDuty);
    expect(signing.cash).toBeGreaterThanOrEqual(result.signingPricePayment);
    expect(signing.fees).toBe(result.stampDuty + ROADMAP_DEFAULTS.signingFees);
    expect(keys.cash).toBeGreaterThanOrEqual(12500);
  });

  it('rejects impossible loans, invalid dates and non-finite person inputs', () => {
    expect(validateRoadmap({ ...ROADMAP_DEFAULTS, loan: 400000 }).loan).toContain('cap');
    expect(validateRoadmap({ ...ROADMAP_DEFAULTS, keysMonth: '2027-02' }).keysMonth).toContain('signing');
    const badPerson = [{ ...ROADMAP_DEFAULTS.people[0], cash: NaN }, ROADMAP_DEFAULTS.people[1]] as typeof ROADMAP_DEFAULTS.people;
    expect(validateRoadmap({ ...ROADMAP_DEFAULTS, people: badPerson })['people.0.cash']).toBeDefined();
    expect(() => calculateRoadmap({ ...ROADMAP_DEFAULTS, loan: 400000 })).toThrow(RangeError);
  });

  it('formats months without shifting dates across time zones', () => {
    expect(monthLabel('2026-10')).toBe('Oct 2026');
  });
});
