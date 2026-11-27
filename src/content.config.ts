import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    // Date of the last real update, e.g. "2026-11-28" (optional)
    updated: z.string().optional(),
    excerpt: z.string(),
    // Title and description shown in Google results (optional)
    seoTitle: z.string().optional(),
    description: z.string().optional(),
    featuredImage: z.string().nullable(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/pages' }),
  schema: z.object({
    heroName: z.string(),
    tagline: z.string(),
    blogIntro: z.string(),
    aboutText: z.string(),
  }),
});

export const collections = { posts, pages };
