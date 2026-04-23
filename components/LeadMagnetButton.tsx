'use client'

import { useState, useEffect } from 'react'

interface Props {
  industryName: string
  industrySlug: string
}

export function LeadMagnetButton({ industryName, industrySlug }: Props) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    // Email collection — just close and direct to download for now
    setSent(true)
    setTimeout(() => {
      window.location.href = '/api/lead-magnet?slug=' + industrySlug
    }, 800)
  }

  const downloadUrl = '/api/lead-magnet?slug=' + industrySlug

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 200,
    display: 'flex',
    alignItems: isMobile ? 'flex-end' : 'center',
    justifyContent: 'center',
  }

  const modalStyle: React.CSSProperties = isMobile ? {
    background: '#1a1a2e',
    borderRadius: '16px 16px 0 0',
    padding: '24px 20px 40px',
    width: '100%',
    maxHeight: '85vh',
    overflowY: 'auto',
  } : {
    background: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 32,
    width: '100%',
    maxWidth: 480,
    margin: '0 16px',
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'transparent',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 32px',
          fontWeight: 600,
          fontSize: 15,
          cursor: 'pointer',
          transition: 'var(--transition-fast)',
          marginTop: 8,
          display: 'block',
          width: '100%',
          maxWidth: 320,
          textAlign: 'center',
          fontFamily: 'inherit',
        }}
      >
        Pobierz 30 tematów dla {industryName} — za darmo
      </button>

      {open && (
        <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div style={modalStyle}>
            {/* Handle (mobile) */}
            {isMobile && (
              <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <h2 style={{ color: 'var(--color-text)', fontSize: 22, fontWeight: 700, margin: 0, maxWidth: 340, lineHeight: 1.3 }}>
                30 gotowych tematów dla branży {industryName}
              </h2>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-disabled)', cursor: 'pointer', fontSize: 24, padding: '0 0 0 12px', lineHeight: 1, flexShrink: 0 }}
                aria-label="Zamknij"
              >
                ×
              </button>
            </div>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              Wpisz email — wyślemy PDF od razu. Lub pobierz bez emaila.
            </p>

            {sent ? (
              <p style={{ color: 'var(--color-success)', fontSize: 15, fontWeight: 600, textAlign: 'center', padding: '16px 0' }}>
                ✓ Przekierowuję do pobrania…
              </p>
            ) : (
              <form onSubmit={handleSendEmail}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="twoj@email.pl"
                  style={{
                    width: '100%',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                    color: 'var(--color-text)',
                    fontSize: 15,
                    marginBottom: 12,
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'var(--gradient-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 28px',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                    fontFamily: 'inherit',
                    marginBottom: 12,
                  }}
                >
                  Wyślij mi PDF
                </button>
              </form>
            )}

            <a
              href={downloadUrl}
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 14,
                textDecoration: 'underline',
                display: 'block',
                textAlign: 'center',
              }}
            >
              Pobierz bez emaila →
            </a>
          </div>
        </div>
      )}
    </>
  )
}
