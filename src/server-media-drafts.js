/**
 * Dev-only media drafts API — batch upload, edit, merge, publish media posts.
 * Mounted at /_api/media-drafts in dev mode.
 * @module server-media-drafts
 */

import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, parse } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';

const exec = promisify(execFile);

const DRAFTS_DIR = resolve('_drafts/media-drafts');
const DATA_FILE = resolve('_drafts/media-drafts.json');
const MEDIA_EXT = /\.(jpe?g|png|gif|webp|svg|mp4|webm|mov|avi|nef|cr2|arw|dng|raf|rw2)$/i;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|svg|nef|cr2|arw|dng|raf|rw2)$/i;
const RAW_EXT = /\.(nef|cr2|arw|dng|raf|rw2)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|avi)$/i;

/**
 *
 */
function readData() {
  if (!existsSync(DATA_FILE)) return { items: [] };
  return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
}

/**
 *
 */
function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n');
}

/**
 *
 */
function makeSlug(filename) {
  const { name } = parse(filename);
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const mediaRouter = Router();

// List all media draft items
mediaRouter.get('/', (req, res) => res.json(readData()));

// Upload files — creates draft items for each
mediaRouter.post('/upload', (req, res) => {
  if (!existsSync(DRAFTS_DIR)) mkdirSync(DRAFTS_DIR, { recursive: true });

  const boundary = req.headers['content-type']?.split('boundary=')[1];
  if (!boundary) return res.status(400).json({ error: 'No boundary' });

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', async () => {
    const body = Buffer.concat(chunks);
    const sep = `--${boundary}`;
    const parts = body.toString('binary').split(sep).slice(1, -1);
    const data = readData();
    const created = [];

    for (const raw of parts) {
      const hdrEnd = raw.indexOf('\r\n\r\n');
      if (hdrEnd === -1) continue;
      const headers = raw.slice(0, hdrEnd);
      const fnMatch = headers.match(/filename="([^"]+)"/);
      if (!fnMatch || !MEDIA_EXT.test(fnMatch[1])) continue;

      const filename = fnMatch[1];
      const fileData = Buffer.from(raw.slice(hdrEnd + 4, -2), 'binary');
      const dest = join(DRAFTS_DIR, filename);
      writeFileSync(dest, fileData);

      // Generate proxy for raw files the browser can't display
      let proxyFile = null;
      if (RAW_EXT.test(filename)) {
        const { name: baseName } = parse(filename);
        proxyFile = `${baseName}_proxy.jpg`;
        try {
          const proxyPath = join(DRAFTS_DIR, proxyFile);
          const { stdout: previewBuf } = await exec('exiftool', ['-b', '-PreviewImage', dest], {
            encoding: 'buffer',
            maxBuffer: 10 * 1024 * 1024,
          });
          if (previewBuf.length > 1000) {
            writeFileSync(proxyPath, previewBuf);
          } else {
            const { stdout: rawBuf } = await exec('dcraw', ['-T', '-c', '-w', '-h', dest], {
              encoding: 'buffer',
              maxBuffer: 50 * 1024 * 1024,
            });
            await sharp(rawBuf).resize({ width: 800 }).jpeg({ quality: 75 }).toFile(proxyPath);
          }
        } catch (e) {
          proxyFile = null;
        }
      } else if (VIDEO_EXT.test(filename)) {
        const { name: baseName } = parse(filename);
        proxyFile = `${baseName}_poster.jpg`;
        try {
          await exec('ffmpeg', [
            '-i',
            dest,
            '-ss',
            '00:00:01',
            '-frames:v',
            '1',
            '-y',
            join(DRAFTS_DIR, proxyFile),
          ]);
        } catch (e) {
          proxyFile = null;
        }
      }

      const slug = makeSlug(filename) + '-' + Date.now().toString(36);
      const type = VIDEO_EXT.test(filename) ? 'video' : 'photo';

      // Try to extract date from EXIF
      let date = new Date().toISOString().slice(0, 19);
      if (IMAGE_EXT.test(filename)) {
        try {
          const meta = await sharp(dest).metadata();
          if (meta.exif) {
            const exifStr = meta.exif.toString('binary');
            const dateMatch = exifStr.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
            if (dateMatch) {
              date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T${dateMatch[4]}:${dateMatch[5]}:${dateMatch[6]}`;
            }
          }
        } catch (e) {
          /* no exif, use default */
        }
      }

      const item = {
        slug,
        files: [filename],
        proxy: proxyFile,
        caption: '',
        tags: [],
        date,
        type,
        status: 'draft',
        crop: null,
        filters: null,
      };
      data.items.push(item);
      created.push(slug);
    }

    writeData(data);
    res.json({ created });
  });
});

// Update a media draft item
mediaRouter.patch('/:slug', (req, res) => {
  const data = readData();
  const item = data.items.find((i) => i.slug === req.params.slug);
  if (!item) return res.status(404).json({ error: 'Not found' });

  const allowed = ['caption', 'tags', 'date', 'status', 'slug', 'crop', 'filters'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) item[key] = req.body[key];
  }
  writeData(data);
  res.json(item);
});

// Merge items into a carousel
mediaRouter.post('/merge', (req, res) => {
  const { slugs } = req.body;
  if (!Array.isArray(slugs) || slugs.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 slugs' });
  }

  const data = readData();
  const items = slugs.map((s) => data.items.find((i) => i.slug === s)).filter(Boolean);
  if (items.length < 2) return res.status(400).json({ error: 'Items not found' });

  // Merge into first item
  const target = items[0];
  for (let i = 1; i < items.length; i++) {
    target.files.push(...items[i].files);
  }
  target.type = 'carousel';

  // Remove merged items
  const mergedSlugs = new Set(slugs.slice(1));
  data.items = data.items.filter((i) => !mergedSlugs.has(i.slug));
  writeData(data);
  res.json(target);
});

// Delete a media draft item
mediaRouter.delete('/:slug', (req, res) => {
  const data = readData();
  data.items = data.items.filter((i) => i.slug !== req.params.slug);
  writeData(data);
  res.json({ success: true });
});

// Serve media draft files
mediaRouter.get('/file/:filename', (req, res) => {
  const filePath = join(DRAFTS_DIR, req.params.filename);
  if (!existsSync(filePath)) return res.status(404).end();
  res.sendFile(filePath, { acceptRanges: true });
});

// Preview with crop + filters applied (low-res)
mediaRouter.get('/:slug/preview', async (req, res) => {
  const data = readData();
  const item = data.items.find((i) => i.slug === req.params.slug);
  if (!item) return res.status(404).end();

  const file = item.files[0];
  const src = join(DRAFTS_DIR, file);
  if (!existsSync(src)) return res.status(404).end();

  // For videos, use the poster frame for preview
  let previewSrc = src;
  if (VIDEO_EXT.test(file)) {
    if (item.proxy && existsSync(join(DRAFTS_DIR, item.proxy))) {
      previewSrc = join(DRAFTS_DIR, item.proxy);
    } else {
      return res.status(400).json({ error: 'No poster frame available' });
    }
  }

  const w = parseInt(req.query.w) || 400;

  try {
    let inputBuffer;
    if (RAW_EXT.test(file)) {
      const { stdout } = await exec('dcraw', ['-T', '-c', '-w', '-h', src], {
        encoding: 'buffer',
        maxBuffer: 50 * 1024 * 1024,
      });
      inputBuffer = stdout;
    }

    let pipeline = sharp(inputBuffer || previewSrc).rotate();

    // Apply crop
    if (item.crop) {
      const meta = await sharp(inputBuffer || previewSrc)
        .rotate()
        .metadata();
      const [rw, rh] = item.crop.ratio.split(':').map(Number);
      let cw = meta.width;
      let ch = Math.round((cw * rh) / rw);
      if (ch > meta.height) {
        ch = meta.height;
        cw = Math.round((ch * rw) / rh);
      }
      const left = Math.round((item.crop.x || 0.5) * (meta.width - cw));
      const top = Math.round((item.crop.y || 0.5) * (meta.height - ch));
      pipeline = pipeline.extract({
        left: Math.max(0, left),
        top: Math.max(0, top),
        width: cw,
        height: ch,
      });
    }

    // Resize to preview width
    pipeline = pipeline.resize({ width: w, withoutEnlargement: true });

    // Apply filters
    if (item.filters) {
      const f = item.filters;
      if (f.bw) pipeline = pipeline.grayscale();
      if (f.brightness !== 0 || f.contrast !== 0) {
        const a = 1 + (f.contrast || 0) / 100;
        pipeline = pipeline.linear(a, 0);
        if (f.brightness > 0) {
          // Brighten: higher gamma value lifts midtones
          pipeline = pipeline.gamma(1 + f.brightness / 30);
        } else if (f.brightness < 0) {
          // Darken: reduce overall with linear
          pipeline = pipeline.linear(1 + f.brightness / 100, 0);
        }
      }
      if (f.saturation !== 0) {
        pipeline = pipeline.modulate({ saturation: 1 + (f.saturation || 0) / 100 });
      }
      if (f.warmth && f.warmth !== 0) {
        // Shift color temperature via per-channel linear adjustment
        const w = f.warmth / 100;
        pipeline = pipeline.recomb([
          [1 + w * 0.1, 0, 0],
          [0, 1, 0],
          [0, 0, 1 - w * 0.1],
        ]);
      }
      if (f.sharpen && f.sharpen > 0) {
        pipeline = pipeline.sharpen({ sigma: 0.5 + f.sharpen / 10 });
      }
    }

    const buf = await pipeline.jpeg({ quality: 75 }).toBuffer();
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'no-cache');
    res.send(buf);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Publish ready items to src/assets-media + manifest
mediaRouter.post('/:slug/publish', async (req, res) => {
  const data = readData();
  const item = data.items.find((i) => i.slug === req.params.slug);
  if (!item) return res.status(404).json({ error: 'Not found' });

  const destDir = resolve('src/assets-media');
  const processedFiles = [];

  for (const file of item.files) {
    const src = join(DRAFTS_DIR, file);
    if (!existsSync(src)) continue;
    const { name } = parse(file);

    if (IMAGE_EXT.test(file)) {
      const outName = `${name}.jpg`;
      let inputBuffer;

      // For raw files, decode with dcraw first
      if (RAW_EXT.test(file)) {
        const { stdout } = await exec('dcraw', ['-T', '-c', '-w', src], {
          encoding: 'buffer',
          maxBuffer: 100 * 1024 * 1024,
        });
        inputBuffer = stdout;
      }

      let pipeline = sharp(inputBuffer || src).rotate();
      if (item.crop) {
        const meta = await sharp(inputBuffer || src)
          .rotate()
          .metadata();
        const { ratio, x, y } = item.crop;
        const [rw, rh] = ratio.split(':').map(Number);
        let cw = meta.width;
        let ch = Math.round((cw * rh) / rw);
        if (ch > meta.height) {
          ch = meta.height;
          cw = Math.round((ch * rw) / rh);
        }
        const left = Math.round((x || 0.5) * (meta.width - cw));
        const top = Math.round((y || 0.5) * (meta.height - ch));
        pipeline = pipeline.extract({
          left: Math.max(0, left),
          top: Math.max(0, top),
          width: cw,
          height: ch,
        });
      }
      pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true });
      if (item.filters) {
        const f = item.filters;
        if (f.bw) pipeline = pipeline.grayscale();
        if (f.brightness !== 0 || f.contrast !== 0) {
          pipeline = pipeline.linear(1 + (f.contrast || 0) / 100, 0);
          if (f.brightness > 0) {
            pipeline = pipeline.gamma(1 + f.brightness / 30);
          } else if (f.brightness < 0) {
            pipeline = pipeline.linear(1 + f.brightness / 100, 0);
          }
        }
        if (f.saturation !== 0) {
          pipeline = pipeline.modulate({ saturation: 1 + (f.saturation || 0) / 100 });
        }
        if (f.warmth && f.warmth !== 0) {
          const w = f.warmth / 100;
          pipeline = pipeline.recomb([
            [1 + w * 0.1, 0, 0],
            [0, 1, 0],
            [0, 0, 1 - w * 0.1],
          ]);
        }
        // Always apply a subtle sharpen on output
        pipeline = pipeline.sharpen({ sigma: 0.5 + (item.filters.sharpen || 0) / 10 });
      } else {
        pipeline = pipeline.sharpen({ sigma: 0.6 });
      }
      await pipeline.jpeg({ quality: 82 }).toFile(join(destDir, outName));
      processedFiles.push(outName);
    } else {
      // Video: apply crop if set, transcode to mp4
      const outName = `${name}.mp4`;
      const dest = join(destDir, outName);
      const filters = [];

      if (item.crop) {
        // Probe video dimensions
        const probe = await exec('ffprobe', [
          '-v',
          'error',
          '-select_streams',
          'v:0',
          '-show_entries',
          'stream=width,height',
          '-of',
          'csv=p=0',
          src,
        ]);
        const [vw, vh] = probe.stdout.trim().split(',').map(Number);
        const [rw, rh] = item.crop.ratio.split(':').map(Number);
        let cw = vw;
        let ch = Math.round((vw * rh) / rw);
        if (ch > vh) {
          ch = vh;
          cw = Math.round((vh * rw) / rh);
        }
        const cx = Math.round((item.crop.x || 0.5) * (vw - cw));
        const cy = Math.round((item.crop.y || 0.5) * (vh - ch));
        filters.push(`crop=${cw}:${ch}:${cx}:${cy}`);
      }

      const args = ['-i', src];
      if (filters.length) args.push('-vf', filters.join(','));
      args.push(
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '23',
        '-c:a',
        'aac',
        '-movflags',
        '+faststart',
        '-y',
        dest,
      );
      await exec('ffmpeg', args);
      processedFiles.push(outName);
    }
  }

  // Add to media manifest
  const manifestPath = resolve('src/content/media/manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  const entry = {
    slug: item.slug,
    files: processedFiles,
    caption: item.caption,
    tags: item.tags,
    date: item.date,
    type: item.type,
    image: item.type !== 'video' ? `https://data.tn42.com/assets-media/${processedFiles[0]}` : null,
  };
  manifest.posts.unshift(entry);
  manifest.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  // Mark complete
  item.status = 'complete';
  writeData(data);
  res.json({ success: true, published: item.slug });
});

export default mediaRouter;
