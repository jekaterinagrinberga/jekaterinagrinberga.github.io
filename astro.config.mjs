// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

const SITE = 'https://jekaterinagrinberga.com';

// "Last modified" date for every page in the sitemap, so search engines know
// when to come back. A post uses its `updated:` date if it has one, otherwise
// its `date:`. The homepage and blog list use the newest post's date.
function readPostDates() {
  const dir = new URL('./src/content/posts/', import.meta.url);
  /** @type {Record<string, string>} */
  const dates = {};
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const text = readFileSync(new URL(file, dir), 'utf8');
    const field = (name) => text.match(new RegExp(`^${name}:\\s*"?([0-9]{4}-[0-9]{2}-[0-9]{2})`, 'm'))?.[1];
    const date = field('updated') ?? field('date');
    if (date) dates[`${SITE}/${file.replace(/\.md$/, '')}/`] = date;
  }
  return dates;
}

const postDates = readPostDates();
const newestPost = Object.values(postDates).sort().at(-1);

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [
    sitemap({
      serialize(item) {
        const date = postDates[item.url] ?? newestPost;
        if (date) item.lastmod = new Date(date).toISOString();
        return item;
      },
    }),
  ],
});
