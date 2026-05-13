import { useState, useRef, useCallback, useEffect } from 'react'

export default function ImageCompareSlider({ before, after, labelBefore = 'Antes', labelAfter = 'Después' }) {
  const [pos, setPos] = useState(50)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef(null)

  const updatePos = useCallback((clientX) => {
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPos((x / rect.width) * 100)
  }, [])

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!dragging) return
    updatePos(e.clientX)
  }, [dragging, updatePos])

  const onMouseUp = useCallback(() => setDragging(false), [])

  const onTouchMove = useCallback((e) => {
    updatePos(e.touches[0].clientX)
  }, [updatePos])

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging, onMouseMove, onMouseUp])

  return (
    <div className="img-compare" ref={containerRef} onTouchMove={onTouchMove}>
      <img src={after} alt={labelAfter} className="img-compare__img img-compare__img--after" draggable={false} />
      <div className="img-compare__before" style={{ width: `${pos}%` }}>
        <img src={before} alt={labelBefore} className="img-compare__img" draggable={false} />
      </div>
      <div
        className={`img-compare__handle${dragging ? ' img-compare__handle--dragging' : ''}`}
        style={{ left: `${pos}%` }}
        onMouseDown={onMouseDown}
        onTouchStart={(e) => { updatePos(e.touches[0].clientX) }}
      >
        <div className="img-compare__bar" />
        <div className="img-compare__knob">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M8 5l-5 7 5 7M16 5l5 7-5 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <span className="img-compare__label img-compare__label--before">{labelBefore}</span>
      <span className="img-compare__label img-compare__label--after">{labelAfter}</span>
    </div>
  )
}
