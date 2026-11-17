// QA gate (spec Part 10): fail the build if banned claims, condition names or template leftovers appear in dist/.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
const banned = [
  /\btreat(s|ed|ing)?\b/i, /\bcure/i, /\bheal(s|ing)?\b/i, /\beffective\b/i, /side effects/i, /\brelief\b/i, /\bDr\.? /,
  /\b(asthma|eczema|migraine|arthritis|allerg|vertigo|gastritis|menstrual|urinary|psoriasis|anxiety|depression|insomnia|infertility)/i,
  /lorem ipsum/i, /medilab/i, /uthra/i, /walter white/i, /saul goodman/i,
];
// The approved GP statement legitimately contains "treatment by a medical professional".
const allow = [/diagnosis or treatment by a medical professional/gi];
async function* walk(d) { for (const e of await readdir(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) yield* walk(p); else if (/\.(html|xml|txt|json)$/.test(p)) yield p; } }
let bad = 0;
import { existsSync } from 'node:fs';
const root = existsSync('.vercel/output/static') ? '.vercel/output/static' : 'dist';
for await (const f of walk(root)) {
  let t = await readFile(f, 'utf8');
  const renderedHtml = t.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  const leftover = renderedHtml.match(/\bTODO\b|Draft:/);
  if (leftover) { bad++; console.log(`${f}: "${leftover[0]}"`); }
  for (const a of allow) t = t.replace(a, '');
  for (const r of banned) { const m = t.match(r); if (m) { bad++; console.log(`${f}: "${m[0]}"`); } }
}
if (bad) { console.error(`\n${bad} copy-rule violations`); process.exit(1); }
console.log(`Copy check passed (${root}): no banned claims, condition names or template leftovers.`);
