import type { Memo } from '../App';


interface Props {
memo: Memo;
onDelete: (id: number) => void;
onEdit: (memo: Memo) => void;
}


const MemoItem = ({ memo, onDelete, onEdit }: Props) => (
<div
onClick={() => onEdit(memo)}
style={{
border: '1px solid #ccc',
padding: '0.5rem',
marginBottom: '0.5rem',
cursor: 'pointer'
}}
>
<h3>{memo.title || '(タイトルなし)'}</h3>
<p>{memo.content}</p>
<small>カテゴリ: {memo.category || 'なし'}</small>
<br />
<button onClick={(e) => { e.stopPropagation(); onDelete(memo.id); }}>削除</button>
</div>
);


export default MemoItem;