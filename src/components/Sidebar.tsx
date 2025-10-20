import { useEffect, useState } from 'react';
import type { Memo } from '../App';

type TrashItem = (Memo & { deletedAt: number });

interface Props {
  currentCategory: string;
  categories: string[];
  categoryCounts: Map<string, number>; // ''=未分類
  customCategories: string[];          // 並び替え対象
  memos: Memo[];
  trash: TrashItem[];                  // 件数表示のみ
  isTrashView: boolean;
  onToggleTrashView: () => void;

  onSelectCategory: (category: string) => void;
  onSelectMemo: (id: number) => void;
  onAddMemo: () => void;
  onTrash: (id: number) => void;
  onRestore: (id: number) => void;        // ← 型は維持（親から渡ってくる）
  onDeleteForever: (id: number) => void;  // ← 型は維持
  onTogglePin: (id: number) => void;

  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onAddCategory?: (name: string) => void;

  onReorderCategory: (fromIndex: number, toIndex: number) => void;
  onDeleteCategory: (name: string) => void;
}

const label = (c: string) => (c ? c : '未分類');

declare global {
  interface Window {
    __sidebarManageVal?: boolean; // 管理モードの簡易永続用
  }
}

const Sidebar = (props: Props) => {
  // ★ 未使用の onRestore / onDeleteForever は分割代入しない
  const {
    currentCategory,
    categories,
    categoryCounts,
    customCategories,
    memos,
    trash,
    isTrashView,
    onToggleTrashView,
    onSelectCategory,
    onSelectMemo,
    onAddMemo,
    onTrash,
    onTogglePin,
    searchQuery,
    onSearchQueryChange,
    onAddCategory,
    onReorderCategory,
    onDeleteCategory,
  } = props;

  const handleAddCategory = () => {
    const name = window.prompt('追加するカテゴリ名');
    if (!name) return;
    onAddCategory?.(name);
  };

  // 管理モード（boolean）
  const [manage, setManage] = useState<boolean>(() => window.__sidebarManageVal ?? false);
  useEffect(() => {
    window.__sidebarManageVal = manage;
  }, [manage]);

  // DnD handlers（カテゴリ並び替え）
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (Number.isNaN(fromIndex) || fromIndex === toIndex) return;
    onReorderCategory(fromIndex, toIndex);
  };

  const count = (c: string) => categoryCounts.get(c) ?? 0;

  return (
    <aside
      style={{
        width: 320,
        background: '#f7f7f8',
        padding: '1rem',
        borderRight: '1px solid #e6e6e6',
        overflowY: 'auto',
      }}
    >
      {!isTrashView && (
        <div style={{ marginBottom: 8, fontSize: 12, color: '#555' }}>
          現在のカテゴリ：
          <span
            style={{
              marginLeft: 6,
              padding: '2px 8px',
              borderRadius: 999,
              background: '#fff',
              border: '1px solid #ddd',
            }}
          >
            {label(currentCategory)}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={onAddMemo} style={{ padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>
          ＋ 新規メモ（{label(currentCategory)}）
        </button>
        <button onClick={handleAddCategory} style={{ padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>
          ＋ カテゴリ
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button
          onClick={onToggleTrashView}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            cursor: 'pointer',
            background: isTrashView ? '#fff' : '#ffffffa8',
            border: '1px solid #ddd',
          }}
        >
          {isTrashView ? '← メモ一覧へ' : `🗑️ ゴミ箱（${trash.length}）`}
        </button>
        <button
          onClick={() => setManage(!manage)}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            cursor: 'pointer',
            background: manage ? '#e7f1ff' : '#fff',
            border: '1px solid #cfe2ff',
          }}
          title="カテゴリの並び替え・削除"
        >
          🛠 カテゴリ管理 {manage ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* 通常ビュー */}
      {!isTrashView && !manage && (
        <>
          <div style={{ marginBottom: 10 }}>
            <input
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="検索（タイトル/本文）"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd' }}
            />
          </div>

          {/* カテゴリ選択（件数付き） */}
          <div style={{ marginBottom: 10 }}>
            <select
              value={currentCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd' }}
            >
              <option value="">（すべてのカテゴリ）</option>
              <option value="">{`未分類（${count('')}）`}</option>
              {categories.map((c, i) => (
                <option key={`${c}-${i}`} value={c}>
                  {`${label(c)}（${count(c)}）`}
                </option>
              ))}
            </select>
          </div>

          {/* メモ一覧（長文でもボタンは潰れない） */}
          <div>
            {memos.length === 0 ? (
              <div style={{ color: '#999', fontSize: 13 }}>このカテゴリにはメモがありません。</div>
            ) : (
              memos.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    background: '#fff',
                    border: '1px solid #eaeaea',
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div
                      onClick={() => onSelectMemo(m.id)}
                      style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {m.title || '(タイトルなし)'}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#666',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {m.content || '（内容なし）'}
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        <span
                          style={{
                            padding: '1px 6px',
                            borderRadius: 999,
                            background: '#f0f0f0',
                            border: '1px solid #e5e5e5',
                          }}
                        >
                          {label(m.category)}
                        </span>
                        {m.pinned ? <span style={{ marginLeft: 6 }}>📌</span> : null}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => onTogglePin(m.id)}
                        title={m.pinned ? 'ピン解除' : 'ピン留め'}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid #ddd',
                          background: m.pinned ? '#fff7d1' : '#fff',
                        }}
                      >
                        📌
                      </button>
                      <button
                        onClick={() => onTrash(m.id)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid #f1c0c0',
                          background: '#ffecec',
                          color: '#b50000',
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

   

      {/* 管理モード：ドラッグで並び替え & 削除（カスタムカテゴリのみ） */}
      {!isTrashView && manage && (
        <div>
          <div style={{ marginBottom: 8, color: '#555' }}>
            ドラッグして順序変更／🗑で削除（未分類は対象外）
          </div>
          {customCategories.length === 0 && (
            <div style={{ color: '#999', fontSize: 13 }}>カスタムカテゴリがありません。</div>
          )}
          <div style={{ display: 'grid', gap: 6 }}>
            {customCategories.map((c, i) => (
              <div
                key={`${c}-${i}`}
                draggable
                onDragStart={(e) => onDragStart(e, i)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: '#fff',
                  border: '1px solid #e5e5e5',
                  cursor: 'grab',
                }}
                title="ドラッグで並び替え"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>⠿</span>
                  <span>{label(c)}</span>
                  <span style={{ fontSize: 12, color: '#888' }}>（{count(c)}）</span>
                </div>
                <button
                  onClick={() => onDeleteCategory(c)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid #f1c0c0',
                    background: '#ffecec',
                    color: '#b50000',
                  }}
                  title="カテゴリを削除"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
