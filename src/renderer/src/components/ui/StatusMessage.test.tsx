import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StatusMessage from './StatusMessage'

describe('StatusMessage', () => {
  it('renders success tone with the convert accent color', () => {
    render(<StatusMessage tone="success">Guardado en out.png</StatusMessage>)

    expect(screen.getByText('Guardado en out.png')).toHaveClass('text-convert')
  })

  it('renders error tone with the vectorize accent color', () => {
    render(<StatusMessage tone="error">boom</StatusMessage>)

    expect(screen.getByText('boom')).toHaveClass('text-vectorize')
  })

  it('renders info tone with the secondary text color', () => {
    render(<StatusMessage tone="info">Cargando…</StatusMessage>)

    expect(screen.getByText('Cargando…')).toHaveClass('text-text-secondary')
  })
})
