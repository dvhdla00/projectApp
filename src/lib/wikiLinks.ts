import type { Note } from './types';

const WIKI_LINK_RE = /\[\[([^\]]+)\]\]/g;

/** Titles referenced via [[Title]] syntax in a note body, in order of appearance. */
export function extractWikiLinkTitles(content: string): string[] {
  const titles: string[] = [];
  for (const match of content.matchAll(WIKI_LINK_RE)) {
    titles.push(match[1].trim());
  }
  return titles;
}

export function resolveNoteByTitle(title: string, notes: Note[]): Note | undefined {
  const needle = title.trim().toLowerCase();
  return notes.find((n) => n.title.trim().toLowerCase() === needle);
}

/** Notes referenced by [[Title]] links in this note's body (deduped, excluding itself). */
export function computeOutgoingLinks(note: Note, allNotes: Note[]): Note[] {
  const titles = extractWikiLinkTitles(note.content);
  const seen = new Set<string>();
  const results: Note[] = [];
  for (const title of titles) {
    const target = resolveNoteByTitle(title, allNotes);
    if (target && target.id !== note.id && !seen.has(target.id)) {
      seen.add(target.id);
      results.push(target);
    }
  }
  return results;
}

/** Notes whose body links to this note via [[Title]]. */
export function computeBacklinks(note: Note, allNotes: Note[]): Note[] {
  return allNotes.filter((other) => {
    if (other.id === note.id) return false;
    return extractWikiLinkTitles(other.content).some(
      (title) => title.trim().toLowerCase() === note.title.trim().toLowerCase(),
    );
  });
}

export interface OutlineHeading {
  text: string;
  level: number;
}

/** Markdown headings (# / ## / ###...) found in a note body, for a quick jump-to outline. */
export function extractOutline(content: string): OutlineHeading[] {
  const headings: OutlineHeading[] = [];
  for (const line of content.split('\n')) {
    const match = /^(#{1,6})\s+(.*)$/.exec(line.trim());
    if (match) headings.push({ level: match[1].length, text: match[2].trim() });
  }
  return headings;
}

const NOTE_LINK_PREFIX = '#note:';

export function noteLinkHref(noteId: string): string {
  return `${NOTE_LINK_PREFIX}${noteId}`;
}

export function noteIdFromHref(href: string | undefined): string | null {
  if (!href || !href.startsWith(NOTE_LINK_PREFIX)) return null;
  return href.slice(NOTE_LINK_PREFIX.length);
}

/** Rewrites [[Title]] references into markdown links resolvable by noteIdFromHref. */
export function renderWikiLinksAsMarkdown(content: string, allNotes: Note[]): string {
  return content.replace(WIKI_LINK_RE, (whole, rawTitle) => {
    const target = resolveNoteByTitle(rawTitle, allNotes);
    return target ? `[${rawTitle}](${noteLinkHref(target.id)})` : whole;
  });
}
