// Reusable Card component
// Wraps content in a rounded, shadowed white card

export default function Card({ children, className = '', onClick, padding = true }) {
  const base = [
    'bg-white rounded-2xl shadow-[0_1px_6px_0_rgba(0,0,0,0.08)]',
    padding ? 'p-4' : '',
    onClick ? 'cursor-pointer hover:shadow-[0_4px_16px_0_rgba(0,0,0,0.10)] transition-shadow duration-150 active:scale-[0.99]' : '',
    className,
  ].join(' ');

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && onClick(e)}
        className={base}
      >
        {children}
      </div>
    );
  }

  return <div className={base}>{children}</div>;
}
