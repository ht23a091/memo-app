import type { Memo } from '../App';


interface Props {
categories: string[];
uncategorizedMemos: Memo[];
onSelect: (category: string) => void;
}


const Sidebar = ({ categories, uncategorizedMemos, onSelect }: Props) => (
<div
style={{
width: '200px',
background: '#f2f2f2',
padding: '1rem',
borderRight: '1px solid #ccc',
}}
>
<h2>カテゴリ</h2>
{categories.map((cat) => (
<div key={cat} onClick={() => onSelect(cat)} style={{ cursor: 'pointer' }}>
📁 {cat}
</div>
))}
<h2 style={{ marginTop: '1rem' }}>メモ一覧</h2>
{uncategorizedMemos.map((memo) => (
<div
key={memo.id}
onClick={() => onSelect('')}
style={{ cursor: 'pointer', paddingLeft: '0.5rem' }}
>
📝 {memo.title || '(タイトルなし)'}
</div>
))}
</div>
);


export default Sidebar;