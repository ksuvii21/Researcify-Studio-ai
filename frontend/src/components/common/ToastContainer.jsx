import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";

import useToast from "../../hooks/useToast";

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div
      className="toast-container"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;

        return (
          <div
            key={toast.id}
            className={`app-toast app-toast--${toast.type}`}
          >
            <div className="app-toast__icon">
              <Icon size={17} />
            </div>

            <div className="app-toast__content">
              <strong>{toast.title}</strong>

              {toast.message && (
                <p>{toast.message}</p>
              )}
            </div>

            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => removeToast(toast.id)}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;