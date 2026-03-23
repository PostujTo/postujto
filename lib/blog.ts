import type React from 'react';

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: number; // minuty
  content: React.ComponentType;
};

export type BlogPostMeta = Omit<BlogPost, 'content'>;

// Dynamiczny import wszystkich postów z content/blog/
// Każdy plik eksportuje: export const meta: BlogPostMeta i export default Content
const postModules = {
  'jak-pisac-posty-na-instagramie-dla-fryzjera': () => import('@/content/blog/jak-pisac-posty-na-instagramie-dla-fryzjera'),
  'hashtagi-dla-restauracji-polska-2026': () => import('@/content/blog/hashtagi-dla-restauracji-polska-2026'),
  'jak-zdobyc-klientow-przez-facebook': () => import('@/content/blog/jak-zdobyc-klientow-przez-facebook'),
  'content-marketing-firmy-uslugowe': () => import('@/content/blog/content-marketing-firmy-uslugowe'),
  'pas-aida-hook-story-cta': () => import('@/content/blog/pas-aida-hook-story-cta'),
} as const;

export type BlogSlug = keyof typeof postModules;

export async function getAllPosts(): Promise<BlogPostMeta[]> {
  const posts: BlogPostMeta[] = [];
  for (const [slug, loader] of Object.entries(postModules)) {
    const mod = await loader();
    posts.push({ ...mod.meta, slug });
  }
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const loader = postModules[slug as BlogSlug];
  if (!loader) return null;
  const mod = await loader();
  return { ...mod.meta, slug, content: mod.default };
}

export function getAllSlugs(): string[] {
  return Object.keys(postModules);
}
