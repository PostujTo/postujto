'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Props {
  children: React.ReactNode
  requiredPlan: 'starter' | 'pro'
  currentPlan: string  // accepts 'free' | 'standard' | 'premium' from app
  featureName: string
}

// Normalizes both naming conventions used in the app
const PLAN_LEVEL: Record<string, number> = {
  free: 0, standard: 1, starter: 1, premium: 2, pro: 2,
}

export function ProGated({ children, requiredPlan, currentPlan, featureName }: Props) {
  const hasAccess = (PLAN_LEVEL[currentPlan] ?? 0) >= (PLAN_LEVEL[requiredPlan] ?? 99)
  if (hasAccess) return <>{children}</>

  const planLabel = requiredPlan === 'starter' ? 'Starter' : 'Pro'

  return (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ opacity: 0.45, pointerEvents: 'none', userSelect: 'none' }}>
              {children}
            </div>
            <span style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: requiredPlan === 'pro' ? 'var(--gradient-primary)' : 'var(--color-primary)',
              color: '#fff',
              fontSize: 9,
              fontWeight: 700,
              padding: '2px 5px',
              borderRadius: 'var(--radius-full)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {planLabel}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent style={{
          background: '#1a1a2e',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
          maxWidth: 200,
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: 13 }}>
            {featureName} dostępna w planie <strong>{planLabel}</strong>
          </p>
          <a
            href="/pricing"
            style={{ color: 'var(--color-primary)', fontSize: 12, display: 'block', marginTop: 4 }}
          >
            Zobacz plany →
          </a>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
