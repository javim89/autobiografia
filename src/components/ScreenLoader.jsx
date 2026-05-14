import { useEffect, useRef, useState, useCallback } from 'react'

/* ── Canvas dimensions ───────────────────────────────────── */
const LR_W = 800
const LR_H = 940

/* SVG paths for the R glyph (viewBox 0 0 128 128) */
const SVG_OUTER = "M110.7 117.03L85.59 83.64c13.01-5.37 22.18-18.08 22.18-32.87c0-19.63-16.13-35.61-35.96-35.61H33.95c-.15 0-.28.06-.42.09h-6.46c-1.24 0-2.24 1-2.24 2.24v100.96c0 1.24 1 2.24 2.24 2.24h21.89c1.24 0 2.24-1 2.24-2.24V86.37h8.64l25.2 33.51c.45.59 1.15.94 1.89.94h21.89c.9 0 1.72-.51 2.11-1.31c.4-.8.31-1.76-.23-2.48z"
const SVG_INNER = "M70.12 65.38c-.36.03-.72.06-1.08.06H51.57c-.05 0-.09-.04-.14-.06c-.09-.02-.18-.04-.24-.1a.577.577 0 0 1-.21-.43V36.67c0-.17.08-.32.21-.43c.06-.05.14-.07.22-.09c.06-.02.1-.07.16-.07h17.46c.42 0 .84.03 1.25.07c7.22.66 12.9 6.96 12.9 14.61c.01 7.72-5.76 14.04-13.06 14.62z"

const SVG_SCALE = 6.25
const SVG_TX = 0
const SVG_TY = 70

const R_TOP_Y = Math.round(15 * SVG_SCALE + SVG_TY)
const R_BOT_Y = Math.round(120 * SVG_SCALE + SVG_TY)
const R_RANGE = R_BOT_Y - R_TOP_Y

let _rPath = null
function getRPath() {
  if (!_rPath) _rPath = new Path2D(SVG_OUTER + ' ' + SVG_INNER)
  return _rPath
}

function drawRFill(ctx, fillStyle) {
  ctx.save()
  ctx.translate(SVG_TX, SVG_TY)
  ctx.scale(SVG_SCALE, SVG_SCALE)
  ctx.fillStyle = fillStyle
  ctx.fill(getRPath(), 'evenodd')
  ctx.restore()
}

function drawRStroke(ctx, strokeStyle, lineWidth) {
  ctx.save()
  ctx.translate(SVG_TX, SVG_TY)
  ctx.scale(SVG_SCALE, SVG_SCALE)
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = lineWidth / SVG_SCALE
  ctx.stroke(getRPath())
  ctx.restore()
}

/* ── Color helpers ─────────────────────────────────────── */
function hexToRgb(hex) {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]
  return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)]
}
function darkenHex(hex, amt) {
  const [r, g, b] = hexToRgb(hex)
  return `rgb(${Math.round(r*(1-amt))},${Math.round(g*(1-amt))},${Math.round(b*(1-amt))})`
}
function lightenHex(hex, amt) {
  const [r, g, b] = hexToRgb(hex)
  return `rgb(${Math.min(255,Math.round(r+(255-r)*amt))},${Math.min(255,Math.round(g+(255-g)*amt))},${Math.min(255,Math.round(b+(255-b)*amt))})`
}

