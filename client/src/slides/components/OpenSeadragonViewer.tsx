import OpenSeadragon from 'openseadragon'
import { useEffect, useRef } from 'react'

type OpenSeadragonViewerProps = {
  dziUrl: string
  getTileUrl: (level: number, col: number, row: number) => string
  useAuth?: boolean
}

type DziMetadata = {
  width: number
  height: number
  tileSize: number
  overlap: number
}

async function fetchDziMetadata(dziUrl: string, useAuth: boolean): Promise<DziMetadata> {
  const token = localStorage.getItem('access_token')
  const response = await fetch(dziUrl, {
    headers: useAuth && token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  if (!response.ok) throw new Error(`Unable to load slide metadata: ${response.status}`)

  const xml = await response.text()
  const document = new DOMParser().parseFromString(xml, 'application/xml')
  const image = document.querySelector('Image')
  const size = document.querySelector('Size')

  if (!image || !size) throw new Error('Invalid DZI metadata')

  return {
    width: Number(size.getAttribute('Width')),
    height: Number(size.getAttribute('Height')),
    tileSize: Number(image.getAttribute('TileSize')),
    overlap: Number(image.getAttribute('Overlap')),
  }
}

export default function OpenSeadragonViewer({
  dziUrl,
  getTileUrl,
  useAuth = true,
}: OpenSeadragonViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let isMounted = true
    const token = localStorage.getItem('access_token')
    let viewer: ReturnType<typeof OpenSeadragon> | null = null

    fetchDziMetadata(dziUrl, useAuth)
      .then((metadata) => {
        if (!containerRef.current || !isMounted) return

        viewer = OpenSeadragon({
          element: containerRef.current,
          prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.1/images/',
          tileSources: {
            width: metadata.width,
            height: metadata.height,
            tileSize: metadata.tileSize,
            tileOverlap: metadata.overlap,
            getTileUrl,
          },
          showNavigator: true,
          showRotationControl: true,
          animationTime: 0.4,
          blendTime: 0.1,
          constrainDuringPan: true,
          maxZoomPixelRatio: 2,
          minZoomImageRatio: 0.9,
          visibilityRatio: 1,
          loadTilesWithAjax: true,
          ajaxHeaders: useAuth && token ? { Authorization: `Bearer ${token}` } : undefined,
        })
      })
      .catch(() => {
        if (containerRef.current) {
          containerRef.current.textContent = 'Unable to load slide viewer.'
        }
      })

    return () => {
      isMounted = false
      viewer?.destroy()
    }
  }, [dziUrl, getTileUrl, useAuth])

  return (
    <div
      ref={containerRef}
      className="h-[72vh] min-h-[520px] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-sm"
    />
  )
}
