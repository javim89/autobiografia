import { TIMELINE } from '../data/content'
import { useScrollReveal } from '../hooks/useScrollReveal'

function TimelineItem({ year, title, desc }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div ref={ref} className={`timeline-item reveal${visible ? ' visible' : ''}`}>
      <span className="timeline-year" aria-hidden="true">{year}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  )
}

export default function Timeline() {
  return (
    <div className="section-wrapper">
      <div className="section">
        <p className="section-label">Trayectoria</p>
        <h2 className="section-title">La <span>línea</span><br />del tiempo</h2>
        <div className="timeline">
          {TIMELINE.map((item) => (
            <TimelineItem key={item.year} {...item} />
          ))}
        </div>
      </div>
    </div>
  )
}
