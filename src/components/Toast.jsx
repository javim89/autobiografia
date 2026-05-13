import { useState, useCallback, useEffect } from 'react'

let externalShow = null

export function useToast() {
  const show = useCallback((msg) => {
    externalShow?.(msg)
  }, [])
  return { show }
}

export default function Toast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    externalShow = (msg) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, msg, exiting: false }])

      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id))
        }, 320)
      }, 3200)
    }

    return () => { externalShow = null }
  }, [])

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast${t.exiting ? ' exiting' : ''}`}>
          {t.msg}
        </div>
      ))}
    </div>
  )
}
