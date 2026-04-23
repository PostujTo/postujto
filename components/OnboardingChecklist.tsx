'use client'

import { useState, useEffect } from 'react'

const STEPS = [
  {
    id: 'brand_kit',
    number: 1,
    title: 'Opisz swoją firmę',
    description: 'Podaj nazwę, branżę i ton komunikacji — raz, na zawsze.',
    cta: 'Uzupełnij Profil Marki →',
    href: '/settings',
  },
  {
    id: 'platform',
    number: 2,
    title: 'Wybierz platformę',
    description: 'Facebook, Instagram lub TikTok.',
    cta: 'Wybierz platformę →',
    href: '/app',
  },
  {
    id: 'first_post',
    number: 3,
    title: 'Wygeneruj pierwszy post',
    description: 'PostujTo napisze go za Ciebie w 30 sekund.',
    cta: 'Wygeneruj teraz →',
    href: '/app',
  },
]

interface Props {
  brandKitCompletion: number
  hasGenerations: boolean
  hasPlatformSelected: boolean
}

export function OnboardingChecklist({ brandKitCompletion, hasGenerations, hasPlatformSelected }: Props) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(localStorage.getItem('onboarding_dismissed') === 'true')
  }, [])

  const step1Done = brandKitCompletion >= 30
  const step2Done = hasPlatformSelected
  const step3Done = hasGenerations
  const allDone = step1Done && step2Done && step3Done

  if (dismissed || allDone) return null

  const completedCount = [step1Done, step2Done, step3Done].filter(Boolean).length
  const progressPercent = (completedCount / 3) * 100

  const handleDismiss = () => {
    localStorage.setItem('onboarding_dismissed', 'true')
    setDismissed(true)
  }

  return (
    <div className="onboarding-checklist" style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-primary-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 24,
      marginBottom: 'var(--space-xl)',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h3 style={{ color: 'var(--color-text)', fontSize: 16, fontWeight: 700, margin: 0 }}>
            Zacznij w 3 krokach
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 4, marginBottom: 0 }}>
            {completedCount} z 3 ukończone
          </p>
        </div>
        <button
          onClick={handleDismiss}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-disabled)', cursor: 'pointer', fontSize: 20, padding: 4, lineHeight: 1 }}
          aria-label="Zamknij"
        >
          ×
        </button>
      </div>

      <div style={{ background: 'var(--color-border)', borderRadius: 'var(--radius-full)', height: 4, marginBottom: 20 }}>
        <div style={{
          background: 'var(--gradient-primary)',
          borderRadius: 'var(--radius-full)',
          height: '100%',
          width: progressPercent + '%',
          transition: 'var(--transition-normal)',
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {STEPS.map((step, i) => {
          const isDone = [step1Done, step2Done, step3Done][i]
          const prevsDone = [step1Done, step2Done, false].slice(0, i).every(Boolean)
          const isActive = !isDone && prevsDone

          return (
            <div key={step.id} className="onboarding-step" style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              padding: '12px 16px',
              background: isActive ? 'var(--color-primary-light)' : 'transparent',
              border: '1px solid ' + (isActive ? 'var(--color-primary-border)' : 'transparent'),
              borderRadius: 'var(--radius-md)',
              opacity: isDone ? 0.6 : 1,
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-full)',
                background: isDone ? 'var(--color-success-light)' : isActive ? 'var(--gradient-primary)' : 'var(--color-surface-active)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--color-text)',
              }}>
                {isDone ? '✓' : step.number}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--color-text)', fontSize: 14, fontWeight: 600 }}>{step.title}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 12, marginTop: 2 }}>{step.description}</div>
              </div>

              {isActive && (
                <a href={step.href} className="onboarding-step-cta" style={{
                  background: 'var(--gradient-primary)',
                  color: 'var(--color-text)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {step.cta}
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
