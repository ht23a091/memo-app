import { useEffect, useState } from 'react';
import type { Memo } from '../App';

interface Props {
  selectedMemo: Memo | null;
  categories: string[]; // '' を含む（未分類）
  onUpdate: (updated: Memo) => void;
  onTrash: (id: number) => void;
  onTogglePin: (id: number) => void;
}

const MemoInput = ({ selectedMemo, categories, onUpdate, onTrash, onTogglePin }: Props) => {
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

  // 入力 400ms デバウンス自動保存
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

  if (!selectedMemo) return null;

  const label = (c: string) => (c ? c : '未分類');

  return (
    <div style={{ padding: '1rem', maxWidth: 900 }}>
      {/* ヘッダー：ピン／ゴミ箱／カテゴリ */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => onTogglePin(selectedMemo.id)}
          title={selectedMemo.pinned ? 'ピン解除' : 'ピン留め'}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', background: selectedMemo.pinned ? '#fff7d1' : '#fff' }}
        >
          📌
        </button>
        <button
          onClick={() => onTrash(selectedMemo.id)}
          style={{ padding: '6px 10px', borderRadius: 8, background: '#ffecec', border: '1px solid #f1c0c0', color: '#b50000' }}
        >
          ゴミ箱へ
        </button>

        {/* カテゴリ変更ドロップダウン */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#666' }}>カテゴリ:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onBlur={handleBlur}
            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd' }}
          >
            {categories.map((c, i) => (
              <option key={`${c}-${i}`} value={c}>
                {label(c)}
              </option>
            ))}
          </select>
          <span
            title="このメモのカテゴリ"
            style={{ padding: '2px 8px', borderRadius: 999, background: '#f0f0f0', border: '1px solid #e5e5e5', fontSize: 12 }}
          >
            {label(category)}
          </span>
        </div>
      </div>

      <input
        type="text"
        value={title}
        placeholder="タイトルを入力"
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleBlur}
        style={{
          fontSize: '1.5rem',
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
