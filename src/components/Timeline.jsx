import { useRef, useState, useCallback, useEffect } from 'react'
import { TIMELINE } from '../data/content'
import { useScrollReveal } from '../hooks/useScrollReveal'
import ImageCompareSlider from './ImageCompareSlider'

function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (paused) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, 2000)
    return () => clearInterval(intervalRef.current)
  }, [paused, images.length])

  return (
    <div
      className="tl-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className={`tl-media-item tl-carousel__img${i === current ? ' tl-carousel__img--active' : ''}`}
        />
      ))}
    </div>
  )
}

function TimelineCard({ item, side }) {
  const { ref, visible } = useScrollReveal()
  const hasMedia = item.media && item.media.length > 0
  const isCarousel = hasMedia && item.media.length > 1
  const [easterActive, setEasterActive] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (easterActive) {
      video.currentTime = 0
      video.muted = false
      video.volume = 1
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay with sound was blocked; play muted as fallback
          video.muted = true
          video.play().catch(() => {})
        })
      }
    } else {
      video.pause()
      video.currentTime = 0
    }
  }, [easterActive])

  const handleMouseEnter = useCallback(() => {
    if (!item.easterVideo) return
    setEasterActive(true)
  }, [item.easterVideo])

  const handleMouseLeave = useCallback(() => {
    if (!item.easterVideo) return
    setEasterActive(false)
  }, [item.easterVideo])

  return (
    <div
      ref={ref}
      className={`tl-card tl-card--${side} reveal${visible ? ' visible' : ''}`}
    >
      <div className="tl-card__inner">
        <div className="tl-card__body">
          <h3 className="tl-card__title">{item.title}</h3>
          <p className="tl-card__desc">{item.desc}</p>
          {hasMedia && (
            <div
              className="tl-card__media"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {item.easterVideo && (
                <video
                  ref={videoRef}
                  src={item.easterVideo}
                  className="tl-media-item"
                  style={{ display: easterActive ? 'block' : 'none' }}
                  loop
                  playsInline
                />
              )}
              {item.compareImage ? (
                <ImageCompareSlider
                  before={item.compareImage}
                  after={item.media[0]}
                  labelBefore="En cursada"
                  labelAfter="Graduado"
                />
              ) : isCarousel ? (
                <ImageCarousel images={item.media} />
              ) : (
                item.media.map((src, i) => {
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
                })
              )}
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
