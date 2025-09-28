import type { Memo } from '../App';
import MemoItem from './MemoItem';


interface Props {
memos: Memo[];
onDelete: (id: number) => void;
onEdit: (memo: Memo) => void;
editingMemo: Memo | null; 
  onCancelEdit: () => void; 
  onSave: (title: string, content: string, category: string) => void
}


const MemoList = ({ memos, onDelete, onEdit }: Props) => (
<div>
{memos.length === 0 ? (
<p>メモはありません。</p>
) : (
memos.map((memo) => (
<MemoItem
key={memo.id}
memo={memo}
onDelete={onDelete}
onEdit={onEdit}
/>
))
)}
</div>
);


export default MemoList;