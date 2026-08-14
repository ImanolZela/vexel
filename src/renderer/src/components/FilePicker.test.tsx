import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FilePicker from './FilePicker'

const CAT = { path: 'C:\\images\\cat.png', name: 'cat.png' }
const DOG = { path: 'C:\\images\\dog.png', name: 'dog.png' }

describe('FilePicker', () => {
  it('renders nothing when there is one file or none', () => {
    const { container, rerender } = render(
      <FilePicker files={[]} selectedPath="" onSelect={vi.fn()} />
    )
    expect(container).toBeEmptyDOMElement()

    rerender(<FilePicker files={[CAT]} selectedPath={CAT.path} onSelect={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lists every file and marks the selected one active', () => {
    render(<FilePicker files={[CAT, DOG]} selectedPath={DOG.path} onSelect={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'cat.png' })).toHaveAttribute('data-active', 'false')
    expect(screen.getByRole('button', { name: 'dog.png' })).toHaveAttribute('data-active', 'true')
  })

  it('calls onSelect with the clicked file path', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<FilePicker files={[CAT, DOG]} selectedPath={CAT.path} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'dog.png' }))

    expect(onSelect).toHaveBeenCalledWith(DOG.path)
  })
})
