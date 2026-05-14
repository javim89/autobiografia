import { ORIGEN } from '../data/content'
import { useScrollReveal } from '../hooks/useScrollReveal'
import Map from './Map'

export default function Origen({ setMapHovering, mapHoverCount, sendMapCursor, remoteMapCursors }) {
  const { ref, visible } = useScrollReveal()

  return (
    <div className="section-alt">
      <div className="section">
      <p className="section-label">Origen</p>
      <div className="origen-grid">
        <div ref={ref} className={`reveal${visible ? ' visible' : ''}`}>
          <h2 className="origen-title">
            {ORIGEN.ciudad}<br />
            <span style={{ color: 'var(--muted)', fontSize: '0.55em' }}>
              {ORIGEN.provincia}
            </span>
          </h2>
          <p
            className="origen-body"
            dangerouslySetInnerHTML={{ __html: ORIGEN.description }}
          />
          <p
            className="origen-body"
            style={{ marginTop: '1rem', fontSize: '0.8rem' }}
          >
            Easter egg: pasá el cursor sobre el mapa y pintá mi ciudad.
          </p>
        </div>
        <Map
          setMapHovering={setMapHovering}
          mapHoverCount={mapHoverCount}
          sendMapCursor={sendMapCursor}
          remoteMapCursors={remoteMapCursors}
        />
      </div>
      </div>
    </div>
  )
}
