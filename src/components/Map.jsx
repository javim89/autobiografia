import { useEffect, useRef, useState } from 'react'

// Color interpolation: #E8E9D6 (1 user) → #0015FF (MAX users)
const FROM = { r: 232, g: 233, b: 214 }
const TO   = { r: 0,   g: 21,  b: 255 }
const MAX_HOVER = parseInt(import.meta.env.VITE_MAP_HOVER_MAX ?? '20', 10)

function interpolateColor(count) {
  if (count === 0) return `rgb(${FROM.r},${FROM.g},${FROM.b})`
  const t = Math.min((count - 1) / (MAX_HOVER - 1), 1)
  const r = Math.round(FROM.r + (TO.r - FROM.r) * t)
  const g = Math.round(FROM.g + (TO.g - FROM.g) * t)
  const b = Math.round(FROM.b + (TO.b - FROM.b) * t)
  return `rgb(${r},${g},${b})`
}

export default function Map({ setMapHovering, mapHoverCount }) {
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
    </div>
  )
}
