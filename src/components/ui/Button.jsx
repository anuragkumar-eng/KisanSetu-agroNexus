// Reusable Button component
// variants: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
// sizes: 'sm' | 'md' | 'lg'

const variantClasses = {
  primary:   'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm',
  secondary: 'bg-green-50 text-green-700 hover:bg-green-100 active:bg-green-200',
  danger:    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
  outline:   'border-2 border-green-600 text-green-700 hover:bg-green-50 active:bg-green-100 bg-white',
  ghost:     'text-green-700 hover:bg-green-50 active:bg-green-100 bg-transparent',
  warning:   'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 active:bg-yellow-600 shadow-sm',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-base rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-lg rounded-xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-semibold',
        'transition-colors duration-150 cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="text-xl leading-none">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
