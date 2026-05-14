export default function SectionLock({ sectionId, count, minToUnlock, onMouseEnter, onMouseLeave, children }) {
  const isUnlocked = minToUnlock === null || count >= minToUnlock

  return (
    <div
      className="section-lock-wrapper"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      {!isUnlocked && (
        <div className="section-lock-overlay">
          <div className="section-lock-badge">
            <div className="section-lock-icon">🔒</div>
            <p className="section-lock-label">participantes para desbloquear</p>
            <div className="section-lock-counter">
              <span className="section-lock-current">{count}</span>
              <span className="section-lock-sep">/</span>
              <span className="section-lock-max">{minToUnlock}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
