import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const ErrorState = ({
  title = "Something went wrong",
  message = "We couldn't load this content.",
  onRetry,
}) => {
  return (
    <div className="error-state">

      <AlertCircle size={36} />

      <h3>{title}</h3>

      <p>{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
        >
          <RefreshCw size={16} />

          Try Again
        </button>
      )}

    </div>
  );
};

export default ErrorState;