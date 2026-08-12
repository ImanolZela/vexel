import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('shows Convertir by default', () => {
    render(<App />)
    expect(screen.getByTestId('screen-convert')).toBeInTheDocument()
  })

  it('switches to Vectorizar when its nav item is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Vectorizar' }))

    expect(screen.getByTestId('screen-vectorize')).toBeInTheDocument()
    expect(screen.queryByTestId('screen-convert')).not.toBeInTheDocument()
  })

  it('switches to Mejorar when its nav item is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Mejorar' }))

    expect(screen.getByTestId('screen-enhance')).toBeInTheDocument()
  })
})
