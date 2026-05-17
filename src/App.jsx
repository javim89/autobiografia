import { useEffect, useRef, useState, useCallback } from 'react'
import Hero from './components/Hero'
import Timeline from './components/Timeline'
import Origen from './components/Origen'
import Hobbies from './components/Hobbies'
import Frases from './components/Frases'
import RemoteCursors from './components/RemoteCursors'
import SectionLock from './components/SectionLock'
import Toast from './components/Toast'
import ScreenLoader from './components/ScreenLoader'
import { useCursors } from './hooks/useCursors'
import { useToast } from './components/Toast'

const MIN_USERS = parseInt(import.meta.env.VITE_MIN_USERS_TO_ENTER || '0', 10)
const MIN_TO_UNLOCK = import.meta.env.VITE_MIN_TO_UNLOCK_SECTION
  ? parseInt(import.meta.env.VITE_MIN_TO_UNLOCK_SECTION, 10)
  : null

const KONAMI = ['ArrowUp','b','ArrowUp','b','a','ArrowDown']

function AppInner() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const ringPos = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)
  const konamiIndex = useRef(0)
  const [konamiRevealed, setKonamiRevealed] = useState(false)
  const [loaderDone, setLoaderDone] = useState(MIN_USERS <= 0)
  const [unlockedSections, setUnlockedSections] = useState(new Set())
  const [userName, setUserName] = useState('')
  const { show } = useToast()

  const { remoteCursors, remoteMapCursors, onlineCount, mapHoverCount, setMapHovering, sectionHoverCounts, setSectionHovering, sendCursor, sendMapCursor } = useCursors(userName)

  const getSectionCount = useCallback((id) => {
    if (MIN_TO_UNLOCK === null) return MIN_TO_UNLOCK
    if (unlockedSections.has(id)) return MIN_TO_UNLOCK
    const count = sectionHoverCounts[id] || 0
    if (count >= MIN_TO_UNLOCK) {
      setUnlockedSections(prev => new Set([...prev, id]))
    }
    return count
  }, [sectionHoverCounts, unlockedSections])
  const handleLoaderReady = useCallback((name) => {
    setUserName(name)
    setLoaderDone(true)
  }, [])

  // Console easter egg — fires once
  useEffect(() => {
    console.log(
      '%c👾 Hola, curioso/a.',
      'color: #6af190; font-size: 16px; font-weight: bold; font-family: monospace;'
    )
    console.log(
      '%cAquí van los easter eggs:\n'
      + '  1. Frase #3 → click para revelar\n'
      + '  2. Scroll hasta el final → confetti\n'
      + '  3. ↑B↑BA↓ → modo arcoíris\n'
      + '  4. Ya encontraste este 😏',
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

      // send position as % of viewport for general cursor sync
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
          setKonamiRevealed(true)
          show('🔓 Frase secreta desbloqueada')
        }
      } else {
        konamiIndex.current = e.key === KONAMI[0] ? 1 : 0
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show])

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
        <SectionLock
          sectionId="origen"
          count={getSectionCount('origen')}
          minToUnlock={MIN_TO_UNLOCK}
          onMouseEnter={() => setSectionHovering('origen', true)}
          onMouseLeave={() => setSectionHovering('origen', false)}
        >
          <Origen
            setMapHovering={setMapHovering}
            mapHoverCount={mapHoverCount}
            sendMapCursor={sendMapCursor}
            remoteMapCursors={remoteMapCursors}
          />
        </SectionLock>
        <SectionLock
          sectionId="timeline"
          count={getSectionCount('timeline')}
          minToUnlock={MIN_TO_UNLOCK}
          onMouseEnter={() => setSectionHovering('timeline', true)}
          onMouseLeave={() => setSectionHovering('timeline', false)}
        >
          <Timeline />
        </SectionLock>
        <SectionLock
          sectionId="hobbies"
          count={getSectionCount('hobbies')}
          minToUnlock={MIN_TO_UNLOCK}
          onMouseEnter={() => setSectionHovering('hobbies', true)}
          onMouseLeave={() => setSectionHovering('hobbies', false)}
        >
          <Hobbies />
        </SectionLock>
        <SectionLock
          sectionId="frases"
          count={getSectionCount('frases')}
          minToUnlock={MIN_TO_UNLOCK}
          onMouseEnter={() => setSectionHovering('frases', true)}
          onMouseLeave={() => setSectionHovering('frases', false)}
        >
          <Frases konamiRevealed={konamiRevealed} />
        </SectionLock>
      </main>

      <Toast />
    </>
  )
}

export default function App() {
  return <AppInner />
}
