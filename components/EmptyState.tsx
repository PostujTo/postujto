'use client'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  ctaLabel: string
  ctaHref?: string
  ctaOnClick?: () => void
  secondaryLabel?: string
  secondaryHref?: string
}

export function EmptyState({
  icon, title, description,
  ctaLabel, ctaHref, ctaOnClick,
  secondaryLabel, secondaryHref,
}: EmptyStateProps) {
  return (
    <div className="empty-state" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 'var(--space-3xl) var(--space-xl)',
      minHeight: 280,
    }}>
      <div style={{ fontSize: 48, marginBottom: 'var(--space-md)', opacity: 0.8 }}>
        {icon}
      </div>
      <h3 style={{
        color: 'var(--color-text)',
        fontSize: 'var(--font-heading-s)',
        fontWeight: 700,
        margin: '0 0 8px 0',
        maxWidth: 320,
      }}>
        {title}
      </h3>
      <p style={{
        color: 'var(--color-text-muted)',
        fontSize: 'var(--font-small)',
        lineHeight: 1.6,
        margin: '0 0 var(--space-lg) 0',
        maxWidth: 280,
      }}>
        {description}
      </p>
      {ctaHref ? (
        <a href={ctaHref} className="empty-state-cta" style={{
          background: 'var(--gradient-primary)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 28px',
          fontSize: 15,
          fontWeight: 700,
          textDecoration: 'none',
          display: 'inline-block',
          transition: 'var(--transition-fast)',
        }}>
          {ctaLabel}
        </a>
      ) : (
        <button onClick={ctaOnClick} className="empty-state-cta" style={{
          background: 'var(--gradient-primary)',
          color: 'var(--color-text)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: '14px 28px',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'var(--transition-fast)',
        }}>
          {ctaLabel}
        </button>
      )}
      {secondaryLabel && secondaryHref && (
        <a href={secondaryHref} style={{
          color: 'var(--color-text-secondary)',
          fontSize: 13,
          textDecoration: 'underline',
          marginTop: 'var(--space-sm)',
          display: 'block',
        }}>
          {secondaryLabel}
        </a>
      )}
    </div>
  )
}
