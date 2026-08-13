import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Thumbnail from './Thumbnail'

describe('Thumbnail', () => {
  beforeEach(() => {
    vi.mocked(window.api.getThumbnail).mockReset()
  })

  it('renders nothing while there is no data url', () => {
    vi.mocked(window.api.getThumbnail).mockResolvedValue(null)
    render(<Thumbnail path="cat.png" alt="cat" />)

    expect(screen.queryByAltText('cat')).not.toBeInTheDocument()
  })

  it('renders the image once the thumbnail resolves', async () => {
    vi.mocked(window.api.getThumbnail).mockResolvedValue('data:image/webp;base64,abc')
    render(<Thumbnail path="cat.png" alt="cat" />)

    const img = await screen.findByAltText('cat')
    expect(img).toHaveAttribute('src', 'data:image/webp;base64,abc')
  })

  it('does not request a thumbnail when there is no path', () => {
    render(<Thumbnail path={null} alt="cat" />)

    expect(window.api.getThumbnail).not.toHaveBeenCalled()
  })

  it('defaults to the small size and grows with the size prop', async () => {
    vi.mocked(window.api.getThumbnail).mockResolvedValue('data:image/webp;base64,abc')
    const { rerender } = render(<Thumbnail path="cat.png" alt="cat" />)

    const img = await screen.findByAltText('cat')
    expect(img.parentElement).toHaveClass('h-12', 'w-12')

    rerender(<Thumbnail path="cat.png" alt="cat" size="lg" />)
    expect(img.parentElement).toHaveClass('h-24', 'w-24')
  })
})
