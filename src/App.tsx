// App.tsx
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MemoInput from './components/MemoInput';

export interface Memo {
  id: number;
  title: string;
  content: string;
  category: string;
}

function App() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedMemoId, setSelectedMemoId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // 初回ロード時に新規メモを作成して選択
  useEffect(() => {
    const stored = localStorage.getItem('memos');
    if (stored) {
      const loaded = JSON.parse(stored);
      setMemos(loaded);
      if (loaded.length > 0) {
        setSelectedMemoId(loaded[0].id);
      } else {
        // 新規メモ作成
        handleAddMemo();
      }
    } else {
      handleAddMemo();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('memos', JSON.stringify(memos));
  }, [memos]);

  const handleAddMemo = () => {
    const newMemo: Memo = {
      id: Date.now(),
      title: '',
      content: '',
      category: selectedCategory,
    };
    setMemos((prev) => [newMemo, ...prev]);
    setSelectedMemoId(newMemo.id);
  };

  const handleUpdate = (updatedMemo: Memo) => {
    setMemos(memos.map((m) => (m.id === updatedMemo.id ? updatedMemo : m)));
  };

  const handleDelete = (id: number) => {
    setMemos((prev) => prev.filter((m) => m.id !== id));
    if (selectedMemoId === id) {
      setSelectedMemoId(null);
    }
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedMemoId(null);
  };

  const handleSelectMemo = (id: number) => {
    setSelectedMemoId(id);
  };

  const handleAddCategory = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !customCategories.includes(trimmed)) {
      setCustomCategories([...customCategories, trimmed]);
    }
  };

  const categories = Array.from(
    new Set([
      ...customCategories,
      ...memos.map((m) => m.category).filter((c) => c !== '')
    ])
  );

  const filteredMemos = memos.filter((memo) => {
    const matchCategory = selectedCategory ? memo.category === selectedCategory : true;
    const matchQuery = searchQuery
      ? memo.title.includes(searchQuery) || memo.content.includes(searchQuery)
      : true;
    return matchCategory && matchQuery;
  });

  const selectedMemo = memos.find((m) => m.id === selectedMemoId) || null;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Sidebar
        categories={categories}
        memos={filteredMemos}
        onSelectCategory={handleSelectCategory}
        onSelectMemo={handleSelectMemo}
        onAddMemo={handleAddMemo}
        onDelete={handleDelete}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onAddCategory={handleAddCategory}
      />
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        <h1 style={{ marginTop: 0 }}>📝 メモアプリ</h1>
        {selectedMemo && (
          <MemoInput selectedMemo={selectedMemo} onUpdate={handleUpdate} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}

export default App;
