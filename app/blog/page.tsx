import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — PostujTo | Social media marketing dla polskich firm',
  description: 'Praktyczne porady o social media marketingu dla polskich małych firm. Jak pisać posty na FB, IG i TikTok które przynoszą klientów.',
};

export default async function BlogPage() {
  const posts = await getAllPosts();

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

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 40, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Blog
          </h1>
          <p style={{ color: 'rgba(240,240,245,0.5)', fontSize: 17 }}>
            Praktyczne porady o social media marketingu dla polskich małych firm.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {posts.map(post => (
            <Link
              key={post.slug}
              href={'/blog/' + post.slug}
              style={{ textDecoration: 'none', display: 'block', padding: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, transition: 'border-color 0.2s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, color: '#a5b4fc', letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
                  {post.category}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(240,240,245,0.3)' }}>
                  {new Date(post.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })} · {post.readTime} min czytania
                </span>
              </div>
              <h2 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: 20, color: '#f0f0f5', marginBottom: 8, lineHeight: 1.4 }}>
                {post.title}
              </h2>
              <p style={{ color: 'rgba(240,240,245,0.5)', fontSize: 15, lineHeight: 1.6 }}>
                {post.excerpt}
              </p>
              <p style={{ marginTop: 16, fontSize: 13, color: '#a5b4fc', fontWeight: 600 }}>
                Czytaj dalej →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
