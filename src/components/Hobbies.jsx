import { useState, useRef, useCallback } from 'react'
import { HOBBIES } from '../data/content'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useToast } from './Toast'

function HobbyCard({ hobby }) {
  const { ref, visible } = useScrollReveal()
  const [epic, setEpic] = useState(false)
  const timerRef = useRef(null)
  const { show } = useToast()

  const startHover = useCallback(() => {
    if (hobby.id !== 'fortnite') return
    timerRef.current = setTimeout(() => {
      setEpic(true)
      show('🎮 MODO ÉPICO ACTIVADO')
    }, 3000)
  }, [hobby.id, show])

  const endHover = useCallback(() => {
    clearTimeout(timerRef.current)
  }, [])

  return (
    <div
      ref={ref}
      className={`hobby-card reveal${visible ? ' visible' : ''}${epic ? ' fortnite-epic' : ''}`}
      onMouseEnter={startHover}
      onMouseLeave={endHover}
    >
      <span className="hobby-icon">{hobby.icon}</span>
      <p className="hobby-name">{hobby.name}</p>
      <p className="hobby-desc">{hobby.desc}</p>
    </div>
  )
}

export default function Hobbies() {
  return (
    <div className="section-wrapper">
      <div className="section">
        <p className="section-label">Intereses</p>
        <h2 className="section-title">Lo que me<br /><span>mueve</span></h2>
        <div className="hobbies-grid">
          {HOBBIES.map(h => <HobbyCard key={h.id} hobby={h} />)}
        </div>
      </div>
    </div>
  )
}
