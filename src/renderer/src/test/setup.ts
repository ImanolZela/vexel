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
      convertImage: vi.fn().mockResolvedValue({ ok: true }),
      getThumbnail: vi.fn().mockResolvedValue(null),
      vectorizeImage: vi.fn().mockResolvedValue({ ok: true, svg: '<svg></svg>' }),
      writeTextFile: vi.fn().mockResolvedValue({ ok: true }),
      enhanceImage: vi.fn().mockResolvedValue({ ok: true }),
      enhancePreview: vi
        .fn()
        .mockResolvedValue({ ok: true, thumbnail: 'data:image/webp;base64,abc' }),
      showInFolder: vi.fn().mockResolvedValue(undefined),
      getHistory: vi.fn().mockResolvedValue([]),
      addHistoryEntry: vi.fn().mockResolvedValue([]),
      removeHistoryEntry: vi.fn().mockResolvedValue([]),
      clearHistory: vi.fn().mockResolvedValue(undefined),
      getSettings: vi.fn().mockResolvedValue({ defaultDownloadDir: null }),
      updateSettings: vi.fn().mockResolvedValue({ defaultDownloadDir: null })
    }
  })
}
