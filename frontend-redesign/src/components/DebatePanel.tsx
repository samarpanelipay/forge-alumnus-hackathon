import { useState } from 'react'

interface DebateMessage {
  agent: string
  content: string
}

interface Critique {
  target: string
  critique: string
}

interface DebatePanelProps {
  debateSummary: Critique[] | undefined
  debateMessages: DebateMessage[] | undefined
}

export default function DebatePanel({ debateSummary, debateMessages }: DebatePanelProps) {
  const [expanded, setExpanded] = useState(false)

  const getTargetConfig = (target: string) => {
    switch (target) {
      case 'Bull': return { color: '#10b981', border: 'rgba(16,185,129,0.3)', sigil: '▲' }
      case 'Bear': return { color: '#ef4444', border: 'rgba(239,68,68,0.3)', sigil: '▼' }
      case 'Risk': return { color: '#f59e0b', border: 'rgba(245,158,11,0.3)', sigil: '■' }
      default: return { color: '#8892b0', border: 'rgba(136,146,176,0.3)', sigil: '?' }
    }
  }

  if (!debateSummary && !debateMessages) {
    return null
  }

  const hasMessages = debateMessages && debateMessages.length > 0

  return (
    <div style={styles.container}>
      <button
        style={styles.header}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={styles.headerLeft}>
          <span style={styles.icon}>⚔</span>
          <span style={styles.title}>AGENT DEBATE</span>
          {hasMessages && (
            <span style={styles.badge}>{debateMessages.length} ROUNDS</span>
          )}
          {!hasMessages && debateSummary && (
            <span style={styles.badge}>{debateSummary.length} CRITIQUES</span>
          )}
        </span>
        <span style={styles.arrow}>{expanded ? '[ − ]' : '[ + ]'}</span>
      </button>

      {expanded && (
        <div style={styles.content}>
          {hasMessages && (
            <div style={styles.timeline}>
              {debateMessages.map((msg, index) => {
                const cfg = getTargetConfig(msg.agent)
                return (
                  <div key={index} style={styles.entry}>
                    <div style={styles.entryLeft}>
                      <div style={{ ...styles.dot, background: cfg.color, boxShadow: `0 0 6px ${cfg.color}60` }} />
                      {index < debateMessages.length - 1 && <div style={styles.line} />}
                    </div>
                    <div style={{ ...styles.bubble, borderColor: cfg.border }}>
                      <div style={styles.bubbleHeader}>
                        <span style={{ color: cfg.color, fontSize: '0.75rem' }}>{cfg.sigil}</span>
                        <span style={{ ...styles.targetName, color: cfg.color }}>
                          {msg.agent.toUpperCase()} AGENT
                        </span>
                        <span style={styles.critiqueWord}>ROUND {index + 1}</span>
                      </div>
                      <p style={styles.critiqueText}>{msg.content}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!hasMessages && debateSummary && debateSummary.length > 0 && (
            <div style={styles.timeline}>
              {debateSummary.map((critique, index) => {
                const cfg = getTargetConfig(critique.target)
                return (
                  <div key={index} style={styles.entry}>
                    <div style={styles.entryLeft}>
                      <div style={{ ...styles.dot, background: cfg.color, boxShadow: `0 0 6px ${cfg.color}60` }} />
                      {index < debateSummary.length - 1 && <div style={styles.line} />}
                    </div>
                    <div style={{ ...styles.bubble, borderColor: cfg.border }}>
                      <div style={styles.bubbleHeader}>
                        <span style={{ color: cfg.color, fontSize: '0.75rem' }}>{cfg.sigil}</span>
                        <span style={{ ...styles.targetName, color: cfg.color }}>
                          {critique.target.toUpperCase()} AGENT
                        </span>
                        <span style={styles.critiqueWord}>RESPONDS</span>
                      </div>
                      <p style={styles.critiqueText}>{critique.critique}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    border: '1px solid rgba(16, 185, 129, 0.15)',
    background: '#0a1612',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  header: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    textAlign: 'left' as const,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  icon: {
    fontSize: '1rem',
    color: '#10b981',
  },
  title: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: '#e2e8f0',
  },
  badge: {
    fontSize: '0.6rem',
    letterSpacing: '0.1em',
    color: '#2d6a5a',
    border: '1px solid rgba(16, 185, 129, 0.1)',
    padding: '2px 8px',
  },
  arrow: {
    fontSize: '0.75rem',
    color: '#2d6a5a',
    letterSpacing: '0.05em',
  },
  content: {
    padding: '4px 20px 20px',
    borderTop: '1px solid rgba(16, 185, 129, 0.08)',
  },
  timeline: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0',
  },
  entry: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  entryLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    flexShrink: 0,
    paddingTop: '14px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  line: {
    width: '1px',
    flex: 1,
    minHeight: '20px',
    background: 'rgba(16, 185, 129, 0.1)',
    margin: '4px 0',
  },
  bubble: {
    flex: 1,
    border: '1px solid',
    padding: '12px 14px',
    marginBottom: '10px',
    background: 'rgba(0, 0, 0, 0.2)',
  },
  bubbleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  targetName: {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
  },
  critiqueWord: {
    fontSize: '0.62rem',
    color: '#2d6a5a',
    letterSpacing: '0.08em',
  },
  critiqueText: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    lineHeight: 1.65,
    margin: 0,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
}