// EmptyState — shown when a list/section has no items

export default function EmptyState({ emoji = '📭', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-6xl mb-4">{emoji}</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      {subtitle && (
        <p className="text-gray-500 text-sm mb-6 max-w-xs">{subtitle}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
