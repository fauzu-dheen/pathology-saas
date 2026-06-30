import OpenSeadragon from 'openseadragon'
import { Home, Maximize2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

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
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewerRef = useRef<ReturnType<typeof OpenSeadragon> | null>(null)
  const [isSlideVisible, setIsSlideVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let isMounted = true
    const token = localStorage.getItem('access_token')
    let viewer: ReturnType<typeof OpenSeadragon> | null = null
    setIsSlideVisible(false)
    setError(null)

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
          showNavigationControl: false,
          showRotationControl: false,
          imageLoaderLimit: 4,
          animationTime: 0.4,
          blendTime: 0.1,
          constrainDuringPan: true,
          maxZoomPixelRatio: 2,
          minZoomImageRatio: 0.9,
          visibilityRatio: 1,
          loadTilesWithAjax: true,
          ajaxHeaders: useAuth && token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        viewerRef.current = viewer
        viewer.addOnceHandler('tile-loaded', () => {
          if (isMounted) setIsSlideVisible(true)
        })
        viewer.addOnceHandler('open', () => {
          window.setTimeout(() => {
            if (isMounted) setIsSlideVisible(true)
          }, 600)
        })
        viewer.addOnceHandler('tile-load-failed', () => {
          if (isMounted) setError('Unable to load slide tiles.')
        })
      })
      .catch(() => {
        if (isMounted) setError('Unable to load slide viewer.')
      })

    return () => {
      isMounted = false
      viewerRef.current = null
      viewer?.destroy()
    }
  }, [dziUrl, getTileUrl, useAuth])

  const zoomBy = useCallback((factor: number) => {
    const viewport = viewerRef.current?.viewport
    if (!viewport) return
    viewport.zoomBy(factor)
    viewport.applyConstraints()
  }, [])

  const goHome = useCallback(() => {
    viewerRef.current?.viewport.goHome()
  }, [])

  const rotate = useCallback(() => {
    const viewport = viewerRef.current?.viewport
    if (!viewport) return
    viewport.setRotation((viewport.getRotation() + 90) % 360)
  }, [])

  const toggleFullScreen = useCallback(() => {
    const element = wrapperRef.current
    if (!element) return

    if (document.fullscreenElement) {
      void document.exitFullscreen()
      return
    }

    void element.requestFullscreen()
  }, [])

  const isReady = isSlideVisible && !error

  return (
    <div
      ref={wrapperRef}
      className="relative h-[72vh] min-h-[520px] w-full overflow-hidden rounded-md border border-[#cfe0e5] bg-[#082f3a] shadow-sm"
    >
      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute left-4 top-4 z-20 flex flex-col items-center gap-2 rounded-md border border-[#7dd3c7]/35 bg-[#101820]/92 p-1.5 shadow-lg shadow-black/25 backdrop-blur">
        <ViewerButton label="Zoom in" disabled={!isReady} onClick={() => zoomBy(1.4)}>
          <ZoomIn size={17} />
        </ViewerButton>
        <ViewerButton label="Zoom out" disabled={!isReady} onClick={() => zoomBy(0.72)}>
          <ZoomOut size={17} />
        </ViewerButton>
        <ViewerButton label="Reset view" disabled={!isReady} onClick={goHome}>
          <Home size={17} />
        </ViewerButton>
        <ViewerButton label="Rotate slide" disabled={!isReady} onClick={rotate}>
          <RotateCw size={17} />
        </ViewerButton>
        <ViewerButton label="Toggle fullscreen" onClick={toggleFullScreen}>
          <Maximize2 size={17} />
        </ViewerButton>
      </div>

      {!isSlideVisible && !error ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#082f3a]">
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[#7dd3c7]" />
            <div className="text-sm font-medium tracking-wide text-white/80">Preparing slide view</div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#082f3a] px-6 text-center">
          <div className="rounded-md border border-red-200/20 bg-red-950/40 px-5 py-4 text-sm font-medium text-red-50">
            {error}
          </div>
        </div>
      ) : null}
    </div>
  )
}

type ViewerButtonProps = {
  label: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

function ViewerButton({ label, disabled = false, onClick, children }: ViewerButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-md text-white/85 transition hover:bg-[#7dd3c7]/15 hover:text-[#d7fffa] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}
