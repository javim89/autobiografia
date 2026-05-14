import { useEffect, useRef, useState, useCallback } from 'react'
import Hero from './components/Hero'
import Timeline from './components/Timeline'
import Origen from './components/Origen'
import Hobbies from './components/Hobbies'
import Frases from './components/Frases'
import RemoteCursors from './components/RemoteCursors'
import Toast from './components/Toast'
import ScreenLoader from './components/ScreenLoader'
import { launchConfetti } from './components/Confetti'
import { useCursors } from './hooks/useCursors'
import { useToast } from './components/Toast'

const MIN_USERS = parseInt(import.meta.env.VITE_MIN_USERS_TO_ENTER || '0', 10)

const KONAMI = ['ArrowUp','b','ArrowUp','b','a','ArrowDown']

function AppInner() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const ringPos = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)
  const konamiIndex = useRef(0)
  const [konamiActive, setKonamiActive] = useState(false)
  const [loaderDone, setLoaderDone] = useState(MIN_USERS <= 0)
  const { show } = useToast()

  const { remoteCursors, onlineCount, mapHoverCount, setMapHovering, sendCursor } = useCursors()
  const handleLoaderReady = useCallback(() => setLoaderDone(true), [])

  // Console easter egg — fires once
  useEffect(() => {
    console.log(
      '%c👾 Hola, curioso/a.',
      'color: #6af190; font-size: 16px; font-weight: bold; font-family: monospace;'
    )
    console.log(
      '%cAquí van los easter eggs:\n'
      + '  1. Frase #3 → click para revelar\n'
      + '  2. Card Fortnite → hover 3s → modo épico\n'
      + '  3. Scroll hasta el final → confetti\n'
      + '  4. ↑B↑BA↓ → modo arcoíris\n'
      + '  5. Mapa de Bs As → pasá por Trenque Lauquen\n'
      + '  6. Ya encontraste este 😏',
      'color: #ffffff; font-size: 12px; font-family: monospace;'
    )
  }, [])

  // Custom cursor
  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mouseX = 0, mouseY = 0

    const onMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.left = `${mouseX}px`
      dot.style.top = `${mouseY}px`

      // send position as % for remote cursors
      sendCursor(
        (mouseX / window.innerWidth) * 100,
        (mouseY / window.innerHeight) * 100
      )
    }

    const animateRing = () => {
      ringPos.current.x += (mouseX - ringPos.current.x) * 0.12
      ringPos.current.y += (mouseY - ringPos.current.y) * 0.12
      ring.style.left = `${ringPos.current.x}px`
      ring.style.top = `${ringPos.current.y}px`
      rafRef.current = requestAnimationFrame(animateRing)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafRef.current = requestAnimationFrame(animateRing)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [sendCursor])

  // Konami Code
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === KONAMI[konamiIndex.current]) {
        konamiIndex.current++
        if (konamiIndex.current === KONAMI.length) {
          konamiIndex.current = 0
          setKonamiActive(true)
          launchConfetti()
          show('🌈 KONAMI CODE ACTIVADO')
          setTimeout(() => setKonamiActive(false), 4000)
        }
      } else {
        konamiIndex.current = e.key === KONAMI[0] ? 1 : 0
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show])

  useEffect(() => {
    document.body.classList.toggle('konami-active', konamiActive)
  }, [konamiActive])

  return (
    <>
      {!loaderDone && (
        <ScreenLoader
          onlineCount={onlineCount}
          maxUsers={MIN_USERS}
          onReady={handleLoaderReady}
        />
      )}

      {/* Custom cursor — hidden on mobile via CSS */}
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />

      <RemoteCursors cursors={remoteCursors} />

      <main>
        <Hero onlineCount={onlineCount} />
        <Origen setMapHovering={setMapHovering} mapHoverCount={mapHoverCount} />
        <Timeline />
        <Hobbies />
        <Frases />
      </main>

      <Toast />
    </>
  )
}

export default function App() {
  return <AppInner />
}
