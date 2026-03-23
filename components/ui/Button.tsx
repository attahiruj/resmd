import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent hover:bg-accent-hover text-accent-text focus-visible:ring-accent',
  secondary:
    'bg-surface-2 border border-border hover:bg-surface-3 text-text focus-visible:ring-border-strong',
  ghost:
    'text-muted hover:text-text hover:bg-surface-2 focus-visible:ring-border-strong',
  danger: 'text-danger hover:bg-danger-bg focus-visible:ring-danger',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', className = '', children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-1.5 font-medium rounded-lg
          transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2
          disabled:opacity-40 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
