export default function RemoteCursors({ cursors }) {
  return (
    <>
      {Object.entries(cursors).map(([id, { x, y, color, name }]) => (
        <div
          key={id}
          className="remote-cursor"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <div className="remote-cursor-dot" style={{ background: color }} />
          {name && (
            <div className="remote-cursor-label" style={{ color, borderColor: color }}>
              {name}
            </div>
          )}
        </div>
      ))}
    </>
  )
}
