// src/components/MemoItem.tsx
import type React from 'react';
import type { Memo } from '../App';

interface MemoItemProps {
  memo: Memo;
  onSelect: (id: number) => void;
  onTogglePin: (id: number) => void;
  onTrash: (id: number) => void;
  onDragStart?: (e: React.DragEvent<HTMLElement>, id: number) => void;
}

const MemoItem = ({
  memo,
  onSelect,
  onTogglePin,
  onTrash,
  onDragStart,
}: MemoItemProps) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, memo.id)}
      style={{
        background: '#fff',
        borderRadius: 8,
        padding: '8px 10px',
        border: '1px solid #ddd',
        marginBottom: 6,
        cursor: 'grab',
      }}
    >
      <div
        onClick={() => onSelect(memo.id)}
        style={{
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {memo.title || '(タイトルなし)'}
      </div>

      <div
        style={{
          fontSize: 12,
          color: '#666',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginTop: 2,
        }}
      >
        {memo.content || '（内容なし）'}
      </div>

      <div
        style={{
          marginTop: 6,
          display: 'flex',
          gap: 6,
        }}
      >
        <button
          onClick={() => onTogglePin(memo.id)}
          title={memo.pinned ? 'ピンを外す' : 'ピン留め'}
          style={{
            padding: '4px 8px',
            borderRadius: 6,
            border: '1px solid #ddd',
            background: memo.pinned ? '#fff7d1' : '#fff',
          }}
        >
          📌
        </button>

        <button
          onClick={() => onTrash(memo.id)}
          style={{
            padding: '4px 8px',
            borderRadius: 6,
            border: '1px solid #f1c0c0',
            background: '#ffecec',
            color: '#b50000',
          }}
        >
          削除
        </button>
      </div>
    </div>
  );
};

export default MemoItem;
