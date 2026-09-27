import {
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

export const ToastContext = createContext(null);

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
    );
  }, []);

  const addToast = useCallback(
    ({
      title,
      message = "",
      type = "success",
      duration = 3500,
    }) => {
      const id = generateId();

      setToasts((current) => [
        ...current,
        {
          id,
          title,
          message,
          type,
        },
      ]);

      if (duration > 0) {
        window.setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,

      success: (title, message) =>
        addToast({
          title,
          message,
          type: "success",
        }),

      error: (title, message) =>
        addToast({
          title,
          message,
          type: "error",
        }),

      info: (title, message) =>
        addToast({
          title,
          message,
          type: "info",
        }),

      warning: (title, message) =>
        addToast({
          title,
          message,
          type: "warning",
        }),
    }),
    [toasts, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};