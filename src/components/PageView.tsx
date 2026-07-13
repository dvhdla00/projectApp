import { useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { BlockType } from '../lib/types';
import BlockRow from './BlockRow';

export default function PageView({ pageId }: { pageId: string }) {
  const page = useWorkspaceStore((s) => s.pages.find((p) => p.id === pageId));
  const renamePage = useWorkspaceStore((s) => s.renamePage);
  const addBlock = useWorkspaceStore((s) => s.addBlock);
  const deleteBlock = useWorkspaceStore((s) => s.deleteBlock);
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null);

  if (!page) return null;

  const continueType = (type: BlockType): BlockType =>
    type === 'bulleted' || type === 'numbered' || type === 'todo' ? type : 'paragraph';

  const handleEnter = (blockId: string, type: BlockType) => {
    const newBlock = addBlock(page.id, blockId, continueType(type));
    setFocusBlockId(newBlock.id);
  };

  const handleBackspaceEmpty = (blockId: string) => {
    const index = page.blocks.findIndex((b) => b.id === blockId);
    if (page.blocks.length <= 1) return;
    const prev = page.blocks[index - 1];
    deleteBlock(page.id, blockId);
    if (prev) setFocusBlockId(prev.id);
  };

  let numberedRun = 0;

  return (
    <div className="page-view">
      <div className="page-view-header">
        <input
          className="page-title-input"
          value={page.title}
          placeholder="Untitled"
          onChange={(e) => renamePage(page.id, e.target.value)}
        />
      </div>
      <div className="page-body">
        {page.blocks.map((block) => {
          numberedRun = block.type === 'numbered' ? numberedRun + 1 : 0;
          return (
            <BlockRow
              key={block.id}
              pageId={page.id}
              block={block}
              numberLabel={block.type === 'numbered' ? numberedRun : undefined}
              autoFocus={focusBlockId === block.id}
              onFocused={() => setFocusBlockId(null)}
              onEnter={() => handleEnter(block.id, block.type)}
              onBackspaceEmpty={() => handleBackspaceEmpty(block.id)}
            />
          );
        })}
        <button
          className="block-add-row"
          onClick={() => {
            const last = page.blocks[page.blocks.length - 1];
            const newBlock = addBlock(page.id, last?.id ?? null, 'paragraph');
            setFocusBlockId(newBlock.id);
          }}
        >
          + Add a block
        </button>
      </div>
    </div>
  );
}
