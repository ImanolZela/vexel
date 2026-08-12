import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'pill'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  active?: boolean
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'w-fit rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg disabled:opacity-60',
  pill: 'rounded-full border border-text-secondary/30 px-3 py-1 text-sm text-text-secondary data-[active=true]:border-accent data-[active=true]:text-text'
}

function Button({
  variant = 'primary',
  active,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps): React.JSX.Element {
  return (
    <button
      type={type}
      data-active={active}
      className={`cursor-pointer transition-colors ${VARIANT_CLASSES[variant]} ${className}`.trim()}
      {...rest}
    />
  )
}

export default Button
