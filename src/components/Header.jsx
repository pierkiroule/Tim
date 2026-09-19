export function Header({ status, tone }) {
  return (
    <header className="app-header">
      <a className="brand" href="#top" aria-label="MikadoTimer, accueil">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <span><strong>Mikado</strong>Timer</span>
      </a>
      <div className={`status status--${tone}`} role="status">
        <span className="status-dot" aria-hidden="true" />
        {status}
      </div>
    </header>
  )
}
