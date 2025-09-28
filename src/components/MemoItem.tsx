import type { Memo } from '../App';

interface Props {
  memo: Memo;
  onDelete: (id: number) => void;
  onEdit: (memo: Memo) => void; 
}

const MemoItem = ({ memo, onDelete, onEdit }: Props) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', String(memo.id));
    // optional: show drag image or effect
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onEdit(memo)}
      style={{
        border: '1px solid #e0e0e0',
        padding: '0.6rem',
        marginBottom: '0.5rem',
        borderRadius: 8,
        background: '#fff',
        cursor: 'pointer',
        boxShadow: '0 1px 0 rgba(0,0,0,0.03)'
      }}
    >
      <div style={{ fontWeight: 600 }}>{memo.title || '(タイトルなし)'}</div>
      <div style={{ fontSize: 13, color: '#666', marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {memo.content || '（内容なし）'}
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: '#999' }}>
        {memo.category ? `📁 ${memo.category}` : 'カテゴリなし'}
      </div>
      <div style={{ marginTop: 8 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(memo.id); }}
          style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: 'none', background: '#f44336', color: '#fff', cursor: 'pointer' }}
        >
          🗑 削除
        </button>
      </div>
    </div>
  );
};

export default MemoItem;
