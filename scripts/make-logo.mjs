import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const source = 'src/assets/logo.png';
const output = 'public/assets/img';
const widths = [224, 448, 672];

await mkdir(output, { recursive: true });

await Promise.all(widths.flatMap((width) => [
  sharp(source).resize({ width }).avif({ quality: 65 }).toFile(`${output}/clinic-logo-${width}.avif`),
  sharp(source).resize({ width }).webp({ quality: 82 }).toFile(`${output}/clinic-logo-${width}.webp`),
]));

await sharp(source).resize({ width: 448 }).png({ compressionLevel: 9 }).toFile(`${output}/logo.png`);
