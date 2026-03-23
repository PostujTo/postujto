import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost, getAllSlugs } from '@/lib/blog';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title + ' — PostujTo Blog',
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: '"DM Sans", sans-serif', color: '#f0f0f5' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 20, color: '#fff', textDecoration: 'none' }}>
          Postuj<span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>To</span>
        </Link>
        <Link href="/app" style={{ padding: '8px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
          Wypróbuj za darmo →
        </Link>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px' }}>
        {/* Back */}
        <Link href="/blog" style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
          ← Wróć do bloga
        </Link>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, color: '#a5b4fc', letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
            {post.category}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(240,240,245,0.3)' }}>
            {new Date(post.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })} · {post.readTime} min czytania
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 36, letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 24 }}>
          {post.title}
        </h1>

        <p style={{ fontSize: 17, color: 'rgba(240,240,245,0.6)', lineHeight: 1.7, marginBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 40 }}>
          {post.excerpt}
        </p>

        {/* Content */}
        <div style={{ fontSize: 16, lineHeight: 1.8, color: 'rgba(240,240,245,0.85)' }}>
          <post.content />
        </div>

        {/* CTA */}
        <div style={{ marginTop: 60, padding: 32, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, textAlign: 'center' as const }}>
          <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
            Gotowy żeby wdrożyć to w swojej firmie?
          </p>
          <p style={{ color: 'rgba(240,240,245,0.5)', fontSize: 15, marginBottom: 20 }}>
            PostujTo generuje profesjonalne posty w 30 sekund. Zacznij za darmo.
          </p>
          <Link href="/app" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            Wypróbuj za darmo →
          </Link>
        </div>
      </div>
    </div>
  );
}
