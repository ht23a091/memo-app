import type React from 'react';
import type { Memo } from '../App';

interface Props {
  memos: Memo[];
  onSelectMemo: (id: number) => void;
  onTogglePin: (id: number) => void;
  onTrash: (id: number) => void;
  onMemoDragStart: (e: React.DragEvent<HTMLElement>, id: number) => void;
}

const MemoList: React.FC<Props> = ({
  memos,
  onSelectMemo,
  onTogglePin,
  onTrash,
  onMemoDragStart,
}) => {
  if (memos.length === 0) {
    return <div style={{ fontSize: 12, color: '#777' }}>メモはありません</div>;
  }

  const labelCategory = (c: string) => (c ? c : 'カテゴリなし');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {memos.map((m) => (
        <div
          key={m.id}
          draggable
          onDragStart={(e) => onMemoDragStart(e, m.id)}
          style={{
            borderRadius: 10,
            border: '1px solid #e0e0e0',
            padding: 8,
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <button
            onClick={() => onSelectMemo(m.id)}
            style={{
              textAlign: 'left',
              border: 'none',
              background: 'transparent',
              padding: 0,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  maxWidth: '70%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                }}
              >
                {m.title || '(タイトルなし)'}
              </span>

              <span
                style={{
                  fontSize: 10,
                  color: '#666',
                  background: '#eef2f7',
                  padding: '2px 6px',
                  borderRadius: 6,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {labelCategory(m.category)}
              </span>
            </div>

            <div style={{ fontSize: 11, color: '#999' }}>
              {m.content ? m.content.slice(0, 40) : '(内容なし)'}
              {m.content.length > 40 ? '…' : ''}
            </div>
          </button>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 6,
              marginTop: 4,
            }}
          >
            <button
              onClick={() => onTogglePin(m.id)}
              style={{
                padding: '3px 6px',
                borderRadius: 9999,
                border: '1px solid #ddd',
                background: m.pinned ? '#ffe3ef' : '#fff',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              📌
            </button>

            <button
              onClick={() => onTrash(m.id)}
              style={{
                padding: '3px 6px',
                borderRadius: 9999,
                border: '1px solid #ffb3c1',
                background: '#ffe5ea',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemoList;