import { X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
} from "react";

const Modal = ({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  size = "md",
  closeOnBackdrop = true,
}) => {
  const titleId = useId();
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    window.setTimeout(() => {
      modalRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="app-modal-backdrop"
      onMouseDown={(event) => {
        if (
          closeOnBackdrop &&
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        ref={modalRef}
        className={`app-modal app-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="app-modal__header">
          <div className="app-modal__heading">
            {Icon && (
              <div className="app-modal__icon">
                <Icon size={18} />
              </div>
            )}

            <div>
              <h2 id={titleId}>{title}</h2>

              {description && (
                <p>{description}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            className="app-modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={17} />
          </button>
        </header>

        <div className="app-modal__body">
          {children}
        </div>
      </section>
    </div>
  );
};

export default Modal;