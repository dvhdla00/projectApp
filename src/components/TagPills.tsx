import { tagKindFor } from '../lib/tagColor';

export default function TagPills({
  tags,
  onRemove,
}: {
  tags: string[];
  onRemove?: (tag: string) => void;
}) {
  if (tags.length === 0) return null;
  return (
    <div className="tag-pills">
      {tags.map((tag) => (
        <span key={tag} className={`tag-pill tag-pill-${tagKindFor(tag)}`}>
          {tag}
          {onRemove && (
            <button
              className="tag-pill-remove"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(tag);
              }}
              title={`Remove ${tag}`}
            >
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
