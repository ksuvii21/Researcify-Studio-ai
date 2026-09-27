import "./IconButton.css";

const IconButton = ({
  icon: Icon,
  label,
  active = false,
  className = "",
  ...props
}) => {
  return (
    <button
      type="button"
      className={`icon-button ${active ? "icon-button--active" : ""} ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon size={18} />
    </button>
  );
};

export default IconButton;