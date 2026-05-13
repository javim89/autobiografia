import { useState, useEffect, useRef } from 'react'
import { FRASES } from '../data/content'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useToast } from './Toast'
import { launchConfetti } from './Confetti'

function EasterFrase({ text }) {
  // "Don't quit" → ["Do", "n't qu", "it"]
  const [hidden, setHidden] = useState(false)
  const timerRef = useRef(null)

  const handleEnter = () => {
    timerRef.current = setTimeout(() => setHidden(true), 1000)
  }

  const handleLeave = () => {
    clearTimeout(timerRef.current)
    setHidden(false)
  }

  return (
    <p
      className="frase-text"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      "Do<span className={`frase-easter-hidden${hidden ? ' gone' : ''}`}>n't</span>{' '}<span className={`frase-easter-hidden${hidden ? ' gone' : ''}`}>qu</span>it"
    </p>
  )
}

function FraseItem({ frase, isLast }) {
  const { ref, visible } = useScrollReveal()
  const [revealed, setRevealed] = useState(false)
  const { show } = useToast()
  const confettiFired = useRef(false)

  useEffect(() => {
    if (!isLast || !ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !confettiFired.current) {
          confettiFired.current = true
          launchConfetti()
          show('🎉 ¡Llegaste al final!')
        }
      },
      { threshold: 0.6 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [isLast, show])

  const handleReveal = () => {
    if (!frase.locked) return
    setRevealed(true)
    show('🔞 Desbloqueaste la frase secreta')
  }

  return (
    <div
      ref={ref}
      className={`frase-item reveal${visible ? ' visible' : ''}${frase.locked ? ` frase-locked${revealed ? ' revealed' : ''}` : ''}`}
      onClick={handleReveal}
      role={frase.locked ? 'button' : undefined}
      tabIndex={frase.locked ? 0 : undefined}
    >
      {frase.locked && (
        <span className="frase-locked-label">
          {revealed ? '🔓 Desbloqueada' : '🔒 +18 — Click para revelar'}
        </span>
      )}
      {frase.easter ? <EasterFrase text={frase.text} /> : <p className="frase-text">"{frase.text}"</p>}
      <p className="frase-author">— {frase.author}</p>
    </div>
  )
}

export default function Frases() {
  return (
    <div className="section-wrapper">
      <div className="section">
        <p className="section-label">Filosofía</p>
        <h2 className="section-title">Frases que<br /><span>me definen</span></h2>
        <div className="frases-list">
          {FRASES.map((f, i) => (
            <FraseItem key={f.id} frase={f} isLast={i === FRASES.length - 1} />
          ))}
        </div>
      </div>
    </div>
  )
}
