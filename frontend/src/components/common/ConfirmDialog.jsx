import { TriangleAlert } from "lucide-react";
import Modal from "./Modal";

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      icon={TriangleAlert}
      size="sm"
    >
      <div className="confirm-dialog__actions">
        <button
          type="button"
          className="interaction-btn interaction-btn--secondary"
          onClick={onClose}
        >
          {cancelText}
        </button>

        <button
          type="button"
          className={`interaction-btn ${
            danger
              ? "interaction-btn--danger"
              : "interaction-btn--primary"
          }`}
          onClick={() => {
            onConfirm?.();
            onClose();
          }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;