// src/App.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import MemoInput from './components/MemoInput';
import Sidebar from './components/Sidebar';

export interface Memo {
  id: number;
  title: string;
  content: string;
  category: string;
  pinned?: boolean;
}

export type CategoryFilter = '__ALL__' | '__UNCATEGORIZED__' | string;

type WithDeletedAt = Memo & { deletedAt: number };

const LS = {
  memos: 'memos',
  selectedMemoId: 'selectedMemoId',
  selectedCategory: 'selectedCategory',
  customCategories: 'customCategories',
  trash: 'trash',
} as const;

const SIDEBAR_WIDTH = 320;

function uniqById<T extends { id: number }>(arr: T[]): T[] {
  const seen = new Set<number>();
  const out: T[] = [];

  for (const item of arr) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }

  return out;
}

const resolveCategoryForNewMemo = (filter: CategoryFilter): string =>
  filter === '__ALL__' || filter === '__UNCATEGORIZED__' ? '' : filter;

function App() {
  const [memos, setMemos] = useState<Memo[]>(() => {
    try {
      const s = localStorage.getItem(LS.memos);
      const loaded: Memo[] = s ? JSON.parse(s) : [];

      const base = loaded.length
        ? loaded
        : [{ id: Date.now(), title: '', content: '', category: '', pinned: false }];

      return uniqById(base);
    } catch {
      return [
        { id: Date.now(), title: '', content: '', category: '', pinned: false },
      ];
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(() => {
    const stored = localStorage.getItem(LS.selectedCategory);
    if (!stored || stored === '') return '__ALL__';
    if (stored === '__UNCATEGORIZED__') return '__UNCATEGORIZED__';
    return stored;
  });

  const [selectedMemoId, setSelectedMemoId] = useState<number | null>(() => {
    const sid = localStorage.getItem(LS.selectedMemoId);
    return sid ? parseInt(sid, 10) : null;
  });

  const [searchQuery, setSearchQuery] = useState('');

  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem(LS.customCategories);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const [trash, setTrash] = useState<WithDeletedAt[]>(() => {
    try {
      const s = localStorage.getItem(LS.trash);
      const loaded: WithDeletedAt[] = s ? JSON.parse(s) : [];
      return uniqById(loaded);
    } catch {
      return [];
    }
  });

  const [isTrashView, setIsTrashView] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((v) => !v);
  }, []);

  useEffect(() => {
    if (selectedMemoId == null && memos.length > 0) {
      setSelectedMemoId(memos[0].id);
    }
  }, [selectedMemoId, memos]);

  useEffect(() => {
    const safeMemos = uniqById(memos);
    const safeTrash = uniqById(trash);

    localStorage.setItem(LS.memos, JSON.stringify(safeMemos));

    if (selectedMemoId != null) {
      localStorage.setItem(LS.selectedMemoId, String(selectedMemoId));
    }

    localStorage.setItem(LS.selectedCategory, selectedCategory);
    localStorage.setItem(LS.customCategories, JSON.stringify(customCategories));
    localStorage.setItem(LS.trash, JSON.stringify(safeTrash));
  }, [memos, selectedMemoId, selectedCategory, customCategories, trash]);

  useEffect(() => {
    const backup = () => {
      try {
        localStorage.setItem(LS.memos, JSON.stringify(uniqById(memos)));

        if (selectedMemoId != null) {
          localStorage.setItem(LS.selectedMemoId, String(selectedMemoId));
        }

        localStorage.setItem(LS.selectedCategory, selectedCategory);
        localStorage.setItem(LS.customCategories, JSON.stringify(customCategories));
        localStorage.setItem(LS.trash, JSON.stringify(uniqById(trash)));
      } catch (e) {
        console.warn('Backup save failed:', e);
      }
    };

    const beforeUnloadHandler = () => backup();

    const visibilityHandler = () => {
      if (document.visibilityState === 'hidden') backup();
    };

    window.addEventListener('beforeunload', beforeUnloadHandler);
    document.addEventListener('visibilitychange', visibilityHandler);

    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, [memos, selectedMemoId, selectedCategory, customCategories, trash]);

  const handleAddMemo = useCallback(() => {
    let id = Date.now();
    const ids = new Set(memos.map((m) => m.id));
    while (ids.has(id)) id++;

    const category = resolveCategoryForNewMemo(selectedCategory);
    const newMemo: Memo = { id, title: '', content: '', category, pinned: false };

    setMemos((prev) => uniqById([newMemo, ...prev]));
    setSelectedMemoId(id);
    setIsTrashView(false);
  }, [selectedCategory, memos]);

  const handleUpdate = useCallback((updated: Memo) => {
    setMemos((prev) =>
      uniqById(prev.map((m) => (m.id === updated.id ? updated : m))),
    );
  }, []);

  const handleTogglePin = useCallback((id: number) => {
    setMemos((prev) =>
      uniqById(prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m))),
    );
  }, []);

  const handleTrash = useCallback(
    (id: number) => {
      setMemos((prev) => {
        const target = prev.find((m) => m.id === id);
        const next = prev.filter((m) => m.id !== id);

        if (target) {
          setTrash((t) => {
            const entry: WithDeletedAt = { ...target, deletedAt: Date.now() };
            return uniqById([entry, ...t.filter((x) => x.id !== target.id)]);
          });
        }

        if (next.length === 0) {
          let nid = Date.now();
          const ids = new Set(prev.map((m) => m.id));
          while (ids.has(nid)) nid++;

          const category = resolveCategoryForNewMemo(selectedCategory);
          const fresh: Memo = {
            id: nid,
            title: '',
            content: '',
            category,
            pinned: false,
          };

          setSelectedMemoId(fresh.id);
          return [fresh];
        }

        if (selectedMemoId === id) {
          setSelectedMemoId(next[0].id);
        }

        return uniqById(next);
      });
    },
    [selectedCategory, selectedMemoId],
  );

  const handleRestore = useCallback((id: number) => {
    setTrash((prevTrash) => {
      const target = prevTrash.find((m) => m.id === id);
      const nextTrash = prevTrash.filter((m) => m.id !== id);

      if (target) {
        setMemos((prev) =>
          uniqById([{ ...target }, ...prev.filter((m) => m.id !== target.id)]),
        );
        setSelectedMemoId(target.id);
        setIsTrashView(false);
      }

      return uniqById(nextTrash);
    });
  }, []);

  const handleDeleteForever = useCallback((id: number) => {
    if (!confirm('このメモを完全に削除します。元に戻せません。よろしいですか？')) {
      return;
    }
    setTrash((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleEmptyTrash = useCallback(() => {
    if (!confirm('ゴミ箱を空にします。元に戻せません。よろしいですか？')) return;
    setTrash([]);
  }, []);

  const handleAddCategory = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setCustomCategories((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed],
    );
  }, []);

  const handleDeleteCategory = useCallback((name: string) => {
    if (!name) return;

    const ok = confirm(
      `カテゴリ「${name}」を削除します。\n` +
        `カテゴリ内のメモは「カテゴリなし」（メモ一覧）に移動します。`,
    );
    if (!ok) return;

    setMemos((prev) =>
      prev.map((m) => (m.category === name ? { ...m, category: '' } : m)),
    );

    setCustomCategories((prev) => prev.filter((c) => c !== name));

    setSelectedCategory((prev) => (prev === name ? '__ALL__' : prev));
  }, []);

  const handleMoveMemoToCategory = useCallback(
    (id: number, category: string) => {
      setMemos((prev) => prev.map((m) => (m.id === id ? { ...m, category } : m)));
      setSelectedCategory(category || '__ALL__');
      setSelectedMemoId(id);
      setIsTrashView(false);
    },
    [],
  );

  const categories = useMemo(() => {
    const fromMemos = Array.from(
      new Set(memos.map((m) => m.category).filter(Boolean)),
    );
    const extras = customCategories.filter((c) => !fromMemos.includes(c));
    return [...fromMemos, ...extras];
  }, [memos, customCategories]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();

    for (const m of memos) {
      const key = m.category || '';
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return map;
  }, [memos]);

  const selectedMemo = useMemo(
    () => memos.find((m) => m.id === selectedMemoId) ?? null,
    [memos, selectedMemoId],
  );

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
      }}
    >
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 8,
            left: 8,
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid #ccc',
            background: '#fff',
            cursor: 'pointer',
            zIndex: 1100,
          }}
        >
          ≡
        </button>
      )}

      <div
        style={{
          width: sidebarOpen ? SIDEBAR_WIDTH : 0,
          transition: 'width 0.25s ease',
          overflow: 'hidden',
          borderRight: sidebarOpen ? '1px solid #e6e6e6' : 'none',
          background: '#f7f7f8',
          boxSizing: 'border-box',
          zIndex: 1000,
        }}
      >
        <Sidebar
          isOpen={sidebarOpen}
          currentCategory={selectedCategory}
          categories={categories}
          categoryCounts={categoryCounts}
          memos={isTrashView ? [] : memos}
          trash={trash}
          isTrashView={isTrashView}
          onToggleTrashView={() => setIsTrashView((v) => !v)}
          onSelectCategory={setSelectedCategory}
          onSelectMemo={(id) => {
            setSelectedMemoId(id);
            setIsTrashView(false);
          }}
          onAddMemo={handleAddMemo}
          onTrash={handleTrash}
          onRestore={handleRestore}
          onDeleteForever={handleDeleteForever}
          onTogglePin={handleTogglePin}
          onEmptyTrash={handleEmptyTrash}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onMoveMemoToCategory={handleMoveMemoToCategory}
          onToggleSidebar={toggleSidebar}
        />
      </div>

      <div
        style={{
          flex: 1,
          padding: '1rem',
          paddingTop: '2rem',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <h1 style={{ margin: 0 }}>メモアプリ</h1>

        {selectedMemo && (
          <MemoInput
            selectedMemo={selectedMemo}
            categories={['', ...categories]}
            onUpdate={handleUpdate}
            onTrash={handleTrash}
            onTogglePin={handleTogglePin}
            onAddCategory={handleAddCategory}
            onAddMemo={handleAddMemo}
          />
        )}
      </div>
    </div>
  );
}

export default App;
