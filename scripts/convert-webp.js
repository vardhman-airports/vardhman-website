import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT_DIR = path.join(__dirname, '..', 'public', 'images');
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

let converted = 0, skipped = 0, errors = 0;

async function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    if (!EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;

    const out = full.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    if (fs.existsSync(out)) { skipped++; continue; }

    try {
      const img = sharp(full, { limitInputPixels: false });
      const meta = await img.metadata();
      const MAX = 16000;
      const pipeline = (meta.width > MAX || meta.height > MAX)
        ? img.resize(MAX, MAX, { fit: 'inside', withoutEnlargement: true })
        : img;
      await pipeline.webp({ quality: 82 }).toFile(out);
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

console.log('Converting images to WebP...\n');
await walk(INPUT_DIR);
console.log(`\nDone. Converted: ${converted} | Already existed: ${skipped} | Errors: ${errors}`);
