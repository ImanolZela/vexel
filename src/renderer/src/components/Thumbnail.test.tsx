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
})
