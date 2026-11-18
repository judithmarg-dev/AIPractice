import { useEffect, useState } from 'react'
import { CELL, loadScoopUrl, type ScoopSprite as Sprite } from '@/lib/scoopSprites'

interface ScoopSpriteProps {
  sprite: Sprite
  className?: string
  style?: React.CSSProperties
}

/** One scoop cut out of the sprite sheet. Renders nothing visible until the cut-out is ready. */
export function ScoopSprite({ sprite, className, style }: ScoopSpriteProps) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    loadScoopUrl(sprite).then((u) => live && setUrl(u))
    return () => {
      live = false
    }
  }, [sprite])

  return (
    <img
      className={className}
      src={url ?? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
      alt=""
      width={CELL.w}
      height={CELL.h}
      draggable={false}
      style={{ ...style, aspectRatio: `${CELL.w} / ${CELL.h}` }}
    />
  )
}
