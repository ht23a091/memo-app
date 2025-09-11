import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MemoInput from './components/MemoInput';
import MemoList from './components/MemoList';

export interface Memo {
  id: number;
  title: string;
  content: string;
  category: string;
}

function App() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('memos');
    if (stored) {
      setMemos(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('memos', JSON.stringify(memos));
  }, [memos]);

  const addMemo = (title: string, content: string, category: string) => {
    if (editingMemo) {
      setMemos(memos.map(m => m.id === editingMemo.id ? { ...m, title, content, category } : m));
      setEditingMemo(null);
    } else {
      const newMemo: Memo = {
        id: Date.now(),
        title,
        content,
        category,
      };
      setMemos([newMemo, ...memos]);
    }
  };

  const deleteMemo = (id: number) => {
    setMemos(memos.filter((m) => m.id !== id));
  };

  const editMemo = (memo: Memo) => {
    setEditingMemo(memo);
  };

  const onSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setEditingMemo(null);
  };

  const filteredMemos =
    selectedCategory === ''
      ? memos
      : memos.filter((memo) => memo.category === selectedCategory);

  const categories = Array.from(
    new Set(memos.map((m) => m.category).filter((c) => c !== ''))
  );
  const uncategorizedMemos = memos.filter((m) => m.category === '');

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        categories={categories}
        uncategorizedMemos={uncategorizedMemos}
        onSelect={onSelectCategory}
      />
      <div style={{ flex: 1, padding: '1rem' }}>
        <h1>📝 メモアプリ</h1>
        <MemoInput
          onAdd={addMemo}
          editingMemo={editingMemo}
          onCancelEdit={() => setEditingMemo(null)}
        />
        <MemoList memos={filteredMemos} onDelete={deleteMemo} onEdit={editMemo} />
      </div>
    </div>
  );
}

export default App;
