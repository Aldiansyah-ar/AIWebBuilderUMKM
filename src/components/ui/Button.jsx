/**
 * Button — UI Primitive
 *
 * Props:
 *   variant   : "primary" | "secondary" | "whatsapp" | "outline"
 *   size      : "sm" | "md" | "lg"
 *   href      : string  — renders as <a> if provided
 *   onClick   : fn
 *   className : string
 *   children  : node
 *   disabled  : bool
 */

const variantClasses = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
  secondary:
    'bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-400',
  whatsapp:
    'bg-[#25d366] text-white hover:bg-[#128c4a] focus-visible:ring-green-400',
  outline:
    'border-2 border-current text-inherit bg-transparent hover:bg-white/10 focus-visible:ring-current',
}

const sizeClasses = {
  sm:  'px-4 py-2 text-sm gap-1.5',
  md:  'px-6 py-3 text-base gap-2',
  lg:  'px-8 py-4 text-lg gap-2.5',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className = '',
  children,
  disabled = false,
  ...rest
}) {
  const base = [
    'inline-flex items-center justify-center font-semibold rounded-full',
    'transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'active:scale-[0.97]',
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
    variantClasses[variant] ?? variantClasses.primary,
    sizeClasses[size] ?? sizeClasses.md,
    className,
  ].join(' ')

  if (href) {
    // A disabled link-as-button must not stay a focusable/activatable <a> —
    // pointer-events-none only blocks mouse clicks, keyboard users and
    // screen readers could still "activate" it (see GitHub issue #10).
    // Render a real disabled <button> instead so the disabled state is
    // native and unambiguous.
    if (disabled) {
      return (
        <button type="button" disabled className={base} {...rest}>
          {children}
        </button>
      )
    }
    return (
      <a href={href} className={base} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={base} {...rest}>
      {children}
    </button>
  )
}
