import { useState, useEffect, useRef } from 'react'
import { FRASES } from '../data/content'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useToast } from './Toast'
import { launchConfetti } from './Confetti'

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
      <p className="frase-text">"{frase.text}"</p>
      <p className="frase-author">— {frase.author}</p>
    </div>
  )
}

export default function Frases() {
  return (
    <div className="section-alt">
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
