import { useState } from 'react';
import TagPills from './TagPills';

export default function TagEditor({
  tags,
  suggestions = [],
  onAdd,
  onRemove,
}: {
  tags: string[];
  suggestions?: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const listId = 'tag-suggestions';

  const submit = () => {
    const trimmed = draft.trim();
    if (trimmed) onAdd(trimmed);
    setDraft('');
  };

  const otherSuggestions = suggestions.filter((s) => !tags.includes(s));

  return (
    <div className="tag-editor">
      <TagPills tags={tags} onRemove={onRemove} />
      <div className="tag-editor-input-row">
        <input
          className="tag-editor-input"
          list={listId}
          value={draft}
          placeholder="Add a tag…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
        />
        <datalist id={listId}>
          {otherSuggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <button className="tag-editor-add-btn" onClick={submit}>
          Add
        </button>
      </div>
    </div>
  );
}
