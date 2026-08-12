export interface EnhancePresetOptions {
  autoContrast: boolean
  denoise: boolean
  sharpen: boolean
  scale: number
}

export interface EnhancePreset {
  id: string
  label: string
  options: EnhancePresetOptions
}

export const ENHANCE_PRESETS: EnhancePreset[] = [
  {
    id: 'sharp',
    label: 'Nítido',
    options: { autoContrast: true, denoise: false, sharpen: true, scale: 1 }
  },
  {
    id: 'soft',
    label: 'Suave',
    options: { autoContrast: false, denoise: true, sharpen: false, scale: 1 }
  },
  {
    id: 'fast-upscale',
    label: 'Upscale rápido',
    options: { autoContrast: false, denoise: false, sharpen: true, scale: 2 }
  }
]
