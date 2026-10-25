import { Modal } from './Modal'
import { Button } from './Button'
import { useTranslation } from '../../i18n'

// Reusable confirmation dialog for destructive actions.
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  loading = false,
}) {
  const { t } = useTranslation()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="text" onClick={onClose} disabled={loading}>
            {cancelLabel ?? t('common.cancel')}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? t('common.processing') : confirmLabel ?? t('common.delete')}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-on-surface-variant">{message}</p>
    </Modal>
  )
}
