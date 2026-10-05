export function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="spinner-row" role="status">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-box" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-small" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
