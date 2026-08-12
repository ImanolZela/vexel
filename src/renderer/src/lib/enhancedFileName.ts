export function suggestedEnhancedFileName(sourceName: string): string {
  const match = sourceName.match(/^(.*)(\.[^./\\]+)$/)
  if (!match) return `${sourceName}-mejorado`
  const [, baseName, extension] = match
  return `${baseName}-mejorado${extension}`
}
