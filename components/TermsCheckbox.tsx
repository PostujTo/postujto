'use client';

import Link from 'next/link';

interface TermsCheckboxProps {
  accepted: boolean;
  onAccept: (v: boolean) => void;
}

export function TermsCheckbox({ accepted, onAccept }: TermsCheckboxProps) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${accepted ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, transition: 'border-color 0.2s' }}>
      <div style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2, background: accepted ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.06)', border: `1px solid ${accepted ? 'transparent' : 'rgba(255,255,255,0.2)'}`, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
        {accepted && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
      </div>
      <input type="checkbox" checked={accepted} onChange={e => onAccept(e.target.checked)} style={{ display: 'none' }} />
      <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.6)', lineHeight: 1.6 }}>
        Akceptuję{' '}
        <Link href="/terms" target="_blank" style={{ color: '#a5b4fc', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>Regulamin</Link>
        {' '}i{' '}
        <Link href="/privacy" target="_blank" style={{ color: '#a5b4fc', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>Politykę prywatności</Link>
        {' '}serwisu PostujTo. Wyrażam zgodę na przetwarzanie moich danych w celu świadczenia usługi.
      </p>
    </label>
  );
}