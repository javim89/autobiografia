import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Color interpolation: #E8E9D6 (1 user) → #0015FF (MAX users)
const FROM = { r: 232, g: 233, b: 214 }
const TO   = { r: 0,   g: 21,  b: 255 }
const MAX_HOVER = parseInt(import.meta.env.VITE_MAP_HOVER_MAX ?? '20', 10)

function interpolateColor(count) {
  if (count <= 0) return `rgb(${FROM.r},${FROM.g},${FROM.b})`
  const t = Math.min(count / MAX_HOVER, 1)
  const r = Math.round(FROM.r + (TO.r - FROM.r) * t)
  const g = Math.round(FROM.g + (TO.g - FROM.g) * t)
  const b = Math.round(FROM.b + (TO.b - FROM.b) * t)
  return `rgb(${r},${g},${b})`
}

// Converts SVG coordinate space → current screen pixels using the live CTM.
// This works correctly regardless of screen size, zoom, or scroll.
function svgToScreen(svgEl, svgX, svgY) {
  const pt = svgEl.createSVGPoint()
  pt.x = svgX
  pt.y = svgY
  return pt.matrixTransform(svgEl.getScreenCTM())
}

function RemoteMapCursorDot({ svgX, svgY, color, getSvgEl }) {
  const [pos, setPos] = useState(null)

  useEffect(() => {
    const update = () => {
      const svgEl = getSvgEl()
      if (!svgEl) return
      try {
        const screen = svgToScreen(svgEl, svgX, svgY)
        setPos({ left: screen.x, top: screen.y })
      } catch (_) {}
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update)
    }
  }, [svgX, svgY, getSvgEl])

  if (!pos) return null
  return createPortal(
    <div className="remote-cursor" style={{ left: pos.left, top: pos.top }}>
      <div className="remote-cursor-dot" style={{ background: color }} />
    </div>,
    document.body
  )
}

export default function Map({ setMapHovering, mapHoverCount, sendMapCursor, remoteMapCursors }) {
  const containerRef = useRef(null)
  const [svgContent, setSvgContent] = useState(null)

  useEffect(() => {
    fetch('/mapa-buenos-aires.svg')
      .then(r => r.text())
      .then(text => setSvgContent(text))
  }, [])

  // Attach hover listeners to the TL path once SVG is loaded
  useEffect(() => {
    if (!svgContent) return
    const el = containerRef.current?.querySelector('#trenque-lauquen')
    if (!el) return

    el.style.cursor = 'pointer'
    el.style.transition = 'fill 0.4s ease'

    const onEnter = () => setMapHovering?.(true)
    const onLeave = () => setMapHovering?.(false)

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [svgContent, setMapHovering])

  // Update fill color whenever hoverCount changes
  useEffect(() => {
    if (!svgContent) return
    const el = containerRef.current?.querySelector('#trenque-lauquen')
    if (!el) return
    el.style.fill = interpolateColor(mapHoverCount)
  }, [mapHoverCount, svgContent])

  // Track mouse over the map container and broadcast SVG-space coordinates.
  // SVG coordinate space is invariant to screen size/resolution — the same
  // svgX/svgY always maps to the same visual point on the map on any device.
  useEffect(() => {
    if (!svgContent || !sendMapCursor) return
    const container = containerRef.current
    if (!container) return

    const onMove = (e) => {
      const svgEl = container.querySelector('svg')
      if (!svgEl) return
      try {
        const pt = svgEl.createSVGPoint()
        pt.x = e.clientX
        pt.y = e.clientY
        const svgPt = pt.matrixTransform(svgEl.getScreenCTM().inverse())
        sendMapCursor(svgPt.x, svgPt.y)
      } catch (_) {}
    }

    const onLeave = () => sendMapCursor(null, null)

    container.addEventListener('mousemove', onMove, { passive: true })
    container.addEventListener('mouseleave', onLeave)
    return () => {
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
    }
  }, [svgContent, sendMapCursor])

  const getSvgEl = () => containerRef.current?.querySelector('svg')

  const count = mapHoverCount ?? 0

  return (
    <div className="map-container">
      {svgContent ? (
        <div
          ref={containerRef}
          className="map-svg-wrapper"
          dangerouslySetInnerHTML={{ __html: svgContent }}
          aria-label="Mapa de Buenos Aires"
        />
      ) : (
        <div className="map-loading">Cargando mapa…</div>
      )}
      <p className="map-hint">
        {count === 0
          ? 'Pasá el cursor por Trenque Lauquen'
          : count >= MAX_HOVER
            ? `🔵 ¡${count} personas en Trenque Lauquen!`
            : `${count} / ${MAX_HOVER} para iluminar Trenque Lauquen`
        }
      </p>

      {remoteMapCursors && Object.entries(remoteMapCursors).map(([id, { svgX, svgY, color }]) => (
        <RemoteMapCursorDot
          key={id}
          svgX={svgX}
          svgY={svgY}
          color={color}
          getSvgEl={getSvgEl}
        />
      ))}
    </div>
  )
}
