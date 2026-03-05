const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true; // dozwolone
  }

  if (record.count >= maxRequests) {
    return false; // zablokowane
  }

  record.count++;
  return true; // dozwolone
}