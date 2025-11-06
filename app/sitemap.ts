import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mpetserv.com';
  const routes = ['', '/services', '/contact'];
  const now = new Date().toISOString();
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: r === '' ? 1 : 0.7,
  }));
}
