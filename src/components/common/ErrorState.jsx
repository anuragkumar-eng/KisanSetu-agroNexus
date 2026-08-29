// ErrorState — shown when a data fetch or operation fails
// Props:
//   title    — main error message (Hindi preferred)
//   subtitle — optional detail / suggestion
//   onRetry  — optional callback; shows a "Try Again" button when provided

export default function ErrorState({
  title = 'कुछ गड़बड़ हो गई',
  subtitle = 'कृपया दोबारा कोशिश करें। / Please try again.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-red-600 mb-2">{title}</h3>
      {subtitle && (
        <p className="text-gray-500 text-sm mb-6 max-w-xs">{subtitle}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 active:bg-green-800 transition-colors"
        >
          दोबारा कोशिश करें / Retry
        </button>
      )}
    </div>
  );
}
