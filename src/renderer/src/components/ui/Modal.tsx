import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

// Shared overlay/backdrop/close-button chrome for the history and settings
// panels — anything triggered from the sidebar rather than living inside a
// mode screen.
function Modal({ title, onClose, children }: ModalProps): React.JSX.Element {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-10 flex items-center justify-center bg-bg/70 p-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border border-text-secondary/10 bg-surface shadow-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-text-secondary/10 px-5 py-4">
          <h2 className="m-0 text-lg font-semibold text-text">{title}</h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="cursor-pointer rounded-md px-2 py-1 text-lg text-text-secondary hover:bg-text-secondary/10 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mode-accent)]"
          >
            ×
          </button>
        </div>
        <div className="flex flex-col gap-3 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

export default Modal
