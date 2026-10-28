'use client';
import { useCallback, useEffect, useState } from 'react';
import { useTopbar } from '@/components/admin/Shell';
import FieldRenderer from '@/components/admin/FieldRenderer';
import { api } from '@/components/admin/api';
import { useToast } from '@/components/admin/Toasts';
import { THEME_FIELDS } from '@/lib/schemas';
import { googleFontsUrls, themeCss } from '@/lib/theme';
import type { Theme } from '@/lib/types';

const PRESETS: { name: string; theme: Partial<Theme> }[] = [
  { name: 'Modern Forest (default)', theme: { colors: { bg: '#f3f3f0', surface: '#ffffff', ink: '#0e1012', muted: '#6a6f74', line: '#dcdedb', accent: '#23564a', accent2: '#0e1012', inverseBg: '#0e1012', inverseInk: '#f3f3f0' }, fonts: { display: 'Plus Jakarta Sans', body: 'Inter', mono: 'Inter', displayItalic: false } } },
  { name: 'Nordic Blue', theme: { colors: { bg: '#f2f4f7', surface: '#ffffff', ink: '#0b1220', muted: '#5f6b7a', line: '#d8dee6', accent: '#2f5bea', accent2: '#0b1220', inverseBg: '#0b1220', inverseInk: '#f2f4f7' }, fonts: { display: 'Manrope', body: 'Inter', mono: 'Inter', displayItalic: false } } },
  { name: 'Graphite & Lime', theme: { colors: { bg: '#121314', surface: '#1b1c1e', ink: '#f1f2ee', muted: '#9a9d98', line: '#2c2e30', accent: '#c6f24e', accent2: '#2c2e30', inverseBg: '#f1f2ee', inverseInk: '#121314' }, fonts: { display: 'Sora', body: 'Inter', mono: 'Inter', displayItalic: false } } },
  { name: 'Limestone & Clay (serif)', theme: { colors: { bg: '#e9e4da', surface: '#f3efe8', ink: '#16140f', muted: '#6b655a', line: '#cbc3b4', accent: '#b4532a', accent2: '#2f3b2c', inverseBg: '#14130f', inverseInk: '#ece6da' }, fonts: { display: 'Instrument Serif', body: 'Bricolage Grotesque', mono: 'JetBrains Mono', displayItalic: true } } },
  { name: 'Midnight Brass', theme: { colors: { bg: '#121212', surface: '#1b1a18', ink: '#efe8da', muted: '#9a9286', line: '#34312c', accent: '#c9a45c', accent2: '#5b6b5d', inverseBg: '#efe8da', inverseInk: '#121212' }, fonts: { display: 'Bodoni Moda', body: 'Manrope', mono: 'DM Mono', displayItalic: true } } },
  { name: 'Olive Grove', theme: { colors: { bg: '#e6e4d6', surface: '#efeee4', ink: '#1d211a', muted: '#5f6556', line: '#c4c3b0', accent: '#4a5a32', accent2: '#c08a3e', inverseBg: '#1d211a', inverseInk: '#e6e4d6' }, fonts: { display: 'Fraunces', body: 'Hanken Grotesk', mono: 'IBM Plex Mono', displayItalic: true } } },
  { name: 'Gallery White', theme: { colors: { bg: '#f7f7f5', surface: '#ffffff', ink: '#0d0d0d', muted: '#707070', line: '#dedede', accent: '#2b45ff', accent2: '#ff5a1f', inverseBg: '#0d0d0d', inverseInk: '#f7f7f5' }, fonts: { display: 'Syne', body: 'Inter Tight', mono: 'Space Mono', displayItalic: false } } },
  { name: 'Rose Terrazzo', theme: { colors: { bg: '#f1e4dc', surface: '#f8efe9', ink: '#2a1a17', muted: '#80655c', line: '#dcc5b9', accent: '#a23b48', accent2: '#3d5a5b', inverseBg: '#2a1a17', inverseInk: '#f1e4dc' }, fonts: { display: 'Gloock', body: 'Outfit', mono: 'Fragment Mono', displayItalic: false } } },
];

