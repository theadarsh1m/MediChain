import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  isOpen,
  title = "Confirm Action",
  description = "Are you sure you want to perform this action?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <Modal title={title} description={description} onClose={onCancel} className="max-w-md">
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={isDestructive ? "danger" : "primary"}
          onClick={onConfirm}
          disabled={loading}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
