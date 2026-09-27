import "./SectionHeader.css";

const SectionHeader = ({
  title,
  subtitle,
  actions,
  className = "",
}) => {
  return (
    <div className={`section-header ${className}`}>
      <div>
        <h2>{title}</h2>

        {subtitle && (
          <p>{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="section-header__actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;