export default function ThemeEditor() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [dirty, setDirty] = useState(false);
  const toast = useToast();
  useEffect(() => {
    api<Theme>('/api/admin/singleton/theme').then(setTheme);
  }, []);
  const save = useCallback(async () => {
    await api('/api/admin/singleton/theme', { method: 'PUT', json: theme });
    setDirty(false);
    toast('Theme saved — the whole site has been restyled');
  }, [theme, toast]);
  useTopbar(
    <>
      <h2>Theme & typography</h2>
      {dirty && <span className="a-pill warn">Unsaved</span>}
      <div className="actions">
        <button className="a-btn primary" onClick={save} disabled={!dirty}>
          Save theme
        </button>
      </div>
    </>,
    [dirty, save],
  );
  if (!theme) return <p className="muted">Loading…</p>;
  const set = (t: Theme) => {
    setTheme(t);
    setDirty(true);
  };
  // scope the generated variables to the preview card only
  const css = themeCss(theme).replace(':root', '.theme-pv');
  return (
    <div className="ed" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <div className="a-grid">
        <div className="a-card a-card-pad a-grid">
          <h3>Presets</h3>
          <div className="a-row" style={{ flexWrap: 'wrap' }}>
            {PRESETS.map((p) => (
              <button key={p.name} className="a-btn sm" onClick={() => set({ ...theme, ...p.theme, colors: { ...theme.colors, ...p.theme.colors! }, fonts: { ...theme.fonts, ...p.theme.fonts! } } as Theme)}>
                <span style={{ display: 'flex' }}>
                  {[p.theme.colors!.bg, p.theme.colors!.ink, p.theme.colors!.accent].map((c) => (
                    <i key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c, marginLeft: -3, boxShadow: '0 0 0 1px #0002' }} />
                  ))}
                </span>
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div className="a-card a-card-pad">
          <FieldRenderer fields={THEME_FIELDS} value={theme} onChange={(v) => set(v as Theme)} />
        </div>
      </div>
      <div className="ed-side">
        {googleFontsUrls(theme).map((h) => (
          <link key={h} rel="stylesheet" href={h} />
        ))}
        <style>{css}</style>
        <div className="theme-pv a-card" style={{ overflow: 'hidden', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: 'var(--base)', lineHeight: 'var(--lh-body)', borderRadius: 14 }}>
          <div style={{ padding: 28, display: 'grid', gap: 16 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'var(--label-case)' as any, color: 'var(--muted)' }}>N° 01 — Live preview</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--w-display)' as any, letterSpacing: 'var(--ls-display)', fontSize: 64, lineHeight: 0.92, margin: 0 }}>
              Furniture that <em style={{ color: 'var(--accent)' }}>holds</em> the light.
            </h1>
            <p style={{ margin: 0, color: 'var(--muted)', maxWidth: '34ch' }}>Sculptural pieces, made by hand. Spin them in 3D, place them in your room with AR.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ background: theme.ui.buttonStyle === 'underline' ? 'none' : 'var(--ink)', color: theme.ui.buttonStyle === 'underline' ? 'var(--ink)' : 'var(--bg)', borderRadius: 'var(--btn-radius)', padding: theme.ui.buttonStyle === 'underline' ? '0 0 4px' : '14px 22px', borderBottom: theme.ui.buttonStyle === 'underline' ? '1px solid' : 0, fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'var(--label-case)' as any }}>Explore →</span>
              <span style={{ boxShadow: 'inset 0 0 0 1px var(--ink)', borderRadius: 'var(--btn-radius)', padding: '14px 22px', fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'var(--label-case)' as any }}>VR showroom</span>
            </div>
          </div>
          <div style={{ background: 'var(--surface)', padding: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, borderTop: '1px solid var(--line)' }}>
            {['Lune Chair', 'Arc Sofa'].map((n, i) => (
              <div key={n} style={{ display: 'grid', gap: 8 }}>
                <div style={{ aspectRatio: '4/5', borderRadius: 'var(--radius)', background: i ? 'var(--accent-2)' : 'var(--accent)', opacity: 0.85 }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{n}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--inverse-bg)', color: 'var(--inverse-ink)', padding: 28 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 40, lineHeight: 1 }}>
              Dark <em style={{ color: 'var(--accent)' }}>sections</em> look like this.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
