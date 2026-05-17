import { HOBBIES } from '../data/content'
import { useScrollReveal } from '../hooks/useScrollReveal'

function HobbyCard({ hobby }) {
  const { ref, visible } = useScrollReveal()

  return (
    <div
      ref={ref}
      className={`hobby-card reveal${visible ? ' visible' : ''}`}
    >
      <span className="hobby-icon">{hobby.icon}</span>
      <p className="hobby-name">{hobby.name}</p>
    </div>
  )
}

export default function Hobbies() {
  return (
    <div className="section-light">
      <div className="section">
        <p className="section-label">Intereses</p>
        <h2 className="section-title">Fuera del<br /><span>trabajo</span></h2>
        <div className="hobbies-grid">
          {HOBBIES.map(h => <HobbyCard key={h.id} hobby={h} />)}
        </div>
      </div>
    </div>
  )
}
