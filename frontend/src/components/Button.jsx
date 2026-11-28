export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`min-h-11 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40 ${variant === 'primary' ? 'bg-accent text-primary' : 'border border-primary bg-background'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
