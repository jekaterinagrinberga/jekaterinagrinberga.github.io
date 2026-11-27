// Turns every stand-alone picture in a blog post's HTML into a <figure> that
// floats to the left or right of the text, keeping its caption underneath.
//
// A caption is the short paragraph straight after a picture that doesn't end
// like a sentence, e.g. "Smog over the Bangkok in March 2023".
// The side (left/right) is picked "randomly" from the picture's file name, so
// it looks varied but stays the same every time the site is built.

const PICTURE = /<p>\s*((?:<a\b[^>]*>\s*)?<img\b[^>]*>(?:\s*<\/a>)?)\s*<\/p>/g;
const NEXT_PARAGRAPH = /^\s*<p>([\s\S]*?)<\/p>/;

function isCaption(html: string | undefined): boolean {
  if (!html || /<img\b/.test(html)) return false;
  const text = html.replace(/<[^>]+>/g, '').trim();
  return text.length > 0 && text.length <= 120 && !/[.:;!?]["'”’)]*$/.test(text);
}

function side(src: string): 'left' | 'right' {
  let hash = 0;
  for (const ch of src) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash % 2 === 0 ? 'left' : 'right';
}

export function addFigures(html: string): string {
  let out = '';
  let pos = 0;
  for (const match of html.matchAll(PICTURE)) {
    const start = match.index ?? 0;
    if (start < pos) continue; // already used as a caption
    out += html.slice(pos, start);
    pos = start + match[0].length;

    const picture = match[1];
    const src = picture.match(/src="([^"]*)"/)?.[1] ?? '';
    let caption = '';
    const next = html.slice(pos).match(NEXT_PARAGRAPH);
    if (next && isCaption(next[1])) {
      caption = `<figcaption>${next[1].trim()}</figcaption>`;
      pos += next[0].length;
    }
    out += `<figure class="post-figure float-${side(src)}">${picture}${caption}</figure>`;
  }
  return out + html.slice(pos);
}
