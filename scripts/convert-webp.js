/**
 * One-time script: converts all JPG/JPEG/PNG images in public/images/
 * to WebP alongside the originals (originals are kept as fallback).
 *
 * Run once:
 *   npm install sharp --save-dev
 *   node scripts/convert-webp.js
 *
 * After running, the original files remain so nothing breaks immediately.
 * You can then update image references in templates/products.json to use .webp.
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT_DIR = path.join(__dirname, '..', 'public', 'images');
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

let converted = 0;
let skipped = 0;
let errors = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      const out = full.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      if (fs.existsSync(out)) {
        skipped++;
        continue;
      }
      try {
        await sharp(full).webp({ quality: 82 }).toFile(out);
        const before = fs.statSync(full).size;
        const after  = fs.statSync(out).size;
        const saving = Math.round((1 - after / before) * 100);
        console.log(`  ${path.relative(INPUT_DIR, full)} → ${saving}% smaller`);
        converted++;
      } catch (err) {
        console.error(`  ERROR: ${full} — ${err.message}`);
        errors++;
      }
    }
  }
}

// sharp is async — wrap in top-level async
(async () => {
  console.log('Converting images to WebP...\n');

  async function walkAsync(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walkAsync(full);
      } else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        const out = full.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        if (fs.existsSync(out)) { skipped++; continue; }
        try {
          await sharp(full).webp({ quality: 82 }).toFile(out);
          const before = fs.statSync(full).size;
          const after  = fs.statSync(out).size;
          const saving = Math.round((1 - after / before) * 100);
          console.log(`  ${path.relative(INPUT_DIR, full)} → ${saving}% smaller`);
          converted++;
        } catch (err) {
          console.error(`  ERROR: ${full} — ${err.message}`);
          errors++;
        }
      }
    }
  }

  await walkAsync(INPUT_DIR);

  console.log(`\nDone. Converted: ${converted} | Already existed: ${skipped} | Errors: ${errors}`);
  console.log('\nNext step: update image src attributes in templates and products.json');
  console.log('to use .webp extensions (keep originals as fallback for now).');
})();
