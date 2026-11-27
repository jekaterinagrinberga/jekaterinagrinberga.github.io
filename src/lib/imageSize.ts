// Reads a picture's width and height from its file in public/, so the browser
// can reserve the right space before it loads (no jumping text).
// Handles JPEG, PNG and WebP; returns null for anything else.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const cache = new Map<string, { width: number; height: number } | null>();

function parse(buf: Buffer): { width: number; height: number } | null {
  // PNG
  if (buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // WebP
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const kind = buf.toString('ascii', 12, 16);
    if (kind === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    if (kind === 'VP8L') {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (kind === 'VP8X') return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
    return null;
  }
  // JPEG: walk the markers until a "start of frame" one
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      const length = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      }
      i += 2 + length;
    }
  }
  return null;
}

export function getImageSize(src: string): { width: number; height: number } | null {
  if (!src.startsWith('/')) return null;
  if (!cache.has(src)) {
    let size = null;
    try {
      size = parse(readFileSync(join(process.cwd(), 'public', decodeURIComponent(src))));
    } catch {
      size = null;
    }
    cache.set(src, size);
  }
  return cache.get(src) ?? null;
}
