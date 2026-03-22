export function hasAnnualPlan(priceId: string | null | undefined): boolean {
  const annualIds = [
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_ANNUAL,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM_ANNUAL,
  ].filter(Boolean);
  return !!priceId && annualIds.includes(priceId);
}

export function canUseAudit(auditUsedAt: string | null | undefined): boolean {
  if (!auditUsedAt) return true;
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return new Date(auditUsedAt) < threeMonthsAgo;
}

export function nextAuditDate(auditUsedAt: string): Date {
  const next = new Date(auditUsedAt);
  next.setMonth(next.getMonth() + 3);
  return next;
}
