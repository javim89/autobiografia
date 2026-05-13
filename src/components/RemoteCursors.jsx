export default function RemoteCursors({ cursors }) {
  return (
    <>
      {Object.entries(cursors).map(([id, { x, y, color }]) => (
        <div
          key={id}
          className="remote-cursor"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <div className="remote-cursor-dot" style={{ background: color }} />
        </div>
      ))}
    </>
  )
}
