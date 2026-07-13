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
        <span key={tag} className="pill pill-gray tag-pill">
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
