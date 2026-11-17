import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const pagesRoot = 'src/pages';
const limits = { title: 60, description: 155 };
const failures = [];
const skipped = [];

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (path.endsWith('.astro')) yield path;
  }
}

for await (const path of walk(pagesRoot)) {
  const source = await readFile(path, 'utf8');
  const baseTags = [...source.matchAll(/<Base\b([\s\S]*?)>/g)];
  if (!baseTags.length) {
    skipped.push(relative('.', path));
    continue;
  }

  let hasDynamicValues = false;
  for (const [, props] of baseTags) {
    for (const [name, maxLength] of Object.entries(limits)) {
      const literal = props.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`));
      if (!literal) {
        hasDynamicValues = true;
        continue;
      }

      const value = literal[1];
      if (value.length > maxLength) {
        failures.push(`${relative('.', path)}: ${name} is ${value.length} characters (maximum ${maxLength})`);
      }
    }
  }
  if (hasDynamicValues) skipped.push(relative('.', path));
}

if (skipped.length) {
  console.log(`Skipped pages with dynamic or unavailable Base metadata:\n${skipped.map((path) => `- ${path}`).join('\n')}`);
}

if (failures.length) {
  console.error(`Metadata length check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exit(1);
}

console.log(`Metadata length check passed (${limits.title} title / ${limits.description} description characters maximum).`);
