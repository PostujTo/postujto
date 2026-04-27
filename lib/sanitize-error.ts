/**
 * Fix 2.3: Sanityzacja błędów zanim trafią do logów / Sentry.
 *
 * Cel: zapobiec wyciekowi credentials (API keys, tokeny, hasła) gdy raw error od
 * zewnętrznego API zawiera echo request headera lub body z sekretem.
 *
 * Stosować w `console.error(...)` w handlerach które wołają zewnętrzne integracje
 * (Shoper, Baselinker, Allegro, Stripe, Anthropic, Resend, Zernio).
 *
 * Niewykorzystywane do user-facing response — UI dostaje generic strings ('Blad serwera').
 */

const SENSITIVE_KEYS = [
  'api_key',
  'apikey',
  'api-key',
  'authorization',
  'bearer',
  'token',
  'password',
  'secret',
  'private_key',
  'access_token',
  'refresh_token',
  'client_secret',
  'webhook_secret',
];

// "api_key=ABC", "api_key: ABC", "api_key":"ABC", "Bearer ABC"
const SENSITIVE_REGEX = new RegExp(
  `(${SENSITIVE_KEYS.join('|')})\\s*[":=]\\s*["']?([A-Za-z0-9_\\-\\.+/=]{8,})["']?`,
  'gi'
);

// Basic auth header (base64 — często `admin:KEY` od Shopera)
const BASIC_AUTH_REGEX = /Basic\s+[A-Za-z0-9+/=]{20,}/gi;

// Bearer token w plain stringu (np. "Bearer xyz...")
const BEARER_REGEX = /Bearer\s+[A-Za-z0-9_\-\.+/=]{20,}/gi;

export function sanitizeError(error: unknown): string {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
    if (error.stack) message += '\n' + error.stack;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    try {
      message = JSON.stringify(error);
    } catch {
      message = String(error);
    }
  }

  message = message.replace(SENSITIVE_REGEX, '$1=[REDACTED]');
  message = message.replace(BASIC_AUTH_REGEX, 'Basic [REDACTED]');
  message = message.replace(BEARER_REGEX, 'Bearer [REDACTED]');

  return message;
}
