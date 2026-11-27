// /rss.xml — RSS feed of all blog posts, for feed readers and aggregators.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getExcerpt } from '../lib/postExcerpt';

const SITE = 'https://jekaterinagrinberga.com';

const escape = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const GET: APIRoute = async () => {
  const posts = (await getCollection('posts')).sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  const items = posts
    .map((post) => {
      const url = `${SITE}/${post.id}/`;
      const summary = post.data.description ?? getExcerpt(post.body ?? '', post.data.excerpt);
      return `    <item>
      <title>${escape(post.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.data.date).toUTCString()}</pubDate>
      <dc:creator>Jekaterina Grinberga</dc:creator>
      <description>${escape(summary)}</description>
    </item>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Sustainability Strategy &amp; ESG Blog – Jekaterina Grinberga</title>
    <link>${SITE}/blog/</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Practical articles on sustainability strategy, ESG, supply chain transparency, climate risk and EU regulation.</description>
    <language>en</language>
    <lastBuildDate>${new Date(posts[0]?.data.updated ?? posts[0]?.data.date ?? Date.now()).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
