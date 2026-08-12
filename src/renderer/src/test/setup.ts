import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'api', {
    writable: true,
    value: {
      openFiles: vi.fn().mockResolvedValue([]),
      saveFile: vi.fn().mockResolvedValue(null),
      chooseDirectory: vi.fn().mockResolvedValue(null),
      getPathForFile: vi.fn((file: File) => file.name),
      joinPath: vi.fn((...segments: string[]) => segments.join('/')),
      convertImage: vi.fn().mockResolvedValue({ ok: true })
    }
  })
}
