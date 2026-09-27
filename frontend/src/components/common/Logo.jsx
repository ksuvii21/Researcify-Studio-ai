import { BookOpenText } from "lucide-react";
import "./Logo.css";

const Logo = ({
  showTagline = false,
  compact = false,
  className = "",
}) => {
  return (
    <div
      className={`brand-logo ${compact ? "brand-logo--compact" : ""} ${className}`}
    >
      <div className="brand-logo__mark">
        <BookOpenText size={20} strokeWidth={2} />
      </div>

      {!compact && (
        <div className="brand-logo__content">
          <strong>Researcify Studio</strong>

          {showTagline && (
            <span>Research. Organize. Discover.</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;