'use client'

import { useState, useEffect } from 'react'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { notify } from '@/lib/toast'

const PLATFORMS = [
  { id: 'facebook',  label: 'Facebook',  color: 'var(--color-facebook)' },
  { id: 'instagram', label: 'Instagram', color: 'var(--color-instagram)' },
  { id: 'tiktok',    label: 'TikTok',    color: 'var(--color-tiktok)' },
]

const BTN_STYLE = {
  background: 'var(--color-surface-active)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: 9,
  padding: '7px 14px',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
}

interface Props {
  postContent: string
  platform: string
  zernioConnected: boolean
}

export function PublishButton({ postContent, platform, zernioConnected }: Props) {
  const [publishing, setPublishing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handlePublish = async (targetPlatform: string) => {
    setPublishing(true)
    setSheetOpen(false)
    try {
      const res = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postContent, platform: targetPlatform }),
      })
      if (res.ok) {
        notify.success(`Opublikowano na ${targetPlatform}`)
      } else {
        notify.error('Publikacja nieudana — sprawdź połączenie Zernio')
      }
    } finally {
      setPublishing(false)
    }
  }

  if (!zernioConnected) {
    return (
      <a
        href="/settings#social"
        style={{
          ...BTN_STYLE,
          color: 'rgba(240,240,245,0.5)',
          background: 'transparent',
          textDecoration: 'none',
        }}
      >
        🔗 Połącz SM
      </a>
    )
  }

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setSheetOpen(true)}
          disabled={publishing}
          className="btn-ghost"
          style={{ padding: '7px 14px', borderRadius: 9, fontSize: 13, opacity: publishing ? 0.6 : 1 }}
        >
          {publishing ? '⏳' : '🚀 Opublikuj'}
        </button>

        {sheetOpen && (
          <>
            <div
              onClick={() => setSheetOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}
            />
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: '#1a1a2e',
              borderRadius: '16px 16px 0 0',
              padding: '20px 20px calc(20px + env(safe-area-inset-bottom))',
              zIndex: 101,
            }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 12 }}>
                Wybierz platformę:
              </p>
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePublish(p.id)}
                  style={{
                    width: '100%',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    color: 'var(--color-text)',
                    fontSize: 15,
                    fontWeight: 500,
                    marginBottom: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
                  {p.label}
                </button>
              ))}
            </div>
          </>
        )}
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={publishing}
        className="btn-ghost"
        style={{ padding: '7px 14px', borderRadius: 9, fontSize: 13, opacity: publishing ? 0.6 : 1 }}
      >
        {publishing ? '⏳' : '🚀 Opublikuj'}
      </DropdownMenuTrigger>
      <DropdownMenuContent style={{
        background: '#1a1a2e',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '4px',
      }}>
        {PLATFORMS.map(p => (
          <DropdownMenuItem
            key={p.id}
            onClick={() => handlePublish(p.id)}
            style={{
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
            {p.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
