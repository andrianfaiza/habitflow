import { Modal } from './Modal'
import { Button } from './Button'

// Reusable confirmation dialog for destructive actions.
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="text" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? 'Memproses...' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-on-surface-variant">{message}</p>
    </Modal>
  )
}
