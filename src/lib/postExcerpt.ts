// Builds a blog card excerpt from the first two full sentences of a post.
// Only regular prose paragraphs are used: images, captions, headings, lists
// and lead-in lines that don't end like a sentence are skipped.

function toPlainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> link text
    .replace(/<[^>]+>/g, '') // html tags
    .replace(/\\([*_\\[\]()#.-])/g, '$1') // escaped characters
    .replace(/(\*\*|__|\*|_|`)/g, '') // emphasis markers
    .replace(/\s+/g, ' ')
    .trim();
}

function isProseParagraph(block: string): boolean {
  const trimmed = block.trim();
  if (!trimmed) return false;
  if (/^(#|>|!\[|<|\d+\.\s|[-*+]\s|\|)/.test(trimmed)) return false;
  // Must end like a sentence (allowing closing quotes or brackets)
  return /[.!?]["'”’)]*$/.test(toPlainText(trimmed));
}

export function getExcerpt(body: string, fallback: string, sentenceCount = 2): string {
  const paragraphs = body.split(/\n\s*\n/).filter(isProseParagraph).map(toPlainText);
  const text = paragraphs.join(' ');

  // Split after . ! ? (plus closing quotes) when a space and a new sentence follow,
  // so numbers like "1.5" stay intact
  const sentences = text.split(/(?<=[.!?]["'”’)]*)\s+(?=["'“‘(]?[A-Z0-9])/);
  const excerpt = sentences.slice(0, sentenceCount).join(' ').trim();

  return excerpt || fallback;
}
