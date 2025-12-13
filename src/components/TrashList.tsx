// src/components/TrashList.tsx
import type React from 'react';
import type { Memo } from '../App';

export interface TrashItem extends Memo {
  deletedAt: number;
}

interface Props {
  items: TrashItem[];
  onRestore: (id: number) => void;
  onDeleteForever: (id: number) => void;
}

const labelCategory = (c: string) => (c ? c : 'カテゴリなし');

const formatDateTime = (ts: number) => {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
};

const TrashList: React.FC<Props> = ({ items, onRestore, onDeleteForever }) => {
  if (items.length === 0) {
    return <div style={{ fontSize: 12, color: '#777' }}>ゴミ箱は空です</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((m) => (
        <div
          key={m.id}
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
          <div
            style={{
              fontSize: 12,
              color: '#999',
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 2,
            }}
          >
            <span>削除日時: {formatDateTime(m.deletedAt)}</span>
          </div>

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

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 6,
              marginTop: 4,
            }}
          >
            <button
              onClick={() => onRestore(m.id)}
              style={{
                padding: '4px 8px',
                borderRadius: 9999,
                border: '1px solid #cfe2ff',
                background: '#e7f1ff',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              復元
            </button>

            <button
              onClick={() => onDeleteForever(m.id)}
              style={{
                padding: '4px 8px',
                borderRadius: 9999,
                border: '1px solid #ffb3c1',
                background: '#ffe5ea',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              完全削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrashList;
