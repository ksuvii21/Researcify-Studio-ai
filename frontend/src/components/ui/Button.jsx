import "./Button.css";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      className={`ui-button ui-button--${variant} ui-button--${size} ${className}`}
      {...props}
    >
      {Icon && iconPosition === "left" && (
        <Icon className="ui-button__icon" />
      )}

      <span>{children}</span>

      {Icon && iconPosition === "right" && (
        <Icon className="ui-button__icon" />
      )}
    </button>
  );
};

export default Button;