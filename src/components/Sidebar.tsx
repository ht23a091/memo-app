import type { Memo } from '../App';

interface Props {
  categories: string[];
  memos: Memo[];
  onSelectMemo: (id: number) => void;
  onAddMemo: () => void;
  onSelectCategory: (category: string) => void;
  onDelete: (id: number) => void;
  searchQuery: string; 
  onSearchQueryChange: (q: string) => void; 
  onAddCategory?: (name: string) => void; // 追加したい場合は optional
}

const Sidebar = ({
  categories,
  memos,
  onSelectMemo,
  onAddMemo,
  onSelectCategory,
  onDelete,
  searchQuery,
  onSearchQueryChange,
  onAddCategory,
}: Props) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData('text/plain');
    const id = parseInt(idStr, 10);
    if (!Number.isNaN(id)) {
      if (confirm('このメモをゴミ箱に移動して削除しますか？')) {
        onDelete(id);
      }
    }
  };

  return (
    <aside
      style={{
        width: 260,
        background: '#f7f7f8',
        padding: '1rem',
        borderRight: '1px solid #e6e6e6',
        overflowY: 'auto',
      }}
    >
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <button
          onClick={onAddMemo}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: 6,
            border: 'none',
            background: '#1976d2',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          ➕ 新規メモ
        </button>
      </div>

      <input
        type="text"
        placeholder="検索..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 8px',
          marginBottom: '1rem',
          border: '1px solid #ccc',
          borderRadius: 6,
        }}
      />

      <h3 style={{ margin: '8px 0' }}>カテゴリ</h3>
      {categories.length === 0 ? (
        <div style={{ color: '#777' }}>（なし）</div>
      ) : (
        categories.map((cat) => (
          <div
            key={cat}
            onClick={() => onSelectCategory(cat)}
            style={{
              padding: '6px 8px',
              cursor: 'pointer',
              borderRadius: 6,
              marginBottom: 6,
            }}
          >
            📁 {cat}
          </div>
        ))
      )}

      {onAddCategory && (
        <div style={{ marginTop: 8 }}>
          <input
            type="text"
            placeholder="新しいカテゴリ..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onAddCategory(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #ccc',
              borderRadius: 6,
            }}
          />
        </div>
      )}

      <h3 style={{ marginTop: 16 }}>メモ一覧</h3>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {memos.map((memo) => (
          <div
            key={memo.id}
            onClick={() => onSelectMemo(memo.id)}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(memo.id));
              e.dataTransfer.effectAllowed = 'move';
            }}
            style={{
              padding: '6px 8px',
              cursor: 'pointer',
              borderRadius: 6,
              marginBottom: 6,
              background: '#fff',
              border: '1px solid #ddd',
            }}
          >
            📝 {memo.title || '(タイトルなし)'}
          </div>
        ))}
      </div>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          marginTop: 20,
          padding: '12px',
          borderRadius: 8,
          textAlign: 'center',
          background: '#fff5f5',
          border: '1px dashed #f0c2c2',
          color: '#b00020',
        }}
      >
        🗑 ゴミ箱
      </div>
    </aside>
  );
};

export default Sidebar;
