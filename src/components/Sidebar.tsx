// src/components/Sidebar.tsx
import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import type { Memo } from '../App';
import MemoList from './MemoList';
import TrashList from './TrashList';
import type { TrashItem } from './TrashList';

interface Props {
  isOpen: boolean;
  currentCategory: string;
  categories: string[];
  categoryCounts: Map<string, number>;
  memos: Memo[];
  trash: TrashItem[];
  isTrashView: boolean;
  onToggleTrashView: () => void;

  onSelectCategory: (category: string) => void;
  onSelectMemo: (id: number) => void;
  onAddMemo: () => void;
  onTrash: (id: number) => void;
  onRestore: (id: number) => void;
  onDeleteForever: (id: number) => void;
  onTogglePin: (id: number) => void;
  onEmptyTrash: () => void;

  searchQuery: string;
  onSearchQueryChange: (q: string) => void;

  onAddCategory?: (name: string) => void;
  onDeleteCategory?: (name: string) => void;

  onToggleSidebar: () => void;

  onMoveMemoToCategory: (id: number, newCategory: string) => void;
}

const label = (c: string) => (c ? c : 'カテゴリなし');

const truncateTitle = (title: string | undefined) => {
  const base = title && title.trim().length > 0 ? title : '(タイトルなし)';
  return base.length > 20 ? `${base.slice(0, 20)}…` : base;
};

