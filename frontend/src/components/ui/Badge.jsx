import "./Badge.css";

const Badge = ({
  children,
  variant = "default",
  className = "",
}) => {
  return (
    <span className={`ui-badge ui-badge--${variant} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;