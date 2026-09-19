function SpeakerIcon({ muted }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" />{muted ? <><path d="m17 9 4 6M21 9l-4 6" /></> : <><path d="M16 9.5a4 4 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10" /></>}</svg>
}

export function Header({ status, tone, audioEnabled, onToggleAudio }) {
  return (
    <header className="app-header">
      <a className="brand" href="#top" aria-label="MikadoTimer, accueil">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <span><strong>Mikado</strong>Timer</span>
      </a>
      <div className="header-actions">
        <div className={`status status--${tone}`} role="status">
          <span className="status-dot" aria-hidden="true" />
          {status}
        </div>
        <button className="audio-toggle" type="button" aria-pressed={audioEnabled} aria-label={audioEnabled ? 'Messages audio activés' : 'Messages audio désactivés'} onClick={onToggleAudio}>
          <SpeakerIcon muted={!audioEnabled} />
          <span>{audioEnabled ? 'Audio activé' : 'Audio désactivé'}</span>
        </button>
      </div>
    </header>
  )
}
