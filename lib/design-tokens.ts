// lib/design-tokens.ts
// Źródło prawdy dla całego design systemu PostujTo
// shadcn/ui (desktop) + Material Design 3 (mobile)

export const tokens = {

  colors: {
    // Brand
    primary:        '#6366f1',
    primaryHover:   '#5558e3',
    primaryLight:   'rgba(99, 102, 241, 0.1)',
    primaryBorder:  'rgba(99, 102, 241, 0.3)',
    secondary:      '#a855f7',

    // Gradient (używany na CTA, H1 highlight, badges)
    gradientPrimary: 'linear-gradient(135deg, #6366f1, #a855f7)',

    // Tło
    background:     '#0a0a0f',
    surface:        'rgba(255, 255, 255, 0.03)',
    surfaceHover:   'rgba(255, 255, 255, 0.06)',
    surfaceActive:  'rgba(255, 255, 255, 0.08)',

    // Obramowania
    border:         'rgba(255, 255, 255, 0.08)',
    borderHover:    'rgba(255, 255, 255, 0.15)',
    borderFocus:    'rgba(99, 102, 241, 0.5)',

    // Tekst
    text:           '#f0f0f5',
    textSecondary:  'rgba(240, 240, 245, 0.7)',
    textMuted:      'rgba(240, 240, 245, 0.5)',
    textDisabled:   'rgba(240, 240, 245, 0.3)',

    // Statusy
    success:        '#22c55e',
    successLight:   'rgba(34, 197, 94, 0.1)',
    error:          '#ef4444',
    errorLight:     'rgba(239, 68, 68, 0.1)',
    warning:        '#f59e0b',
    warningLight:   'rgba(245, 158, 11, 0.1)',
    info:           '#3b82f6',
    infoLight:      'rgba(59, 130, 246, 0.1)',

    // Platformy social media
    facebook:       '#1877F2',
    instagram:      '#E1306C',
    tiktok:         '#69C9D0',
  },

  spacing: {
    xs:   4,
    sm:   8,
    md:   16,
    lg:   24,
    xl:   32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 96,
  },

  radius: {
    sm:   8,
    md:   12,
    lg:   16,
    xl:   24,
    '2xl': 32,
    full: 9999,
  },

  shadow: {
    subtle:   '0 1px 4px rgba(0, 0, 0, 0.2)',
    card:     '0 4px 24px rgba(0, 0, 0, 0.3)',
    elevated: '0 8px 40px rgba(0, 0, 0, 0.4)',
    glow:     '0 0 24px rgba(99, 102, 241, 0.3)',
  },

  typography: {
    // Font family
    fontPrimary:   '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',

    // Sizes (desktop)
    headingXL: { size: '52px', weight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' },
    headingL:  { size: '36px', weight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' },
    headingM:  { size: '24px', weight: 700, lineHeight: 1.3 },
    headingS:  { size: '18px', weight: 600, lineHeight: 1.4 },
    body:      { size: '16px', weight: 400, lineHeight: 1.6 },
    bodySmall: { size: '14px', weight: 400, lineHeight: 1.5 },
    caption:   { size: '12px', weight: 400, lineHeight: 1.4 },
    label:     { size: '13px', weight: 600, lineHeight: 1.4 },

    // Sizes (mobile) — M3 zgodne
    headingXLMobile: { size: '34px', weight: 800, lineHeight: 1.15 },
    headingLMobile:  { size: '24px', weight: 700, lineHeight: 1.2 },
    headingMMobile:  { size: '18px', weight: 700, lineHeight: 1.3 },
  },

  transition: {
    fast:   'all 0.15s ease',
    normal: 'all 0.25s ease',
    slow:   'all 0.35s ease',
  },

  zIndex: {
    base:     0,
    raised:   10,
    dropdown: 100,
    modal:    200,
    toast:    300,
    tooltip:  400,
  },

} as const;

// Typy pomocnicze
export type ColorToken = keyof typeof tokens.colors;
export type SpacingToken = keyof typeof tokens.spacing;
export type RadiusToken = keyof typeof tokens.radius;
