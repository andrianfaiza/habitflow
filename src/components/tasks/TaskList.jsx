import { ClipboardList, Plus } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { EmptyState } from '../common/EmptyState'
import { Loader } from '../common/Loader'
import { Button } from '../common/Button'

// Renders the task list, with loading and empty states.
export function TaskList({ tasks, loading, onToggle, onEdit, onDelete, onAdd }) {
  if (loading) return <Loader label="Memuat tugas..." />

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Belum ada tugas hari ini"
        description="Yuk buat tugas pertamamu agar harimu lebih teratur!"
        action={
          <Button size="sm" icon={Plus} onClick={onAdd}>
            Tambah Tugas
          </Button>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
