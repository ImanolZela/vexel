export function suggestedSvgFileName(sourceName: string): string {
  const baseName = sourceName.replace(/\.[^./\\]+$/, '')
  return `${baseName}.svg`
}
