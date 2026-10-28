'use client';
import { useCallback, useEffect, useState } from 'react';
import { useTopbar } from '@/components/admin/Shell';
import FieldRenderer from '@/components/admin/FieldRenderer';
import { api } from '@/components/admin/api';
import { useToast } from '@/components/admin/Toasts';
import { SETTINGS_FIELDS } from '@/lib/schemas';
import type { Settings } from '@/lib/types';

export default function SettingsEditor() {
  const [s, setS] = useState<Settings | null>(null);
  const [dirty, setDirty] = useState(false);
  const toast = useToast();
  useEffect(() => {
    api<Settings>('/api/admin/singleton/settings').then(setS);
  }, []);
  const save = useCallback(async () => {
    await api('/api/admin/singleton/settings', { method: 'PUT', json: s });
    setDirty(false);
    toast('Settings saved');
  }, [s, toast]);
  useTopbar(
    <>
      <h2>Settings & navigation</h2>
      {dirty && <span className="a-pill warn">Unsaved</span>}
      <div className="actions">
        <button className="a-btn primary" onClick={save} disabled={!dirty}>
          Save settings
        </button>
      </div>
    </>,
    [dirty, save],
  );
  if (!s) return <p className="muted">Loading…</p>;
  return (
    <div className="a-card a-card-pad" style={{ maxWidth: 900 }}>
      <FieldRenderer
        fields={SETTINGS_FIELDS}
        value={s}
        onChange={(v) => {
          setS(v as Settings);
          setDirty(true);
        }}
      />
    </div>
  );
}
