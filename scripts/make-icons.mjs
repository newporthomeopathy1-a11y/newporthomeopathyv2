// One-off: build favicon set (leaf mark only) + 1200x630 OG image. Re-run when the logo/photos change.
import sharp from 'sharp';
import fs from 'node:fs/promises';
const logo = 'public/assets/img/logo.png';
const meta = await sharp(logo).metadata();
// Leaf mark sits in the left ~25% of the wordmark.
const markRaw = await sharp(logo).extract({ left: 0, top: 0, width: Math.round(meta.width * 0.25), height: meta.height }).toBuffer();
const mark = await sharp(markRaw).trim().toBuffer();
const square = async (size, pad = 0.1) => {
  const inner = Math.round(size * (1 - pad * 2));
  const m = await sharp(mark).resize(inner, inner, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } }).composite([{ input: m, gravity: 'center' }]).png({ compressionLevel: 9, palette: true });
};
await (await square(180)).toFile('public/apple-touch-icon.png');
await (await square(192)).toFile('public/icon-192.png');
await (await square(512)).toFile('public/icon-512.png');
for (const size of [48, 96, 192]) {
  await (await square(size)).toFile(`public/favicon-${size}x${size}.png`);
}
// SVG icon wraps the 512 PNG (no vector source supplied yet — TODO open item 13).
const b64 = (await (await square(128, 0.04)).toBuffer()).toString('base64');
await fs.writeFile('public/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><image href="data:image/png;base64,${b64}" width="128" height="128"/></svg>`);
const icoImages = await Promise.all([32, 48].map(async (size) => ({
  size,
  data: await (await square(size, 0.04)).toBuffer(),
})));
const directory = Buffer.alloc(6 + icoImages.length * 16);
directory.writeUInt16LE(0, 0);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(icoImages.length, 4);
let imageOffset = directory.length;
for (const [index, image] of icoImages.entries()) {
  const entryOffset = 6 + index * 16;
  directory.writeUInt8(image.size, entryOffset);
  directory.writeUInt8(image.size, entryOffset + 1);
  directory.writeUInt8(0, entryOffset + 2);
  directory.writeUInt8(0, entryOffset + 3);
  directory.writeUInt16LE(1, entryOffset + 4);
  directory.writeUInt16LE(32, entryOffset + 6);
  directory.writeUInt32LE(image.data.length, entryOffset + 8);
  directory.writeUInt32LE(imageOffset, entryOffset + 12);
  imageOffset += image.data.length;
}
await fs.writeFile('public/favicon.ico', Buffer.concat([directory, ...icoImages.map(({ data }) => data)]));
// OG image (1200x630): white card, logo, clinic name/location, practitioner portrait. No stock photography.
const portrait = await sharp('src/assets/kavita-portrait.jpg').resize(380, 520, { fit: 'cover', position: 'top' }).toBuffer();
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
