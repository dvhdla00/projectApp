import { useEffect, useLayoutEffect, useRef } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { Block, BlockType } from '../lib/types';
import BlockTypeMenu from './BlockTypeMenu';

const PLACEHOLDER: Record<BlockType, string> = {
  paragraph: "Type '/' for commands, or just start writing…",
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  bulleted: 'List item',
  numbered: 'List item',
  todo: 'To-do',
  quote: 'Quote',
  callout: 'Callout',
  divider: '',
};

const TYPE_BADGE: Record<BlockType, string> = {
  paragraph: '¶',
  heading1: 'H1',
  heading2: 'H2',
  heading3: 'H3',
  bulleted: '•',
  numbered: '1.',
  todo: '☑',
  quote: '❝',
  callout: '◆',
  divider: '—',
};

const MULTILINE_TYPES = new Set<BlockType>(['paragraph', 'quote', 'callout']);

interface BlockRowProps {
  pageId: string;
  block: Block;
  numberLabel?: number;
  autoFocus: boolean;
  onFocused: () => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
}

export default function BlockRow({
  pageId,
  block,
  numberLabel,
  autoFocus,
  onFocused,
  onEnter,
  onBackspaceEmpty,
}: BlockRowProps) {
  const updateBlockText = useWorkspaceStore((s) => s.updateBlockText);
  const setBlockType = useWorkspaceStore((s) => s.setBlockType);
  const toggleBlockChecked = useWorkspaceStore((s) => s.toggleBlockChecked);
  const deleteBlock = useWorkspaceStore((s) => s.deleteBlock);
  const moveBlock = useWorkspaceStore((s) => s.moveBlock);

  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const isMultiline = MULTILINE_TYPES.has(block.type);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      onFocused();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  useLayoutEffect(() => {
    if (isMultiline && inputRef.current) {
      const el = inputRef.current as HTMLTextAreaElement;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [block.text, isMultiline]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isMultiline && e.shiftKey) return;
      e.preventDefault();
      onEnter();
    } else if (e.key === 'Backspace' && block.text === '') {
      e.preventDefault();
      onBackspaceEmpty();
    }
  };

  const renderField = () => {
    if (block.type === 'divider') {
      return <hr className="block-divider" />;
    }

    if (block.type === 'todo') {
      return (
        <div className="block-todo-row">
          <input
            type="checkbox"
            className="block-todo-checkbox"
            checked={!!block.checked}
            onChange={() => toggleBlockChecked(pageId, block.id)}
          />
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            className={`block-input${block.checked ? ' block-todo-done' : ''}`}
            value={block.text}
            placeholder={PLACEHOLDER.todo}
            onChange={(e) => updateBlockText(pageId, block.id, e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      );
    }

    if (block.type === 'bulleted' || block.type === 'numbered') {
      return (
        <div className="block-list-row">
          <span className="block-list-marker">
            {block.type === 'bulleted' ? '•' : `${numberLabel ?? 1}.`}
          </span>
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            className="block-input"
            value={block.text}
            placeholder={PLACEHOLDER[block.type]}
            onChange={(e) => updateBlockText(pageId, block.id, e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      );
    }

    if (isMultiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          className={`block-input block-textarea block-${block.type}`}
          value={block.text}
          placeholder={PLACEHOLDER[block.type]}
          rows={1}
          onChange={(e) => updateBlockText(pageId, block.id, e.target.value)}
          onKeyDown={handleKeyDown}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        className={`block-input block-${block.type}`}
        value={block.text}
        placeholder={PLACEHOLDER[block.type]}
        onChange={(e) => updateBlockText(pageId, block.id, e.target.value)}
        onKeyDown={handleKeyDown}
      />
    );
  };

  return (
    <div className="block-row">
      <div className="block-content">{renderField()}</div>
      <div className="block-row-actions">
        <BlockTypeMenu
          trigger={TYPE_BADGE[block.type]}
          onSelect={(t) => {
            setBlockType(pageId, block.id, t);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
        />
        <button className="tree-icon-btn" onClick={() => moveBlock(pageId, block.id, 'up')} title="Move up">
          ↑
        </button>
        <button className="tree-icon-btn" onClick={() => moveBlock(pageId, block.id, 'down')} title="Move down">
          ↓
        </button>
        <button className="tree-icon-btn" onClick={onEnter} title="Add block below">
          +
        </button>
        <button
          className="tree-icon-btn tree-delete"
          onClick={() => deleteBlock(pageId, block.id)}
          title="Delete block"
        >
          ×
        </button>
      </div>
    </div>
  );
}
