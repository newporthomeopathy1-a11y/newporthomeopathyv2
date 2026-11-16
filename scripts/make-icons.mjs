// One-off: build favicon set (leaf mark only) + 1200x630 OG image. Re-run when the logo/photos change.
import sharp from 'sharp';
const logo = 'src/assets/logo.png';
const meta = await sharp(logo).metadata();
// Leaf mark sits in the left ~25% of the wordmark.
const markRaw = await sharp(logo).extract({ left: 0, top: 0, width: Math.round(meta.height * 1.1), height: meta.height }).toBuffer();
const mark = await sharp(markRaw).trim().toBuffer();
const square = async (size, pad = 0.1) => {
  const inner = Math.round(size * (1 - pad * 2));
  const m = await sharp(mark).resize(inner, inner, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } }).composite([{ input: m, gravity: 'center' }]).png({ compressionLevel: 9, palette: true });
};
await (await square(180)).toFile('public/apple-touch-icon.png');
await (await square(192)).toFile('public/icon-192.png');
await (await square(512)).toFile('public/icon-512.png');
// SVG icon wraps the 512 PNG (no vector source supplied yet — TODO open item 13).
const b64 = (await (await square(128, 0.04)).toBuffer()).toString('base64');
await import('node:fs/promises').then((fs) => fs.writeFile('public/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><image href="data:image/png;base64,${b64}" width="128" height="128"/></svg>`));
// favicon.ico: single 32px PNG-in-ICO.
const png32 = await (await square(32, 0.04)).toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12); header.writeUInt32LE(png32.length, 14); header.writeUInt32LE(22, 18);
await import('node:fs/promises').then((fs) => fs.writeFile('public/favicon.ico', Buffer.concat([header, png32])));
// OG image (1200x630): white card, logo, clinic name/location, practitioner portrait. No stock photography.
const portrait = await sharp('src/assets/cavita-portrait.jpg').resize(380, 520, { fit: 'cover', position: 'top' }).toBuffer();
const logoImg = await sharp(logo).resize(420).toBuffer();
const text = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
<style>.t{font-family:'Open Sans',Arial,sans-serif}</style>
<text class="t" x="72" y="280" font-size="52" font-weight="700" fill="#1a1f26">Homeopathy</text>
<text class="t" x="72" y="344" font-size="52" font-weight="700" fill="#1a1f26">consultations in</text>
<text class="t" x="72" y="408" font-size="52" font-weight="700" fill="#1a1f26">Newport, Shropshire</text>
<text class="t" x="72" y="464" font-size="28" fill="#555f6b">In person and online across the UK</text>
<text class="t" x="72" y="540" font-size="28" fill="#0b6bcb">newporthomeopathy.com · 07904 622856</text></svg>`;
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#ffffff' } })
  .composite([{ input: logoImg, left: 72, top: 72 }, { input: Buffer.from(text), left: 0, top: 0 }, { input: portrait, left: 1200 - 380 - 56, top: 55 }])
  .jpeg({ quality: 80, mozjpeg: true }).toFile('public/og-image.jpg');
console.log('icons + og done');
