'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '88px 16px 40px',
        background: '#0a0a0f',
      }}
    >
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          }}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: '#6366f1',
              colorBackground: '#16162a',
              colorText: '#f0f0f5',
              colorTextSecondary: 'rgba(240,240,245,0.65)',
              colorInputBackground: 'rgba(255,255,255,0.04)',
              colorInputText: '#f0f0f5',
              colorDanger: '#f87171',
              borderRadius: '12px',
              fontFamily: 'var(--font-dm-sans), sans-serif',
            },
            elements: {
              card: {
                background: '#16162a',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              },
              headerTitle: { fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700 },
              formButtonPrimary: {
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                fontWeight: 600,
              },
              footerActionLink: { color: '#a5b4fc' },
            },
          }}
        />
      </div>
    </div>
  );
}
