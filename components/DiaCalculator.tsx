'use client';

import { useState } from 'react';
import { calculateDia, DIA_DEFAULTS, DIA_LIMITS, validateDia, type DiaInputs } from '@/lib/dia';
import styles from './DiaCalculator.module.css';

const money = (value: number) => new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
const fields: Record<keyof DiaInputs, [string, string]> = {
  price: ['Flat price (S$)', 'Use the full purchase price before grants.'],
  income: ['Future household income (S$/month)', 'Gross monthly income assumed at deferred assessment; a salary forecast is not an assessed income.'],
  years: ['Loan tenure (years)', '1–25 whole years. Use a shorter tenure if age or lease limits apply.'],
  rate: ['Repayment interest (% p.a.)', '2.6% is an illustration, not a rate locked until key collection.'],
  cpfAtSigning: ['CPF available at signing (S$)', 'Usable ordinary-account savings allocated to the initial downpayment.'],
  cpfAtKeys: ['CPF available at keys (S$)', 'Usable savings remaining AFTER signing, excluding grants. No CPF growth is forecast.'],
  grant: ['Assumed grant at keys (S$)', 'Default S$0. Scenario only, not a grant estimate. Grants above 95% of price need a separate HDB payment plan.'],
  cashAtKeys: ['Cash available at keys (S$)', 'Cash set aside for the flat price, after initial payment and other costs.'],
};
const initialValues = () => Object.fromEntries(Object.entries(DIA_DEFAULTS).map(([key, value]) => [key, String(value)])) as Record<keyof DiaInputs, string>;
export default function DiaCalculator() {
  const [values, setValues] = useState(initialValues);
  const input = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim() === '' ? NaN : Number(value)])) as unknown as DiaInputs;
  const errors = validateDia(input);
  const valid = Object.keys(errors).length === 0;
  const result = valid ? calculateDia(input) : null;
  function field(key: keyof DiaInputs) {
    const [label, hint] = fields[key];
    return <label className={styles.field} htmlFor={`dia-${key}`} key={key}>{label}
      <input id={`dia-${key}`} type="number" inputMode="decimal" min={DIA_LIMITS[key][0]} max={DIA_LIMITS[key][1]} step={key === 'years' ? 1 : 'any'} value={values[key]} onChange={(event) => setValues({ ...values, [key]: event.target.value })} aria-invalid={Boolean(errors[key])} aria-describedby={`dia-${key}-hint${errors[key] ? ` dia-${key}-error` : ''}`} />
      <small id={`dia-${key}-hint`}>{hint}</small>{errors[key] && <small className={styles.error} id={`dia-${key}-error`}>{errors[key]}</small>}
    </label>;
  }
  return <div className={styles.layout}>
    <form className={styles.form} onSubmit={(event) => event.preventDefault()} aria-label="DIA payment assumptions">
      <fieldset><legend>1. Flat and future loan</legend><div className={styles.fields}>{(['price', 'income', 'years', 'rate'] as const).map(field)}</div></fieldset>
      <fieldset><legend>2. Money available</legend><div className={styles.fields}>{(['cpfAtSigning', 'cpfAtKeys', 'grant', 'cashAtKeys'] as const).map(field)}</div></fieldset>
      <button className={styles.reset} type="button" onClick={() => setValues(initialValues())}>Reset example</button>
    </form>
    <section className={styles.results} aria-labelledby="dia-results" aria-live="polite" aria-atomic="true">
      <h2 id="dia-results">Your payment picture</h2><p>Illustrative HDB-loan scenario · rounded to the nearest dollar</p>
      {!result ? <p className={styles.error}>Check the highlighted inputs to see your estimate.</p> : <>
        <div className={styles.step}><h3>At signing · 2.5% of flat price</h3><strong className={styles.amount}>{money(result.initial)}</strong><dl><div><dt>From your CPF</dt><dd>{money(result.initialCpf)}</dd></div><div><dt>Cash needed</dt><dd>{money(result.initialCash)}</dd></div></dl><p>Gross initial downpayment. Any option-fee credit or refund is not modelled; do not add the option fee twice.</p></div>
        <div className={styles.step}><h3>At keys · CPF and cash still needed</h3><strong className={styles.amount}>{money(result.keyFunding)}</strong><dl><div><dt>From your CPF savings</dt><dd>{money(result.keyCpf)}</dd></div><div><dt>Cash needed</dt><dd>{money(result.keyCashRequired)}</dd></div><div><dt>Separate assumed grant</dt><dd>{money(input.grant)}</dd></div><div><dt>Modelled housing loan</dt><dd>{money(result.loan)}</dd></div></dl>
          <p className={styles.notice}>{result.shortfall > 0 ? `${money(result.shortfall)} more cash needed beyond the amount you entered.` : `${money(result.cashLeft)} of your entered cash remains after the flat-price payment.`} Fees and other costs are additional.</p></div>
        <div className={styles.step}><h3>After keys · estimated monthly instalment</h3><strong className={styles.amount}>{money(result.monthly)}<span style={{ fontSize: 16, fontWeight: 400 }}> / month</span></strong><p>{input.years} years at {input.rate}% p.a., assumed unchanged.</p><dl><div><dt>Illustrative loan ceiling</dt><dd>{money(result.loanCap)}</dd></div><div><dt>30% of entered income</dt><dd>{money(result.monthlyLimit)} / month</dd></div></dl><p>Loan ceiling uses the lower of 75% of price and the loan supported by 30% of income at {result.assessmentRate}% assessment interest. Available CPF and the assumed grant may reduce the modelled loan.</p></div>
        <p><strong>This is not a loan offer or eligibility result.</strong> HDB may lend less after checking income, age, commitments, employment, lease and CPF usage. Higher future income does not guarantee a grant or HDB loan.</p>
      </>}
    </section>
  </div>;
}
