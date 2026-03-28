import { useState, useEffect } from 'react'

const STEPS = [
  { id: 'data', label: 'COLLECTING DATA', sigil: '◈' },
  { id: 'bull', label: 'BULL ANALYSIS', sigil: '▲' },
  { id: 'bear', label: 'BEAR ANALYSIS', sigil: '▼' },
  { id: 'risk', label: 'RISK ASSESSMENT', sigil: '■' },
  { id: 'vote', label: 'DEBATE & VOTE', sigil: '⚖' },
]

export default function LoadingSpinner() {
  const [activeStep, setActiveStep] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length)
    }, 1400)

    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 400)

    return () => {
      clearInterval(stepInterval)
      clearInterval(dotInterval)
    }
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.terminal}>
        <div style={styles.terminalBar}>
          <span style={styles.terminalTitle}>ANALYSIS_ENGINE.exe</span>
          <span style={styles.terminalStatus}>RUNNING</span>
        </div>

        <div style={styles.terminalBody}>
          <div style={styles.scanLine} />

          {STEPS.map((step, i) => {
            const isDone = i < activeStep
            const isActive = i === activeStep
            return (
              <div key={step.id} style={styles.stepRow}>
                <span style={{
                  ...styles.stepSigil,
                  color: isDone ? '#10b981' : isActive ? '#f59e0b' : '#1e4a3a',
                }}>
                  {step.sigil}
                </span>
                <span style={{
                  ...styles.stepLabel,
                  color: isDone ? '#10b981' : isActive ? '#f1f5f9' : '#1e4a3a',
                }}>
                  {step.label}
                </span>
                <span style={{
                  ...styles.stepStatus,
                  color: isDone ? '#10b981' : isActive ? '#f59e0b' : '#1e4a3a',
                }}>
                  {isDone ? '[ DONE ]' : isActive ? `[ PROCESSING${dots} ]` : '[ WAITING ]'}
                </span>
              </div>
            )
          })}

          <div style={styles.cursor}>
            <span style={styles.cursorBlink}>█</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  @keyframes scan {
    0% { top: 0; }
    100% { top: 100%; }
  }
`
document.head.appendChild(styleSheet)

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '32px 0',
    display: 'flex',
    justifyContent: 'center',
  },
  terminal: {
    width: '100%',
    maxWidth: '560px',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    background: '#080c10',
    overflow: 'hidden',
  },
  terminalBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    background: 'rgba(16, 185, 129, 0.08)',
    borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
  },
  terminalTitle: {
    fontSize: '0.7rem',
    letterSpacing: '0.08em',
    color: '#2d6a5a',
  },
  terminalStatus: {
    fontSize: '0.65rem',
    letterSpacing: '0.12em',
    color: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    padding: '2px 8px',
  },
  terminalBody: {
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent)',
    animation: 'scan 2s linear infinite',
    pointerEvents: 'none',
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    borderBottom: '1px solid rgba(16, 185, 129, 0.05)',
  },
  stepSigil: {
    width: '16px',
    textAlign: 'center' as const,
    fontSize: '0.8rem',
    flexShrink: 0,
    transition: 'color 0.3s',
  },
  stepLabel: {
    flex: 1,
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    transition: 'color 0.3s',
  },
  stepStatus: {
    fontSize: '0.65rem',
    letterSpacing: '0.06em',
    flexShrink: 0,
    transition: 'color 0.3s',
    fontFamily: 'inherit',
  },
  cursor: {
    padding: '8px 0 0',
  },
  cursorBlink: {
    color: '#10b981',
    fontSize: '0.85rem',
    animation: 'blink 1s step-end infinite',
  },
}
