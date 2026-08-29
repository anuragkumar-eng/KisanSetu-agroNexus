// Reusable Badge component — small inline label chips

const variantClasses = {
  green:  'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red:    'bg-red-100 text-red-600',
  blue:   'bg-blue-100 text-blue-700',
  gray:   'bg-gray-100 text-gray-600',
  orange: 'bg-orange-100 text-orange-700',
};

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span
      className={[
        'inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variantClasses[variant] || variantClasses.gray,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