const Sidebar = (props: Props) => {
  const {
    isOpen,
    categories,
    categoryCounts,
    memos,
    trash,
    isTrashView,
    onToggleTrashView,
    onSelectCategory,
    onSelectMemo,
    onAddMemo,
    onTrash,
    onRestore,
    onDeleteForever,
    onTogglePin,
    onEmptyTrash,
    searchQuery,
    onSearchQueryChange,
    onAddCategory,
    onDeleteCategory,
    onToggleSidebar,
    onMoveMemoToCategory,
  } = props;

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {},
  );
  const [categorySectionOpen, setCategorySectionOpen] = useState(true);

  const [isMobileLayout, setIsMobileLayout] = useState(
    window.innerWidth <= 480,
  );

  useEffect(() => {
    const handler = () => setIsMobileLayout(window.innerWidth <= 480);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const closeSidebarIfMobile = () => {
    if (window.innerWidth <= 768) {
      onToggleSidebar();
    }
  };

  const handleAddCategory = () => {
    const name = window.prompt('追加するカテゴリ名');
    if (!name) return;

    const trimmed = name.trim();
    if (!trimmed) return;

    onAddCategory?.(trimmed);
  };

  const searchedMemos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return memos
      .filter((m) =>
        q
          ? m.title.toLowerCase().includes(q) ||
            m.content.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.id - a.id);
  }, [memos, searchQuery]);

  const memosByCategory = useMemo(() => {
    const map = new Map<string, Memo[]>();

    for (const m of searchedMemos) {
      const key = m.category || '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }

    for (const [, list] of map) {
      list.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.id - a.id);
    }

    return map;
  }, [searchedMemos]);

  const allCategoryKeys = useMemo(
    () => categories.filter((c) => c !== ''),
    [categories],
  );

  const count = (c: string) => categoryCounts.get(c) ?? 0;

  const toggleCategory = (name: string) => {
    setOpenCategories((prev) => ({ ...prev, [name]: !prev[name] }));
    onSelectCategory(name);
  };

  const handleMemoDragStart = (e: React.DragEvent<HTMLElement>, id: number) => {
    e.dataTransfer.setData('text/plain', `memo:${id}`);
  };

  const handleCategoryDragStart = (
    e: React.DragEvent<HTMLElement>,
    name: string,
  ) => {
    if (!name) return;
    e.dataTransfer.setData('text/plain', `category:${name}`);
  };

  const handleTrashDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleTrashDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    if (data.startsWith('memo:')) {
      const id = Number(data.slice(5));
      if (!Number.isNaN(id)) onTrash(id);
      return;
    }

    if (data.startsWith('category:')) {
      const name = data.slice(9);
      if (name && onDeleteCategory) onDeleteCategory(name);
    }
  };

  const handleCategoryDrop = (
    e: React.DragEvent<HTMLDivElement>,
    categoryName: string,
  ) => {
    e.preventDefault();

    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    if (data.startsWith('memo:')) {
      const id = Number(data.slice(5));
      if (!Number.isNaN(id)) {
        onMoveMemoToCategory(id, categoryName);
      }
    }
  };

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: isOpen ? 0 : isMobileLayout ? '-110%' : -320,
        height: '100vh',
        width: isMobileLayout ? '100%' : 320,
        transition: 'left 0.25s ease',
        background: '#f7f7f8',
        padding: '1rem',
        borderRight: '1px solid #e6e6e6',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 1000,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <button
          onClick={onToggleSidebar}
          style={{
            padding: '4px 8px',
            borderRadius: 9999,
            border: '1px solid #ccc',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          ×
        </button>

        <button
          onClick={onAddMemo}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
          }}
        >
          +新規メモ
        </button>

        <button
          onClick={handleAddCategory}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
          }}
        >
          +新規カテゴリ
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isTrashView ? (
          <TrashList
            items={trash}
            onRestore={onRestore}
            onDeleteForever={onDeleteForever}
          />
        ) : (
          <>
            <section style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>検索</div>
              <input
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="検索"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  marginTop: 4,
                }}
              />
            </section>

            <section style={{ marginBottom: 16 }}>
              <div
                onClick={() => setCategorySectionOpen((v) => !v)}
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 6,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                カテゴリ {categorySectionOpen ? '▼' : '▶'}
              </div>

              {categorySectionOpen && (
                <div style={{ display: 'grid', gap: 6 }}>
                  {allCategoryKeys.map((c) => {
                    const isOpenCat = !!openCategories[c];
                    const catMemos = memosByCategory.get(c) ?? [];

                    return (
                      <div
                        key={c}
                        draggable
                        onDragStart={(e) => handleCategoryDragStart(e, c)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleCategoryDrop(e, c)}
                        style={{
                          borderRadius: 8,
                          border: '1px solid #e0e0e0',
                          padding: 6,
                          background: '#fff',
                        }}
                      >
                        <button
                          onClick={() => toggleCategory(c)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px 4px',
                            textAlign: 'left',
                          }}
                        >
                          <span>
                            {isOpenCat ? '▼ ' : '▶ '}
                            {label(c)}
                          </span>
                          <span style={{ fontSize: 12, color: '#666' }}>
                            ({count(c)})
                          </span>
                        </button>

                        {isOpenCat && catMemos.length > 0 && (
                          <div
                            style={{
                              marginTop: 4,
                              paddingLeft: 14,
                              display: 'grid',
                              gap: 2,
                            }}
                          >
                            {catMemos.map((m) => (
                              <button
                                key={m.id}
                                draggable
                                onDragStart={(e) => handleMemoDragStart(e, m.id)}
                                onClick={() => {
                                  onSelectMemo(m.id);
                                  closeSidebarIfMobile();
                                }}
                                style={{
                                  textAlign: 'left',
                                  border: 'none',
                                  background: '#f8f9fa',
                                  borderRadius: 6,
                                  padding: '4px 6px',
                                  cursor: 'pointer',
                                  fontSize: 12,
                                  width: '100%',
                                }}
                              >
                                {truncateTitle(m.title)}
                              </button>
                            ))}
                          </div>
                        )}

                        {isOpenCat && catMemos.length === 0 && (
                          <div
                            style={{
                              fontSize: 11,
                              color: '#999',
                              marginTop: 4,
                              paddingLeft: 14,
                            }}
                          >
                            メモはありません
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                メモ一覧
              </div>

              <MemoList
                memos={searchedMemos}
                onSelectMemo={(id) => {
                  onSelectMemo(id);
                  closeSidebarIfMobile();
                }}
                onTogglePin={onTogglePin}
                onTrash={onTrash}
                onMemoDragStart={handleMemoDragStart}
              />
            </section>
          </>
        )}
      </div>

      <div
        onDragOver={handleTrashDragOver}
        onDrop={handleTrashDrop}
        style={{
          marginTop: 4,
          padding: '8px 10px',
          borderRadius: 8,
          border: '1px solid #ddd',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div>ゴミ箱 ({trash.length})</div>

        <button
          onClick={onToggleTrashView}
          style={{
            padding: '4px 8px',
            borderRadius: 6,
            border: '1px solid #ddd',
          }}
        >
          {isTrashView ? 'メモ一覧を表示' : 'ゴミ箱を表示'}
        </button>

        {isTrashView && trash.length > 0 && (
          <button
            onClick={onEmptyTrash}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid #ffe69c',
              background: '#fff8e1',
            }}
          >
            ゴミ箱を空にする
          </button>
        )}

        <div style={{ fontSize: 11, color: '#777' }}>
          メモやカテゴリをここへドラッグすると削除できます
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
