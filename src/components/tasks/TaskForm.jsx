import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { ColorPicker } from '../common/ColorPicker'
import { DEFAULT_TASK_COLOR, PRIORITY_OPTIONS } from '../../utils/constants'

const EMPTY_FORM = {
  title: '',
  description: '',
  priority: 'medium',
  color: DEFAULT_TASK_COLOR,
  due_date: '',
  due_time: '',
}

// Builds the initial form state from an optional task.
function buildForm(task) {
  if (!task) return EMPTY_FORM
  return {
    title: task.title ?? '',
    description: task.description ?? '',
    priority: task.priority ?? 'medium',
    color: task.color ?? DEFAULT_TASK_COLOR,
    due_date: task.due_date ?? '',
    due_time: task.due_time ?? '',
  }
}

// Modal form used to create and edit a task.
export function TaskForm({ open, onClose, onSubmit, initialTask = null, defaultDate = '' }) {
  // The parent remounts this component (via `key`) each time it opens, so the
  // state can be initialized directly from the task being edited.
  const [form, setForm] = useState(() => {
    const base = buildForm(initialTask)
    // Pre-fill the due date with the currently selected calendar day.
    return initialTask ? base : { ...base, due_date: defaultDate || '' }
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('Judul tugas wajib diisi.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        color: form.color,
        due_date: form.due_date || null,
        due_time: form.due_time || null,
      })
      onClose()
    } catch (err) {
      setError(err.message ?? 'Gagal menyimpan tugas.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialTask ? 'Edit Tugas' : 'Tambah Tugas'}
      footer={
        <>
          <Button variant="text" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="task-form" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Judul"
          placeholder="Contoh: Kirim laporan mingguan"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          autoFocus
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-description" className="text-sm font-medium text-on-surface-variant">
            Deskripsi
          </label>
          <textarea
            id="task-description"
            rows={3}
            className="m3-field resize-none"
            placeholder="Detail singkat (opsional)"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-priority" className="text-sm font-medium text-on-surface-variant">
            Prioritas
          </label>
          <select
            id="task-priority"
            className="m3-field"
            value={form.priority}
            onChange={(e) => update('priority', e.target.value)}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <ColorPicker
          label="Warna tugas"
          value={form.color}
          onChange={(color) => update('color', color)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Tanggal jatuh tempo"
            type="date"
            value={form.due_date}
            onChange={(e) => update('due_date', e.target.value)}
          />
          <Input
            label="Waktu tenggat"
            type="time"
            value={form.due_time}
            onChange={(e) => update('due_time', e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-error">{error}</p> : null}
      </form>
    </Modal>
  )
}