/* ── LiquidCanvas ─────────────────────────────────────── */
function LiquidCanvas({ userCount, maxUsers, color }) {
  const canvasRef = useRef(null)
  const offRef = useRef(null)
  const propsRef = useRef({ color, userCount, maxUsers })
  propsRef.current = { color, userCount, maxUsers }

  const stateRef = useRef({
    time: 0, fill: 0,
    mx: 0, my: 0, mActive: false,
    mVelX: 0, lastMX: 0,
    push: 0, splash: 0,
    lastCount: -1
  })

  useEffect(() => {
    const s = stateRef.current
    if (s.lastCount >= 0 && userCount !== s.lastCount) {
      s.splash = userCount > s.lastCount ? 14 : 6
    }
    s.lastCount = userCount
  }, [userCount])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const off = document.createElement('canvas')
    off.width = LR_W
    off.height = LR_H
    offRef.current = off

    let rafId
    let lastT = performance.now()
    const s = stateRef.current

    const render = (now) => {
      const dt = Math.min((now - lastT) / 1000, 0.05)
      lastT = now
      s.time += dt

      const p = propsRef.current
      const targetFill = p.userCount / p.maxUsers
      s.fill += (targetFill - s.fill) * Math.min(1, 2.8 * dt)

      s.splash *= Math.pow(0.91, dt * 60)
      if (s.splash < 0.08) s.splash = 0

      if (s.mActive) {
        const vel = (s.mx - s.lastMX) / Math.max(dt, 0.001)
        s.mVelX += (vel - s.mVelX) * 0.25
        s.lastMX = s.mx
      } else {
        s.mVelX *= Math.pow(0.90, dt * 60)
      }
      s.push += s.mVelX * dt * 0.22
      s.push *= Math.pow(0.955, dt * 60)

      ctx.clearRect(0, 0, LR_W, LR_H)
      const oc = off.getContext('2d')
      oc.clearRect(0, 0, LR_W, LR_H)

      const t = s.time
      const col = p.color

      drawRFill(oc, '#000')
      oc.globalCompositeOperation = 'source-in'

      const mappedFill = s.fill > 0.001 ? 0.03 + s.fill * 0.97 : 0
      const surfaceY = R_BOT_Y - mappedFill * R_RANGE
      const sp = s.splash

      oc.beginPath()
      oc.moveTo(-10, LR_H + 10)

      for (let x = -10; x <= LR_W + 10; x += 2) {
        let y = surfaceY
        y += Math.sin(x * 0.018 + t * 1.6 + s.push * 0.07) * 6
        y += Math.sin(x * 0.032 + t * 1.1 + 0.9) * 4
        y += Math.sin(x * 0.011 + t * 2.4 + 1.6) * 5
        if (sp > 0.4) {
          y += Math.sin(x * 0.055 + t * 6.5) * sp * 0.9
          y += Math.sin(x * 0.028 + t * 4.8 + 2) * sp * 0.55
        }
        if (s.mActive && s.fill > 0.01) {
          const dx = x - s.mx
          const gauss = Math.exp(-(dx * dx) / (2 * 100 * 100))
          const nearS = Math.exp(-Math.pow(s.my - surfaceY, 2) / (2 * 180 * 180))
          y -= gauss * nearS * 22 * Math.sin(t * 4.2 + x * 0.07)
          y += gauss * s.push * 0.45
        }
        y += s.push * Math.sin(x * 0.009 + t * 1.8) * 0.35
        oc.lineTo(x, y)
      }

      oc.lineTo(LR_W + 10, LR_H + 10)
      oc.closePath()

      const grad = oc.createLinearGradient(0, surfaceY - 30, 0, LR_H)
      grad.addColorStop(0, col)
      grad.addColorStop(0.5, col)
      grad.addColorStop(1, darkenHex(col, 0.14))
      oc.fillStyle = grad
      oc.fill()

      if (s.fill > 0.02 && s.fill < 0.98) {
        oc.globalCompositeOperation = 'source-atop'
        oc.strokeStyle = lightenHex(col, 0.35)
        oc.lineWidth = 3
        oc.beginPath()
        for (let x = -10; x <= LR_W + 10; x += 2) {
          let y = surfaceY
          y += Math.sin(x * 0.018 + t * 1.6 + s.push * 0.07) * 6
          y += Math.sin(x * 0.032 + t * 1.1 + 0.9) * 4
          y += Math.sin(x * 0.011 + t * 2.4 + 1.6) * 5
          if (sp > 0.4) y += Math.sin(x * 0.055 + t * 6.5) * sp * 0.9
          if (s.mActive && s.fill > 0.01) {
            const dx = x - s.mx
            const gauss = Math.exp(-(dx * dx) / (2 * 100 * 100))
            const nearS = Math.exp(-Math.pow(s.my - surfaceY, 2) / (2 * 180 * 180))
            y -= gauss * nearS * 22 * Math.sin(t * 4.2 + x * 0.07)
          }
          if (x === -10) oc.moveTo(x, y); else oc.lineTo(x, y)
        }
        oc.stroke()
      }

      oc.globalCompositeOperation = 'source-over'

      /* ── Main canvas ── */
      // Empty R shell — solid white base
      drawRFill(ctx, '#ffffff')
      drawRStroke(ctx, 'rgba(255,255,255,0.4)', 1.5)
      ctx.drawImage(off, 0, 0)

      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const onMove = useCallback((e) => {
    const r = canvasRef.current.getBoundingClientRect()
    stateRef.current.mx = (e.clientX - r.left) * (LR_W / r.width)
    stateRef.current.my = (e.clientY - r.top) * (LR_H / r.height)
    stateRef.current.mActive = true
  }, [])

  const onTouch = useCallback((e) => {
    const touch = e.touches[0]
    if (!touch) return
    const r = canvasRef.current.getBoundingClientRect()
    stateRef.current.mx = (touch.clientX - r.left) * (LR_W / r.width)
    stateRef.current.my = (touch.clientY - r.top) * (LR_H / r.height)
    stateRef.current.mActive = true
  }, [])

  const onLeave = useCallback(() => {
    stateRef.current.mActive = false
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={LR_W}
      height={LR_H}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onTouchMove={onTouch}
      onTouchEnd={onLeave}
      style={{
        width: '100%',
        maxWidth: 'min(380px, calc((100vh - 220px) * 0.851))',
        height: 'auto',
        display: 'block',
        margin: '0 auto',
        cursor: 'default',
      }}
    />
  )
}

/* ── ScreenLoader ─────────────────────────────────────── */
export default function ScreenLoader({ onlineCount, maxUsers, onReady }) {
  const [isReady, setIsReady] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  // Read accent color from CSS token
  const accentColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent').trim() || '#6af190'

  useEffect(() => {
    if (onlineCount >= maxUsers && !isReady) {
      setIsReady(true)
      // Brief pause to let the "¡Listo!" state show, then fade out
      setTimeout(() => setFadeOut(true), 1200)
      setTimeout(onReady, 1800)
    }
  }, [onlineCount, maxUsers, isReady, onReady])

  const clampedCount = Math.min(onlineCount, maxUsers)

  return (
    <div className={`screen-loader${fadeOut ? ' screen-loader--out' : ''}${isReady ? ' screen-loader--ready' : ''}`}>
      <div className="screen-loader__canvas-wrap">
        <LiquidCanvas
          userCount={clampedCount}
          maxUsers={maxUsers}
          color={accentColor}
        />
      </div>

      <div className="screen-loader__counter">
        <div className="screen-loader__nums">
          <span className="screen-loader__current" style={{ color: isReady ? accentColor : undefined }}>
            {clampedCount}
          </span>
          <span className="screen-loader__max">/{maxUsers}</span>
        </div>
        <div className="screen-loader__label" style={{ color: isReady ? accentColor : undefined }}>
          {isReady ? '¡Listo!' : 'para entrar a la web'}
        </div>
      </div>
    </div>
  )
}
