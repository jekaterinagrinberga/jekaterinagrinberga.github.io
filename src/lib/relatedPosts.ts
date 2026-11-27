// Picks the posts most related to a given post, by how many meaningful words
// their titles and descriptions share. Ties go to the newer post, so every post
// always gets the same suggestions until the content changes.
import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'posts'>;

const STOP_WORDS = new Set(
  `a an and are as at be but by can do does for from how in into is it its of on or our so than that the their
  them there these this to us vs was we what when which who why will with you your every should all more most
  new not one out real what's whole world first story guide step tiny`.split(/\s+/)
);

function words(post: Post): Set<string> {
  const text = [post.data.title, post.data.seoTitle, post.data.description, post.id.replace(/-/g, ' ')]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const result = new Set<string>();
  for (const raw of text.match(/[a-z0-9]+/g) ?? []) {
    if (raw.length < 3 || STOP_WORDS.has(raw)) continue;
    // Very rough singular form, so "risks" matches "risk"
    result.add(raw.length > 4 && raw.endsWith('s') && !raw.endsWith('ss') ? raw.slice(0, -1) : raw);
  }
  return result;
}

export function getRelatedPosts(current: Post, all: Post[], count = 3): Post[] {
  const own = words(current);
  return all
    .filter((post) => post.id !== current.id)
    .map((post) => {
      let score = 0;
      for (const word of words(post)) if (own.has(word)) score++;
      return { post, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score || new Date(b.post.data.date).getTime() - new Date(a.post.data.date).getTime()
    )
    .slice(0, count)
    .map(({ post }) => post);
}
