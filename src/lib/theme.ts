import type { Theme } from './types';

const family = (f: string) => `'${f.replace(/'/g, '')}'`;

export function themeCss(t: Theme) {
  const { colors: c, fonts: f, typography: ty, ui } = t;
  const step = (n: number) => `${(ty.baseSize * Math.pow(ty.scale, n)).toFixed(2)}px`;
  return `:root{
--bg:${c.bg};--surface:${c.surface};--ink:${c.ink};--muted:${c.muted};--line:${c.line};
--accent:${c.accent};--accent-2:${c.accent2};--inverse-bg:${c.inverseBg};--inverse-ink:${c.inverseInk};
--font-display:${family(f.display)},'Times New Roman',serif;--font-body:${family(f.body)},system-ui,sans-serif;--font-mono:${family(f.mono)},ui-monospace,monospace;
--base:${ty.baseSize}px;--scale:${ty.scale};--w-display:${ty.displayWeight};--w-body:${ty.bodyWeight};
--ls-display:${ty.letterSpacingDisplay}em;--em-style:${f.displayItalic ? 'italic' : 'normal'};--lh-body:${ty.lineHeightBody};--label-case:${ty.uppercaseLabels ? 'uppercase' : 'none'};
--t-1:${step(1)};--t-2:${step(2)};--t-3:${step(3)};--t-4:${step(4)};--t-5:${step(5)};
--radius:${ui.radius}px;--btn-radius:${ui.buttonStyle === 'pill' ? '999px' : ui.buttonStyle === 'square' ? `${ui.radius}px` : '0'};
}`;
}

/** One stylesheet per family so a typo or unsupported weight never breaks the other fonts. */
export function googleFontsUrls(t: Theme) {
  const w = t.typography.displayWeight || 400;
  const fam = (name: string) => encodeURIComponent(name.trim()).replace(/%20/g, '+');
  const url = (name: string, spec: string) => `https://fonts.googleapis.com/css2?family=${fam(name)}${spec ? `:${spec}` : ''}&display=swap`;
  const list = [
    url(t.fonts.display, t.fonts.displayItalic ? `ital,wght@0,${w};1,${w}` : `wght@${w}`),
    url(t.fonts.body, 'wght@300;400;500;600'),
    url(t.fonts.mono, 'wght@400;500'),
  ];
  return [...new Set(list.filter((_, i) => [t.fonts.display, t.fonts.body, t.fonts.mono][i]))];
}
