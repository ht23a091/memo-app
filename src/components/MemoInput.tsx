import { useEffect, useState } from 'react';
import type { Memo } from '../App';

interface Props {
  selectedMemo: Memo | null;
  onUpdate: (updated: Memo) => void;
  onDelete?: (id: number) => void; // optional
}

const MemoInput = ({ selectedMemo, onUpdate, onDelete }: Props) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (selectedMemo) {
      setTitle(selectedMemo.title);
      setContent(selectedMemo.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [selectedMemo]);

 
  const handleBlur = () => {
    if (selectedMemo) {
      onUpdate({ ...selectedMemo, title, content });
    }
  };

  if (!selectedMemo) {
    return <div>メモを選択してください。</div>;
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 900 }}>
      <input
        type="text"
        value={title}
        placeholder="タイトルを入力"
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleBlur}
        style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          border: 'none',
          width: '100%',
          outline: 'none',
          padding: '6px 8px',
          borderRadius: 6,
          background: '#fff'
        }}
      />
      <textarea
        value={content}
        placeholder="メモを入力..."
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlur}
        style={{
          width: '100%',
          height: '60vh',
          border: 'none',
          marginTop: '1rem',
          resize: 'none',
          outline: 'none',
          padding: '12px',
          borderRadius: 6,
          background: '#fff'
        }}
      />

      {onDelete && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => { if (selectedMemo) { if (confirm('このメモを削除しますか？')) onDelete(selectedMemo.id); } }}
            style={{ background: '#e53935', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6 }}
          >
            🗑 メモを削除
          </button>
        </div>
      )}
    </div>
  );
};

export default MemoInput;
