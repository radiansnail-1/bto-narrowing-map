import localFont from 'next/font/local';

/**
 * Hanken Grotesk (SIL Open Font License 1.1, see ./fonts/OFL.txt) — the only typeface in the
 * product, self-hosted through next/font so no font is fetched at runtime. The variable file
 * covers the 400/500/600/700 roles used across the shell, map labels and HUD.
 */
export const hankenGrotesk = localFont({
  src: [{ path: './fonts/HankenGrotesk-latin.woff2', weight: '400 700', style: 'normal' }],
  variable: '--font-hanken',
  display: 'swap',
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
  adjustFontFallback: 'Arial',
});
