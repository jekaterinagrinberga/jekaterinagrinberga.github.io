export function getFirstImage(markdown: string): string | null {
  const mdMatch = markdown.match(/!\[[^\]]*\]\(([^)\s]+)/);
  if (mdMatch) return mdMatch[1];

  const htmlMatch = markdown.match(/<img[^>]+src="([^"]+)"/);
  return htmlMatch ? htmlMatch[1] : null;
}
