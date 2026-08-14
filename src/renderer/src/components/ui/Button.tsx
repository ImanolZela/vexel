import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'pill'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  active?: boolean
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // Disabled buttons don't receive :hover from the browser at all, so this
  // doesn't need its own disabled guard.
  // bg/text via --mode-accent/--mode-on-accent (set on <main> per active
  // screen — see App.tsx): Convertir themes olive, Vectorizar terracota,
  // Mejorar stays neutral orange. Each mode's onAccent is whichever of
  // dark/light text actually clears WCAG AA against that mode's accent —
  // a single fixed color fails against at least one of the three.
  primary:
    'w-fit rounded-lg bg-[var(--mode-accent)] px-4 py-2 text-sm font-medium text-[var(--mode-on-accent)] hover:bg-[var(--mode-accent)]/85 disabled:opacity-60',
  // Filled (not just outlined) when active/selected — used for single-select
  // groups (format picker, enhance presets) where it should be obvious at a
  // glance which one is picked, not just a subtle border color change.
  pill: 'rounded-full border border-text-secondary/30 px-3 py-1 text-sm text-text-secondary hover:border-text-secondary/60 hover:text-text data-[active=true]:border-[var(--mode-accent)] data-[active=true]:bg-[var(--mode-accent)] data-[active=true]:text-[var(--mode-on-accent)]'
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
      className={`cursor-pointer transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mode-accent)] ${VARIANT_CLASSES[variant]} ${className}`.trim()}
      {...rest}
    />
  )
}

export default Button
