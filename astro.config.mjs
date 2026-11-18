import { readFileSync, readdirSync, renameSync, unlinkSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { pageUpdated } from './src/data/site.ts';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const blogRoot = join(projectRoot, 'src', 'content', 'blog');

function getFrontmatterDate(frontmatter, field, file) {
  const value = frontmatter.match(new RegExp(`^${field}:\\s*["']?([^\\s"']+)`, 'm'))?.[1];
  if (!value) throw new Error(`Missing ${field} date in ${file}.`);

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid ${field} date in ${file}.`);
  return date;
}

function collectBlogLastmods(directory = blogRoot, lastmods = new Map()) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      collectBlogLastmods(file, lastmods);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

    const content = readFileSync(file, 'utf8');
    const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
    if (!frontmatter) throw new Error(`Missing frontmatter in ${file}.`);
    const published = getFrontmatterDate(frontmatter, 'published', file);
    const updated = frontmatter.match(/^updated:\s*["']?([^\s"']+)/m)?.[1];
    const lastmod = updated ? getFrontmatterDate(frontmatter, 'updated', file) : published;
    const slug = relative(blogRoot, file).split(sep).join('/').replace(/\.md$/, '');
    lastmods.set(slug, lastmod);
  }
  return lastmods;
}

const blogLastmods = collectBlogLastmods();

function directSitemap() {
  return {
    name: 'direct-sitemap',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const outputDirectory = fileURLToPath(dir);
        const indexPath = join(outputDirectory, 'sitemap-index.xml');
        const indexXml = readFileSync(indexPath, 'utf8');
        const shards = [...indexXml.matchAll(/<loc>[^<]*\/sitemap-(\d+)\.xml<\/loc>/g)];
        if (shards.length !== 1) {
          throw new Error('Expected one sitemap shard to publish directly at /sitemap.xml.');
        }

        renameSync(join(outputDirectory, `sitemap-${shards[0][1]}.xml`), join(outputDirectory, 'sitemap.xml'));
        unlinkSync(indexPath);
      },
    },
  };
}

// Static pages (spec option A) + one server route: /api/enquiry (prerender = false).
export default defineConfig({
  site: 'https://newporthomeopathy.com',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'ignore', // pages use trailing slashes; /api/enquiry must not redirect a POST
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  security: {
    allowedDomains: [
      { hostname: 'newporthomeopathy.com', protocol: 'https' },
      { hostname: 'www.newporthomeopathy.com', protocol: 'https' },
      { hostname: 'newporthomeopathyv2.vercel.app', protocol: 'https' },
    ],
  },
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [
    sitemap({
      // /book-appointment/ is server-rendered (shows form errors without JS), so list it explicitly.
      customPages: ['https://newporthomeopathy.com/book-appointment/'],
      filter: (page) => !page.includes('/thank-you/') && !page.includes('/404') && !page.includes('/api/'),
      serialize: (item) => {
        const pathname = decodeURIComponent(new URL(item.url).pathname);
        const blogPost = pathname.match(/^\/blog\/(.+)\/$/);
        const lastmod = blogPost
          ? blogLastmods.get(blogPost[1])
          : new Date(pageUpdated[pathname] ?? '2026-11-17');
        if (!lastmod) throw new Error(`Missing frontmatter date for sitemap URL ${item.url}.`);
        return { ...item, lastmod };
      },
    }),
    directSitemap(),
  ],
});
