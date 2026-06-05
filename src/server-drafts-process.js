/**
 * Draft asset processor — converts raw images/video to web-ready formats.
 * Outputs to _drafts/[slug]/images/web/ preserving originals.
 * @module server-drafts-process
 */

import sharp from 'sharp';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join, parse } from 'path';

const exec = promisify(execFile);

const MAX_WIDTH = 1200;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|svg)$/i;
const VIDEO_EXT = /\.(avi|mov|mp4|webm)$/i;

/**
 * Process all assets in a draft's images folder.
 * @param {string} draftsDir
 * @param {string} slug
 * @returns {Promise<{ processed: string[], errors: string[] }>}
 */
export async function processDraftAssets(draftsDir, slug) {
  const srcDir = join(draftsDir, slug, 'images');
  const outDir = join(draftsDir, slug, 'images', 'web');
  if (!existsSync(srcDir)) return { processed: [], errors: [] };
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const files = readdirSync(srcDir).filter(
    (f) => IMAGE_EXT.test(f) || VIDEO_EXT.test(f)
  );

  const processed = [];
  const errors = [];

  for (const file of files) {
    const src = join(srcDir, file);
    const { name } = parse(file);

    try {
      if (IMAGE_EXT.test(file)) {
        const outFile = `${name}.jpg`;
        await sharp(src)
          .rotate()
          .resize({ width: MAX_WIDTH, withoutEnlargement: true })
          .jpeg({ quality: 82 })
          .toFile(join(outDir, outFile));
        processed.push(outFile);
      } else if (VIDEO_EXT.test(file)) {
        const outFile = `${name}.mp4`;
        const dest = join(outDir, outFile);
        if (!existsSync(dest)) {
          await exec('ffmpeg', [
            '-i', src,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            '-c:a', 'aac',
            '-movflags', '+faststart',
            '-y', dest,
          ]);
        }
        processed.push(outFile);
      }
    } catch (err) {
      errors.push(`${file}: ${err.message}`);
    }
  }

  return { processed, errors };
}
