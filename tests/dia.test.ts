import { describe, expect, it } from 'vitest';
import { calculateDia, DIA_DEFAULTS, monthlyPayment, validateDia } from '../lib/dia';

describe('DIA illustrative payment model', () => {
  it('matches an independently calculated mortgage fixture', () => {
    // Standard amortisation example: 100k at 6% over 30 years = 599.550525 monthly.
    expect(monthlyPayment(100000, 6, 30)).toBeCloseTo(599.550525, 5);
    expect(monthlyPayment(12000, 0, 1)).toBe(1000);
  });
  it('keeps the initial, CPF, cash and loan allocation balanced', () => {
    const result = calculateDia(DIA_DEFAULTS);
    expect(result.initial).toBe(12500);
    expect(result.loan).toBe(375000);
    expect(result.keyFunding).toBe(112500);
    expect(result.keyCashRequired).toBe(52500);
    expect(result.shortfall).toBe(22500);
    expect(result.initial + result.keyCpf + result.keyCashRequired + result.loan).toBe(500000);
  });
  it('uses the assessment floor even for zero repayment interest', () => {
    const result = calculateDia({ ...DIA_DEFAULTS, income: 1000, years: 1, rate: 0 });
    expect(result.assessmentRate).toBe(3);
    // Sum of 12 discounted payments of $300 at 0.25% per month.
    const discountedPayments = Array.from({ length: 12 }, (_, index) => 300 / (1.0025 ** (index + 1))).reduce((sum, payment) => sum + payment, 0);
    expect(result.incomeLoan).toBeCloseTo(discountedPayments, 8);
  });
  it('uses a higher entered rate for assessment and income binds below LTV', () => {
    const result = calculateDia({ ...DIA_DEFAULTS, income: 1000, rate: 6 });
    expect(result.assessmentRate).toBe(6);
    expect(result.loan).toBeLessThan(375000);
    expect(result.monthly).toBeCloseTo(300, 8);
  });
  it('never borrows beyond the balance and does not count grants twice', () => {
    const result = calculateDia({ ...DIA_DEFAULTS, cpfAtSigning: 20000, cpfAtKeys: 600000, grant: 50000 });
    expect(result.initialCpf).toBe(12500);
    expect(result.initialCash).toBe(0);
    expect(result.loan).toBe(0);
    expect(result.keyCpf).toBe(437500);
    expect(result.keyCashRequired).toBe(0);
    expect(result.initial + result.keyCpf + 50000).toBe(500000);
  });
  it('supports no-income and no-grant stress scenarios', () => {
    const result = calculateDia({ ...DIA_DEFAULTS, income: 0, cpfAtKeys: 0, grant: 0 });
    expect(result.loan).toBe(0);
    expect(result.keyCashRequired).toBe(487500);
    expect(result.monthly).toBe(0);
  });
  it.each([NaN, Infinity, -1])('rejects invalid monetary input %s', (price) => {
    expect(validateDia({ ...DIA_DEFAULTS, price }).price).toBeDefined();
    expect(() => calculateDia({ ...DIA_DEFAULTS, price })).toThrow(RangeError);
  });
  it('rejects excess-grant scenarios above the supported 95% boundary', () => {
    const scenario = { ...DIA_DEFAULTS, price: 100000, grant: 95000, cpfAtSigning: 0, cpfAtKeys: 0 };
    expect(validateDia(scenario)).toEqual({});
    expect(validateDia({ ...scenario, grant: 95000.01 }).grant).toContain('95%');
    expect(() => calculateDia({ ...scenario, grant: 97500 })).toThrow(RangeError);
  });
  it('validates tenure, grant and range boundaries', () => {
    expect(validateDia({ ...DIA_DEFAULTS, years: 25 })).toEqual({});
    expect(validateDia({ ...DIA_DEFAULTS, years: 25.5 }).years).toBeDefined();
    expect(validateDia({ ...DIA_DEFAULTS, years: 0 }).years).toBeDefined();
    expect(validateDia({ ...DIA_DEFAULTS, price: 10000, grant: 10000 }).grant).toBeDefined();
    expect(validateDia({ ...DIA_DEFAULTS, rate: 16 }).rate).toBeDefined();
  });
});
