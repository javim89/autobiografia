export default function OnlineCounter({ count }) {
  return (
    <div className="online-counter">
      <span className="online-dot" />
      {count} {count === 1 ? 'persona' : 'personas'} leyendo esto ahora
    </div>
  )
}
