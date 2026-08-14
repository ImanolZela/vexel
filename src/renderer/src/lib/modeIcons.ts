import type { Mode } from '../types/mode'
import { ConvertIcon, EnhanceIcon, VectorizeIcon } from '../components/icons'

interface IconProps {
  className?: string
}

// One place mapping each mode to its icon, so the sidebar nav and each
// screen's own empty state stay visually tied together instead of drifting.
// Kept out of icons.tsx itself so that file only exports components, which
// Fast Refresh requires for hot reload to work.
export const MODE_ICONS: Record<Mode, (props: IconProps) => React.JSX.Element> = {
  convert: ConvertIcon,
  vectorize: VectorizeIcon,
  enhance: EnhanceIcon
}
