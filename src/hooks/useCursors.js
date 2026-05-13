import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const CHANNEL = 'azu-bio-cursors'
const CURSOR_TTL = 5000   // ms — remove cursor after inactivity
const THROTTLE_MS = 40    // ~25fps

function randomId() {
  return Math.random().toString(36).slice(2, 8)
}

function randomColor() {
  const colors = ['#f472b6', '#fb923c', '#facc15', '#34d399', '#60a5fa', '#a78bfa', '#f87171']
  return colors[Math.floor(Math.random() * colors.length)]
}

export function useCursors() {
  const sessionId = useMemo(() => randomId(), [])
  const sessionColor = useMemo(() => randomColor(), [])

  const [remoteCursors, setRemoteCursors] = useState({})
  const [onlineCount, setOnlineCount] = useState(1)
  const [mapHoverCount, setMapHoverCount] = useState(0)

  const channelRef = useRef(null)
  const lastSendRef = useRef(0)
  const ttlTimers = useRef({})
  // { [sessionId]: true } — only hovering users are tracked
  const hoverMapRef = useRef({})

  const supabase = useMemo(() => {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_KEY
    if (!url || !key || url.includes('tu-proyecto')) return null
    return createClient(url, key)
  }, [])

  useEffect(() => {
    if (!supabase) return

    const channel = supabase.channel(CHANNEL, {
      config: { broadcast: { self: false } },
    })

    channel
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        const { id, x, y, color } = payload
        if (!id) return

        setRemoteCursors(prev => ({ ...prev, [id]: { x, y, color } }))

        clearTimeout(ttlTimers.current[id])
        ttlTimers.current[id] = setTimeout(() => {
          setRemoteCursors(prev => {
            const next = { ...prev }
            delete next[id]
            return next
          })
        }, CURSOR_TTL)
      })
      .on('broadcast', { event: 'tl_hover' }, ({ payload }) => {
        const { id, hovering } = payload
        if (!id) return
        if (hovering) {
          hoverMapRef.current[id] = true
        } else {
          delete hoverMapRef.current[id]
        }
        setMapHoverCount(Object.keys(hoverMapRef.current).length)
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach(p => {
          delete hoverMapRef.current[p.id]
        })
        setMapHoverCount(Object.keys(hoverMapRef.current).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ id: sessionId })
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      Object.values(ttlTimers.current).forEach(clearTimeout)
    }
  }, [supabase, sessionId])

  const sendCursor = useCallback((x, y) => {
    const now = Date.now()
    if (now - lastSendRef.current < THROTTLE_MS) return
    lastSendRef.current = now

    channelRef.current?.send({
      type: 'broadcast',
      event: 'cursor',
      payload: { id: sessionId, x, y, color: sessionColor },
    })
  }, [sessionId, sessionColor])

  const setMapHovering = useCallback((hovering) => {
    // Update local count immediately (broadcast has self: false)
    if (hovering) {
      hoverMapRef.current[sessionId] = true
    } else {
      delete hoverMapRef.current[sessionId]
    }
    setMapHoverCount(Object.keys(hoverMapRef.current).length)

    channelRef.current?.send({
      type: 'broadcast',
      event: 'tl_hover',
      payload: { id: sessionId, hovering },
    })
  }, [sessionId])

  return { remoteCursors, onlineCount, mapHoverCount, setMapHovering, sendCursor, sessionColor }
}
