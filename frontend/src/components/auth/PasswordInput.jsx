import {
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";

import { useState } from "react";

const PasswordInput = ({
  id,
  label = "Password",
  error,
  hint,
  required = false,
  ...props
}) => {
  const [visible, setVisible] =
    useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={id}>
        {label}

        {required && (
          <span className="auth-field__required">
            *
          </span>
        )}
      </label>

      <div
        className={`auth-field__control ${
          error ? "auth-field__control--error" : ""
        }`}
      >
        <LockKeyhole
          className="auth-field__icon"
          size={16}
        />

        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          {...props}
        />

        <button
          type="button"
          className="auth-field__password-toggle"
          onClick={() =>
            setVisible((current) => !current)
          }
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
        >
          {visible ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>
      </div>

      {error ? (
        <small className="auth-field__error">
          {error}
        </small>
      ) : hint ? (
        <small className="auth-field__hint">
          {hint}
        </small>
      ) : null}
    </div>
  );
};

export default PasswordInput;