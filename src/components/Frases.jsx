import { useState, useEffect, useRef } from 'react'
import { FRASES } from '../data/content'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useToast } from './Toast'
import FrasePasswordModal from './FrasePasswordModal'

function EasterFrase({ hidden }) {
  return (
    <p className="frase-text">
      "Do<span className={`frase-easter-hidden${hidden ? ' gone' : ''}`}>n't</span>{' '}<span className={`frase-easter-hidden${hidden ? ' gone' : ''}`}>qu</span>it"
    </p>
  )
}

function FraseItem({ frase, isLast, forceReveal }) {
  const { ref, visible } = useScrollReveal()
  const [revealed, setRevealed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const isVisible = forceReveal || revealed
  const isRevealed = revealed
  const { show } = useToast()
  const confettiFired = useRef(false)

  useEffect(() => {
    if (!isLast || !ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !confettiFired.current) {
          confettiFired.current = true
          show('🎉 ¡Llegaste al final!')
        }
      },
      { threshold: 0.6 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [isLast, show])

  const handleClick = () => {
    if (!frase.locked || isRevealed || !isVisible) return
    setModalOpen(true)
  }

  const handleSuccess = () => {
    setModalOpen(false)
    setRevealed(true)
    show('🔞 Desbloqueaste la frase secreta')
  }

  return (
    <>
      <div
        ref={ref}
        className={`frase-item reveal${visible ? ' visible' : ''}${frase.locked ? ` frase-locked${isVisible ? ' visible' : ''}${isRevealed ? ' revealed' : ''}` : ''}`}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role={frase.locked && isVisible && !isRevealed ? 'button' : undefined}
        tabIndex={frase.locked && isVisible && !isRevealed ? 0 : undefined}
      >
        {frase.locked && isVisible && (
          <span className="frase-locked-label">
            {isRevealed ? '🔓 Desbloqueada' : '🔒 +18 — Click para revelar'}
          </span>
        )}
        {frase.easter ? <EasterFrase hidden={hovered} /> : <p className="frase-text">"{frase.text}"</p>}
      </div>

      {modalOpen && (
        <FrasePasswordModal
          onSuccess={handleSuccess}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

export default function Frases({ konamiRevealed }) {
  return (
    <div className="section-wrapper">
      <div className="section">
        <p className="section-label">Filosofía</p>
        <h2 className="section-title">Formas de<br /><span>pensar</span></h2>
        <div className="frases-list">
          {FRASES.map((f, i) => (
            <FraseItem
              key={f.id}
              frase={f}
              isLast={i === FRASES.length - 1}
              forceReveal={f.locked && konamiRevealed}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
