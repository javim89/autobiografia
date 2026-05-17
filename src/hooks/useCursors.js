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

export function useCursors(userName = '') {
  const sessionId = useMemo(() => randomId(), [])
  const sessionColor = useMemo(() => randomColor(), [])
  const nameRef = useRef(userName)
  useEffect(() => { nameRef.current = userName }, [userName])

  const [remoteCursors, setRemoteCursors] = useState({})
  const [remoteMapCursors, setRemoteMapCursors] = useState({})
  const [onlineCount, setOnlineCount] = useState(1)
  const [mapHoverCount, setMapHoverCount] = useState(0)
  const [sectionHoverCounts, setSectionHoverCounts] = useState({})

  const channelRef = useRef(null)
  const lastSendRef = useRef(0)
  const lastMapSendRef = useRef(0)
  const ttlTimers = useRef({})
  const mapTtlTimers = useRef({})
  // { [sessionId]: true } — only hovering users are tracked
  const hoverMapRef = useRef({})
  // { [sectionId]: { [sessionId]: true } }
  const sectionHoverRef = useRef({})

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
        const { id, x, y, color, name } = payload
        if (!id) return

        setRemoteCursors(prev => ({ ...prev, [id]: { x, y, color, name } }))

        clearTimeout(ttlTimers.current[id])
        ttlTimers.current[id] = setTimeout(() => {
          setRemoteCursors(prev => {
            const next = { ...prev }
            delete next[id]
            return next
          })
        }, CURSOR_TTL)
      })
      .on('broadcast', { event: 'map_cursor' }, ({ payload }) => {
        const { id, svgX, svgY, color } = payload
        if (!id) return

        if (svgX === null) {
          setRemoteMapCursors(prev => {
            const next = { ...prev }
            delete next[id]
            return next
          })
          return
        }

        setRemoteMapCursors(prev => ({ ...prev, [id]: { svgX, svgY, color } }))

        clearTimeout(mapTtlTimers.current[id])
        mapTtlTimers.current[id] = setTimeout(() => {
          setRemoteMapCursors(prev => {
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
      .on('broadcast', { event: 'section_hover' }, ({ payload }) => {
        const { id, section, hovering } = payload
        if (!id || !section) return
        if (hovering) {
          if (!sectionHoverRef.current[section]) sectionHoverRef.current[section] = {}
          sectionHoverRef.current[section][id] = true
        } else {
          if (sectionHoverRef.current[section]) {
            delete sectionHoverRef.current[section][id]
          }
        }
        setSectionHoverCounts(
          Object.fromEntries(
            Object.entries(sectionHoverRef.current).map(([s, users]) => [s, Object.keys(users).length])
          )
        )
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach(p => {
          delete hoverMapRef.current[p.id]
          Object.values(sectionHoverRef.current).forEach(users => delete users[p.id])
        })
        setMapHoverCount(Object.keys(hoverMapRef.current).length)
        setSectionHoverCounts(
          Object.fromEntries(
            Object.entries(sectionHoverRef.current).map(([s, users]) => [s, Object.keys(users).length])
          )
        )
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
      Object.values(mapTtlTimers.current).forEach(clearTimeout)
    }
  }, [supabase, sessionId])

  const sendCursor = useCallback((x, y) => {
    const now = Date.now()
    if (now - lastSendRef.current < THROTTLE_MS) return
    lastSendRef.current = now

    channelRef.current?.send({
      type: 'broadcast',
      event: 'cursor',
      payload: { id: sessionId, x, y, color: sessionColor, name: nameRef.current },
    })
  }, [sessionId, sessionColor])

  // Broadcasts cursor position as SVG coordinate space — consistent across any screen size
  const sendMapCursor = useCallback((svgX, svgY) => {
    const now = Date.now()
    if (svgX !== null && now - lastMapSendRef.current < THROTTLE_MS) return
    lastMapSendRef.current = now

    channelRef.current?.send({
      type: 'broadcast',
      event: 'map_cursor',
      payload: { id: sessionId, svgX, svgY, color: sessionColor },
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

  const setSectionHovering = useCallback((section, hovering) => {
    // Update local count immediately (broadcast has self: false)
    if (hovering) {
      if (!sectionHoverRef.current[section]) sectionHoverRef.current[section] = {}
      sectionHoverRef.current[section][sessionId] = true
    } else {
      if (sectionHoverRef.current[section]) {
        delete sectionHoverRef.current[section][sessionId]
      }
    }
    setSectionHoverCounts(
      Object.fromEntries(
        Object.entries(sectionHoverRef.current).map(([s, users]) => [s, Object.keys(users).length])
      )
    )

    channelRef.current?.send({
      type: 'broadcast',
      event: 'section_hover',
      payload: { id: sessionId, section, hovering },
    })
  }, [sessionId])

  // Filter out users who are sending map cursors from the global cursor list
  const filteredRemoteCursors = useMemo(() => {
    const result = { ...remoteCursors }
    Object.keys(remoteMapCursors).forEach(id => delete result[id])
    return result
  }, [remoteCursors, remoteMapCursors])

  return {
    remoteCursors: filteredRemoteCursors,
    remoteMapCursors,
    onlineCount,
    mapHoverCount,
    setMapHovering,
    sectionHoverCounts,
    setSectionHovering,
    sendCursor,
    sendMapCursor,
    sessionColor,
  }
}
