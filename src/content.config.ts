import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog posts are Markdown files in src/content/blog. Copy rules (spec Part 3) apply to every post.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().max(60),
    description: z.string().max(155),
    summary: z.string().optional(),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
