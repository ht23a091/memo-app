import { useState, useEffect } from 'react';


interface Props {
onAdd: (title: string, content: string, category: string) => void;
editingMemo: {
id: number;
title: string;
content: string;
category: string;
} | null;
onCancelEdit: () => void;
}


const MemoInput = ({ onAdd, editingMemo, onCancelEdit }: Props) => {
const [title, setTitle] = useState('');
const [content, setContent] = useState('');
const [category, setCategory] = useState('');


useEffect(() => {
if (editingMemo) {
setTitle(editingMemo.title);
setContent(editingMemo.content);
setCategory(editingMemo.category);
} else {
setTitle('');
setContent('');
setCategory('');
}
}, [editingMemo]);


const handleSubmit = (e: React.FormEvent) => {
e.preventDefault();
if (!title.trim() && !content.trim()) return;
onAdd(title, content, category);
setTitle('');
setContent('');
setCategory('');
};


return (
<form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
<input
type="text"
placeholder="タイトル"
value={title}
onChange={(e) => setTitle(e.target.value)}
style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
/>
<textarea
placeholder="メモの内容"
value={content}
onChange={(e) => setContent(e.target.value)}
style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
/>
<input
type="text"
placeholder="カテゴリ (任意)"
value={category}
onChange={(e) => setCategory(e.target.value)}
style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
/>
<button type="submit">{editingMemo ? '更新' : '追加'}</button>
{editingMemo && <button type="button" onClick={onCancelEdit}>キャンセル</button>}
</form>
);
};


export default MemoInput;