'use client'

type Status = 'connected' | 'disconnected' | 'not_setup'

interface Props {
  status: Status
}

const CONFIG = {
  connected:    { dot: '#22c55e', label: 'Autopublikacja aktywna',  action: null },
  disconnected: { dot: '#ef4444', label: 'Połącz konto ponownie',   action: '/settings' },
  not_setup:    { dot: '#f59e0b', label: 'Włącz autopublikację',    action: '/settings' },
}

export function ZernioStatus({ status }: Props) {
  const config = CONFIG[status]

  const badge = (
    <div className="zernio-status-badge" style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-full)',
      padding: '5px 12px',
      fontSize: 13,
      color: 'var(--color-text-secondary)',
      cursor: config.action ? 'pointer' : 'default',
      textDecoration: 'none',
    }}>
      <span style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: config.dot,
        flexShrink: 0,
        boxShadow: status === 'connected' ? `0 0 6px ${config.dot}` : 'none',
      }} />
      {config.label}
    </div>
  )

  if (config.action) {
    return <a href={config.action} style={{ textDecoration: 'none' }}>{badge}</a>
  }
  return badge
}
