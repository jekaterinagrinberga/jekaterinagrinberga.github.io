// /llms.txt — a plain-text summary of the site for AI agents and assistants
// (see https://llmstxt.org). Built from the homepage text and the blog posts,
// so it updates itself whenever the site changes.
import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { getExcerpt } from '../lib/postExcerpt';

const SITE = 'https://jekaterinagrinberga.com';

// Remove the **bold** markers used in home.md
const plain = (text: string) => text.replace(/\*\*/g, '').trim();

export const GET: APIRoute = async () => {
  const home = await getEntry('pages', 'home');
  const posts = (await getCollection('posts')).sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  const about = home.data.aboutText
    .trim()
    .split(/\n\s*\n/)
    .map(plain)
    .join('\n\n');

  const postLines = posts.map((post) => {
    const summary = post.data.description ?? getExcerpt(post.body ?? '', post.data.excerpt);
    return `- [${post.data.title}](${SITE}/${post.id}/) (${post.data.date}): ${summary}`;
  });

  const body = `# Jekaterina Grinberga

> ${plain(home.data.tagline)}

## About

${about}

## Contact

- Email: jekaterina.grinberga@gmail.com
- LinkedIn: https://www.linkedin.com/in/jekaterina-grinberga/
- Website: ${SITE}/

## Blog posts

${postLines.join('\n')}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
