import { useRef, useState, useCallback, useEffect } from 'react'
import { TIMELINE } from '../data/content'
import { useScrollReveal } from '../hooks/useScrollReveal'

function TimelineCard({ item, side }) {
  const { ref, visible } = useScrollReveal()
  const hasMedia = item.media && item.media.length > 0
  const [easterActive, setEasterActive] = useState(false)
  const videoRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (easterActive) {
      video.currentTime = 0
      video.play()
    } else {
      video.pause()
      video.currentTime = 0
    }
  }, [easterActive])

  const handleMouseEnter = useCallback(() => {
    if (!item.easterVideo) return
    timerRef.current = setTimeout(() => {
      setEasterActive(true)
    }, 3000)
  }, [item.easterVideo])

  const handleMouseLeave = useCallback(() => {
    if (!item.easterVideo) return
    clearTimeout(timerRef.current)
    setEasterActive(false)
  }, [item.easterVideo])

  return (
    <div
      ref={ref}
      className={`tl-card tl-card--${side} reveal${visible ? ' visible' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="tl-card__inner">
        <div className="tl-card__body">
          <h3 className="tl-card__title">{item.title}</h3>
          <p className="tl-card__desc">{item.desc}</p>
          {hasMedia && (
            <div className="tl-card__media">
              {item.easterVideo && (
                <video
                  ref={videoRef}
                  src={item.easterVideo}
                  className="tl-media-item"
                  style={{ display: easterActive ? 'block' : 'none' }}
                  muted
                  loop
                  playsInline
                />
              )}
              {item.media.map((src, i) => {
                const isVideo = /\.(mp4|webm|mov)$/i.test(src)
                return isVideo ? (
                  <video
                    key={i}
                    src={src}
                    className="tl-media-item"
                    style={item.easterVideo && easterActive ? { display: 'none' } : {}}
                    muted
                    loop
                    playsInline
                    controls
                  />
                ) : (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="tl-media-item"
                    style={item.easterVideo && easterActive ? { display: 'none' } : {}}
                  />
                )
              })}
            </div>
          )}
        </div>
        <div className="tl-card__date">
          <span className="tl-card__year">{item.year}</span>
        </div>
      </div>
    </div>
  )
}

export default function Timeline() {
  return (
    <div className="section-wrapper">
      <div className="section">
        <p className="section-label">Trayectoria</p>
        <h2 className="section-title">La <span>línea</span><br />del tiempo</h2>
        <div className="tl-wrapper">
          <div className="tl-line" />
          {TIMELINE.map((item, i) => {
            const side = i % 2 === 0 ? 'left' : 'right'
            return (
              <div key={item.year} className={`tl-row tl-row--${side}`}>
                {side === 'left' && <TimelineCard item={item} side={side} />}
                <div className="tl-dot-col">
                  <div className="tl-dot" />
                </div>
                {side === 'right' && <TimelineCard item={item} side={side} />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
