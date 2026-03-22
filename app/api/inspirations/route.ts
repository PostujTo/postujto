import { NextRequest, NextResponse } from 'next/server';
import { INDUSTRY_TOPICS } from '@/lib/industries';
import { LP_SLUG_BY_INDUSTRY_ID } from '@/lib/prompts';

// Zwraca 5 tematów inspiracji dla branży użytkownika.
// Najpierw próbuje z lib/industries.ts (statyczne, zawsze działa).
// Jeśli tabela Supabase industry_inspirations zostanie zaseedowana,
// można tu dodać fallback do Supabase dla dynamicznych aktualizacji.

export async function GET(req: NextRequest) {
  const industryId = req.nextUrl.searchParams.get('industry');
  if (!industryId) return NextResponse.json([]);

  // Mapuj INDUSTRIES.id → LP slug
  const lpSlug = LP_SLUG_BY_INDUSTRY_ID[industryId] ?? industryId;
  const topics = INDUSTRY_TOPICS[lpSlug] ?? [];

  return NextResponse.json(topics);
}
