import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const CORRECT = import.meta.env.VITE_FRASE_PASSWORD

export default function FrasePasswordModal({ onSuccess, onClose }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value === CORRECT) {
      onSuccess()
    } else {
      setError(true)
      setValue('')
      setTimeout(() => setError(false), 1200)
    }
  }

  return createPortal(
    <div className="frase-modal-overlay" onClick={onClose}>
      <div className="frase-modal" onClick={(e) => e.stopPropagation()}>
        <p className="frase-modal-title">🔒 Contenido +18</p>
        <p className="frase-modal-subtitle">Ingresá la contraseña para revelar la frase.</p>
        <form onSubmit={handleSubmit} className="frase-modal-form">
          <input
            ref={inputRef}
            type="password"
            className={`frase-modal-input${error ? ' frase-modal-input--error' : ''}`}
            placeholder="Contraseña"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="frase-modal-btn">Confirmar</button>
        </form>
        {error && <p className="frase-modal-error">Contraseña incorrecta.</p>}
      </div>
    </div>,
    document.body
  )
}
