import { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MemoInput from './components/MemoInput';

export interface Memo {
  id: number;
  title: string;
  content: string;
  category: string;
  pinned?: boolean;
}
type SavingStatus = 'saved' | 'saving';
type WithDeletedAt = Memo & { deletedAt: number };

const LS = {
  memos: 'memos',
  selectedMemoId: 'selectedMemoId',
  selectedCategory: 'selectedCategory',
  customCategories: 'customCategories',
  trash: 'trash',
} as const;

const label = (c: string) => (c ? c : '未分類');

function App() {
  // 初期復元
  const [memos, setMemos] = useState<Memo[]>(() => {
    try {
      const s = localStorage.getItem(LS.memos);
      const loaded: Memo[] = s ? JSON.parse(s) : [];
      return loaded.length ? loaded : [{ id: Date.now(), title: '', content: '', category: '', pinned: false }];
    } catch {
      return [{ id: Date.now(), title: '', content: '', category: '', pinned: false }];
    }
  });
  const [selectedCategory, setSelectedCategory] = useState<string>(() => localStorage.getItem(LS.selectedCategory) ?? '');
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
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [isTrashView, setIsTrashView] = useState(false);
  const [saving, setSaving] = useState<SavingStatus>('saved');

  // 初期選択
  useEffect(() => {
    if (selectedMemoId == null && memos.length > 0) setSelectedMemoId(memos[0].id);
  }, [selectedMemoId, memos]);

  // 通常保存＋インジケータ
  useEffect(() => {
    setSaving('saving');
    const t = setTimeout(() => setSaving('saved'), 500);
    localStorage.setItem(LS.memos, JSON.stringify(memos));
    if (selectedMemoId != null) localStorage.setItem(LS.selectedMemoId, String(selectedMemoId));
    localStorage.setItem(LS.selectedCategory, selectedCategory);
    localStorage.setItem(LS.customCategories, JSON.stringify(customCategories));
    localStorage.setItem(LS.trash, JSON.stringify(trash));
    return () => clearTimeout(t);
  }, [memos, selectedMemoId, selectedCategory, customCategories, trash]);

  // 退出前バックアップ
  useEffect(() => {
    const backup = () => {
      try {
        localStorage.setItem(LS.memos, JSON.stringify(memos));
        if (selectedMemoId != null) localStorage.setItem(LS.selectedMemoId, String(selectedMemoId));
        localStorage.setItem(LS.selectedCategory, selectedCategory);
        localStorage.setItem(LS.customCategories, JSON.stringify(customCategories));
        localStorage.setItem(LS.trash, JSON.stringify(trash));
      } catch (e) {
        console.warn('Backup save failed:', e);
      }
    };
    const beforeUnloadHandler = () => backup();
    const visibilityHandler = () => { if (document.visibilityState === 'hidden') backup(); };
    window.addEventListener('beforeunload', beforeUnloadHandler);
    document.addEventListener('visibilitychange', visibilityHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, [memos, selectedMemoId, selectedCategory, customCategories, trash]);

  // CRUD
  const handleAddMemo = useCallback(() => {
    const newMemo: Memo = { id: Date.now(), title: '', content: '', category: selectedCategory, pinned: false };
    setMemos(prev => [newMemo, ...prev]);
    setSelectedMemoId(newMemo.id);
    setIsTrashView(false);
  }, [selectedCategory]);

  const handleUpdate = useCallback((updated: Memo) => {
    setMemos(prev => prev.map(m => (m.id === updated.id ? updated : m)));
  }, []);

  const handleTogglePin = useCallback((id: number) => {
    setMemos(prev => prev.map(m => (m.id === id ? { ...m, pinned: !m.pinned } : m)));
  }, []);

  const handleTrash = useCallback((id: number) => {
    setMemos(prev => {
      const target = prev.find(m => m.id === id);
      const next = prev.filter(m => m.id !== id);
      if (target) setTrash(t => [{ ...target, deletedAt: Date.now() }, ...t]);
      if (next.length === 0) {
        const fresh: Memo = { id: Date.now(), title: '', content: '', category: selectedCategory, pinned: false };
        setSelectedMemoId(fresh.id);
        return [fresh];
      }
      if (selectedMemoId === id) setSelectedMemoId(next[0].id);
      return next;
    });
  }, [selectedCategory, selectedMemoId]);

  const handleRestore = useCallback((id: number) => {
    setTrash(prevTrash => {
      const target = prevTrash.find(m => m.id === id);
      const nextTrash = prevTrash.filter(m => m.id !== id);
      if (target) {
        setMemos(prev => [{ ...target }, ...prev]);
        setSelectedMemoId(target.id);
        setIsTrashView(false);
      }
      return nextTrash;
    });
  }, []);

  const handleDeleteForever = useCallback((id: number) => {
    if (!confirm('このメモを完全に削除します。元に戻せません。よろしいですか？')) return;
    setTrash(prev => prev.filter(m => m.id !== id));
  }, []);

  const handleEmptyTrash = useCallback(() => {
    if (!confirm('ゴミ箱を空にします。元に戻せません。よろしいですか？')) return;
    setTrash([]);
  }, []);

  // カテゴリ追加
  const handleAddCategory = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCustomCategories(prev => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  }, []);

  // ★ カテゴリ並び替え（ドラッグ）
  const handleReorderCategory = useCallback((fromIndex: number, toIndex: number) => {
    setCustomCategories(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
  }, []);

  // ★ カテゴリ削除（再割当あり）
  const handleDeleteCategory = useCallback((name: string) => {
    if (!name) return; // ''（未分類）は削除不可
    const affected = memos.filter(m => m.category === name).length;

    // 未分類へ移動 OK?
    const okToUnassign = confirm(
      `カテゴリ「${name}」を削除します。\nこのカテゴリに属するメモは ${affected} 件あります。未分類（${label('')}）に移動してよろしいですか？\n\n「キャンセル」を選ぶと、移動先カテゴリを指定できます。`
    );

    let target = '';
    if (!okToUnassign) {
      const choices = ['', ...customCategories.filter(c => c !== name)];
      const display = choices.map(label).join(' / ');
      const input = prompt(`移動先カテゴリ名を入力してください（候補: ${display}）`, '');
      if (input != null && choices.map(label).includes(input)) {
        // 入力はラベル名（未分類 or 実名）の可能性があるので逆変換
        target = input === '未分類' ? '' : input;
      } else {
        // 不正入力は未分類へ
        target = '';
      }
    }

    // 実処理：メモの再割当 → カスタムカテゴリから削除 → 現在選択の調整
    setMemos(prev => prev.map(m => (m.category === name ? { ...m, category: target } : m)));
    setCustomCategories(prev => prev.filter(c => c !== name));
    if (selectedCategory === name) setSelectedCategory(target);
  }, [customCategories, memos, selectedCategory]);

  // 表示用：カテゴリ一覧＆件数
  const categories = useMemo(() => {
    const fromMemos = Array.from(new Set(memos.map(m => m.category).filter(Boolean)));
    const extras = customCategories.filter(c => !fromMemos.includes(c));
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

  // フィルタ & 並び順
  const filteredMemos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = memos.filter(m => {
      const matchCategory = selectedCategory ? m.category === selectedCategory : true;
      const matchQuery = q ? (m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q)) : true;
      return matchCategory && matchQuery;
    });
    return list.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.id - a.id);
  }, [memos, selectedCategory, searchQuery]);

  const selectedMemo = useMemo(() => memos.find(m => m.id === selectedMemoId) ?? null, [memos, selectedMemoId]);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Sidebar
        currentCategory={selectedCategory}
        categories={categories}
        categoryCounts={categoryCounts}
        customCategories={customCategories}
        memos={isTrashView ? [] : filteredMemos}
        trash={trash}
        isTrashView={isTrashView}
        onToggleTrashView={() => setIsTrashView(v => !v)}
        onSelectCategory={setSelectedCategory}
        onSelectMemo={(id) => { setSelectedMemoId(id); setIsTrashView(false); }}
        onAddMemo={handleAddMemo}
        onTrash={handleTrash}
        onRestore={handleRestore}
        onDeleteForever={handleDeleteForever}
        onEmptyTrash={handleEmptyTrash}
        onTogglePin={handleTogglePin}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onAddCategory={handleAddCategory}
        // ★ 追加
        onReorderCategory={handleReorderCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0 }}>📝 メモアプリ</h1>
          <div aria-live="polite" style={{ fontSize: 12, color: saving === 'saved' ? '#1a7f37' : '#555' }}>
            {saving === 'saved' ? '💾 Saved' : '⏳ Saving…'}
          </div>
        </div>

        {!isTrashView && selectedMemo && (
          <MemoInput
            selectedMemo={selectedMemo}
            categories={['', ...categories]}
            onUpdate={handleUpdate}
            onTrash={handleTrash}
            onTogglePin={handleTogglePin}
          />
        )}

        {isTrashView && (
          <div style={{ marginTop: 16 }}>
            <h2 style={{ marginTop: 0 }}>🗑️ ゴミ箱</h2>
            {trash.length === 0 ? (
              <div style={{ color: '#888' }}>ゴミ箱は空です。</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {trash.map(item => (
                  <div key={item.id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 10, background: '#fff' }}>
                    <div style={{ fontWeight: 600 }}>{item.title || '(タイトルなし)'}</div>
                    <div style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>{label(item.category)}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>削除日時: {new Date(item.deletedAt).toLocaleString()}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <button onClick={() => handleRestore(item.id)} style={{ padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>復元</button>
                      <button onClick={() => handleDeleteForever(item.id)} style={{ padding: '6px 10px', borderRadius: 8, cursor: 'pointer', background: '#ffecec', border: '1px solid #f1c0c0', color: '#b50000' }}>完全削除</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {trash.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <button onClick={handleEmptyTrash} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', background: '#fff3cd', border: '1px solid #ffe69c' }}>
                  ゴミ箱を空にする
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
