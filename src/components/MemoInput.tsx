import { useEffect, useState } from 'react';
import type { Memo } from '../App';

interface Props {
  selectedMemo: Memo | null;
  categories: string[];
  onUpdate: (updated: Memo) => void;
  onTrash: (id: number) => void;
  onTogglePin: (id: number) => void;
  onAddCategory?: (name: string) => void;
  onAddMemo: () => void; 
}

const MemoInput = ({
  selectedMemo,
  categories,
  onUpdate,
  onTrash,
  onTogglePin,
  onAddCategory,
  onAddMemo,
}: Props) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    if (selectedMemo) {
      setTitle(selectedMemo.title);
      setContent(selectedMemo.content);
      setCategory(selectedMemo.category ?? '');
    } else {
      setTitle('');
      setContent('');
      setCategory('');
    }
  }, [selectedMemo]);

  useEffect(() => {
    if (!selectedMemo) return;
    const tid = setTimeout(() => {
      onUpdate({ ...selectedMemo, title, content, category });
    }, 400);
    return () => clearTimeout(tid);
  }, [title, content, category, selectedMemo, onUpdate]);

  const handleBlur = () => {
    if (selectedMemo) onUpdate({ ...selectedMemo, title, content, category });
  };

  const handleAddCategoryHere = () => {
    const name = window.prompt('追加するカテゴリ名');
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    onAddCategory?.(trimmed);

    setCategory(trimmed);
    if (selectedMemo) {
      onUpdate({ ...selectedMemo, title, content, category: trimmed });
    }
  };

  if (!selectedMemo) return null;

  const label = (c: string) => (c ? c : 'カテゴリ変更');

  return (
    <div style={{ marginTop: '1.2rem' }}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        <button
          onClick={() => onTogglePin(selectedMemo.id)}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: selectedMemo.pinned ? '#ffe3ef' : '#fff',
            cursor: 'pointer',
          }}
        >
          📌 ピン留め
        </button>

        <button
          onClick={() => onTrash(selectedMemo.id)}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid #ffb3c1',
            background: '#ffe5ea',
            cursor: 'pointer',
          }}
        >
          ゴミ箱へ
        </button>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <button
          onClick={onAddMemo}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          新規メモ
        </button>

        <button
          onClick={handleAddCategoryHere}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid #cfe2ff',
            background: '#e7f1ff',
            cursor: 'pointer',
            fontSize: 14,
          }}
          title="カテゴリを追加"
        >
          カテゴリ
        </button>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          onBlur={handleBlur}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid #ddd',
            minWidth: 140,
          }}
        >
          {categories.map((c, i) => (
            <option key={`${c}-${i}`} value={c}>
              {label(c)}
            </option>
          ))}
        </select>
      </div>

      {/* タイトル */}
      <input
        type="text"
        value={title}
        placeholder="タイトルを入力"
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleBlur}
        style={{
          fontSize: '1.6rem',
          fontWeight: 600,
          border: 'none',
          width: '100%',
          outline: 'none',
          padding: '6px 8px',
          borderRadius: 6,
          background: '#f7f7f8',
          marginBottom: 12,
        }}
      />

      {/* 本文 */}
      <textarea
        value={content}
        placeholder="本文を入力"
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlur}
        rows={18}
        style={{
          width: '100%',
          resize: 'vertical',
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          lineHeight: 1.7,
        }}
      />
    </div>
  );
};

export default MemoInput;
