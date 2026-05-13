import { useEffect } from 'react'

const COLORS = ['#6af190', '#ffffff', '#1c30cc', '#a855f7', '#facc15', '#f472b6']

export function launchConfetti() {
  const count = 120
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    el.className = 'confetti-piece'

    const size = Math.random() * 8 + 4
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const startX = Math.random() * 100
    const drift = (Math.random() - 0.5) * 200
    const duration = Math.random() * 2.5 + 2
    const delay = Math.random() * 0.8

    el.style.cssText = `
      width: ${size}px;
      height: ${size * (Math.random() > 0.5 ? 2.5 : 1)}px;
      background: ${color};
      left: ${startX}vw;
      top: -10px;
      animation: confetti-fall ${duration}s ${delay}s linear forwards;
      transform: rotate(${Math.random() * 360}deg) translateX(${drift}px);
    `

    document.body.appendChild(el)
    setTimeout(() => el.remove(), (duration + delay + 0.5) * 1000)
  }
}

export default function Confetti() {
  return null
}
