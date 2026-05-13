import { useEffect, useRef } from 'react'
import { HERO } from '../data/content'
import OnlineCounter from './OnlineCounter'

export default function Hero({ onlineCount }) {
  const bgTextRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!bgTextRef.current) return
      const y = window.scrollY
      bgTextRef.current.style.transform =
        `translate(-50%, calc(-50% + ${y * 0.25}px))`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="hero">
      <div ref={bgTextRef} className="hero-bg-text" aria-hidden="true">
        AZU
      </div>

      <div className="hero-inner">
        <p className="hero-eyebrow">Portfolio / 2025</p>

        <h1 className="hero-name">{HERO.name.split(' ')[0]}<br />{HERO.name.split(' ')[1]}</h1>

        <p className="hero-aliases">
          {HERO.aliases.join(' · ')}
        </p>

        <blockquote className="hero-quote">
          {HERO.quote}
        </blockquote>

        <OnlineCounter count={onlineCount} />
      </div>

      <div className="hero-scroll-hint">Scroll</div>
    </section>
  )
}
