import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Spinner } from './spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner and blocks interaction. Keep the label visible. */
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-pasture-500 text-white hover:bg-pasture-600 disabled:bg-pasture-500',
  secondary: 'border border-stone-300 bg-white text-ink hover:bg-stone-100',
  ghost: 'text-ink hover:bg-stone-100',
  danger: 'bg-danger-500 text-white hover:bg-danger-700',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4',
};

/** The shared recipe, so a link that acts as a button looks identical to one. */
function buttonClassName(variant: Variant, size: Size, fullWidth?: boolean, className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth,
    className,
    children,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClassName(variant, size, fullWidth, className)}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : null}
      {children}
    </button>
  );
});

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

/**
 * A navigation presented as a button — "Add horse", "Back to horses". It stays
 * a real link, so it can be opened in a new tab and is announced as a link;
 * only the styling is shared with `Button`.
 */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClassName(variant, size, fullWidth, className)} {...props}>
      {children}
    </Link>
  );
}
