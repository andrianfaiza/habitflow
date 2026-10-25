import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { ColorPicker } from '../common/ColorPicker'
import { useTranslation } from '../../i18n'
import { DEFAULT_HABIT_COLOR } from '../../utils/constants'

const EMPTY_FORM = {
  name: '',
  description: '',
  target: '1',
  unit: '',
  color: DEFAULT_HABIT_COLOR,
}

// Builds the initial form state from an optional habit.
function buildForm(habit) {
  if (!habit) return EMPTY_FORM
  return {
    name: habit.name ?? '',
    description: habit.description ?? '',
    target: String(habit.target ?? 1),
    unit: habit.unit ?? '',
    color: habit.color ?? DEFAULT_HABIT_COLOR,
  }
}

// Modal form used to create and edit a habit.
export function HabitForm({ open, onClose, onSubmit, initialHabit = null }) {
  const { t } = useTranslation()
  // The parent remounts this component (via `key`) each time it opens, so the
  // state can be initialized directly from the habit being edited.
  const [form, setForm] = useState(() => buildForm(initialHabit))
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError(t('habits.form.nameRequired'))
      return
    }
    const target = Number.parseInt(form.target, 10)
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim() || null,
        target: Number.isNaN(target) || target < 1 ? 1 : target,
        unit: form.unit.trim() || null,
        color: form.color,
      })
      onClose()
    } catch (err) {
      setError(err.message ?? t('habits.form.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialHabit ? t('habits.form.editTitle') : t('habits.form.addTitle')}
      footer={
        <>
          <Button variant="text" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="habit-form" disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </>
      }
    >
      <form id="habit-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label={t('habits.form.name')}
          placeholder={t('habits.form.namePlaceholder')}
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          autoFocus
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="habit-description" className="text-sm font-medium text-on-surface-variant">
            {t('habits.form.description')}
          </label>
          <textarea
            id="habit-description"
            rows={2}
            className="m3-field resize-none"
            placeholder={t('habits.form.descriptionPlaceholder')}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('habits.form.dailyTarget')}
            type="number"
            min="1"
            value={form.target}
            onChange={(e) => update('target', e.target.value)}
          />
          <Input
            label={t('habits.form.unit')}
            placeholder={t('habits.form.unitPlaceholder')}
            value={form.unit}
            onChange={(e) => update('unit', e.target.value)}
          />
        </div>
        <ColorPicker
          label={t('habits.form.color')}
          value={form.color}
          onChange={(color) => update('color', color)}
        />
        {error ? <p className="text-sm text-error">{error}</p> : null}
      </form>
    </Modal>
  )
}
