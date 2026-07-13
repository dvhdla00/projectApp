import ReactMarkdown from 'react-markdown';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { noteIdFromHref, renderWikiLinksAsMarkdown } from '../lib/wikiLinks';

export default function NoteMarkdown({ content }: { content: string }) {
  const allNotes = useWorkspaceStore((s) => s.notes);
  const selectNoteInProject = useWorkspaceStore((s) => s.selectNoteInProject);

  const processed = renderWikiLinksAsMarkdown(content, allNotes);

  return (
    <ReactMarkdown
      components={{
        a: ({ href, children, ...rest }) => {
          const noteId = noteIdFromHref(href);
          if (noteId) {
            return (
              <a
                {...rest}
                href={href}
                className="wiki-link"
                onClick={(e) => {
                  e.preventDefault();
                  selectNoteInProject(noteId, 'notes');
                }}
              >
                {children}
              </a>
            );
          }
          return (
            <a {...rest} href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          );
        },
      }}
    >
      {processed}
    </ReactMarkdown>
  );
}
