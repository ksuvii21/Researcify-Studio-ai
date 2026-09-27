const AuthInput = ({
  id,
  label,
  icon: Icon,
  error,
  hint,
  required = false,
  ...props
}) => {
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
        {Icon && (
          <Icon
            className="auth-field__icon"
            size={16}
          />
        )}

        <input
          id={id}
          aria-invalid={Boolean(error)}
          {...props}
        />
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

export default AuthInput;