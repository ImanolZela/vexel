// Shared with places that render a preview from data already in hand (not
// a file path, e.g. EnhanceScreen's live preview) so their box stays sized
// consistently with the Thumbnail component instead of duplicating pixel
// values. Kept out of Thumbnail.tsx itself so that file only exports the
// component, which Fast Refresh requires for hot reload to work.
export const THUMBNAIL_SIZE_CLASSES = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-24 w-24'
} as const

export type ThumbnailSize = keyof typeof THUMBNAIL_SIZE_CLASSES
