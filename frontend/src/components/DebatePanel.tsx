import { useState } from 'react'

interface DebatePanelProps {
  debateSummary: Array<{
    target: string
    critique: string
  }> | undefined
}

export default function DebatePanel({ debateSummary }: DebatePanelProps) {
  const [expanded, setExpanded] = useState(false)

  if (!debateSummary || debateSummary.length === 0) {
    return null
  }

  const getTargetColor = (target: string) => {
    switch (target) {
      case 'Bull': return '#10b981'
      case 'Bear': return '#ef4444'
      case 'Risk': return '#f59e0b'
      default: return '#8892b0'
    }
  }

  const getTargetIcon = (target: string) => {
    switch (target) {
      case 'Bull': return '🐂'
      case 'Bear': return '🐻'
      case 'Risk': return '🛡️'
      default: return '❓'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header} onClick={() => setExpanded(!expanded)}>
        <span style={styles.icon}>⚔️</span>
        <span style={styles.title}>Agent Debate</span>
        <span style={styles.badge}>{debateSummary.length} critiques</span>
        <span style={styles.arrow}>{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        <div style={styles.content}>
          {debateSummary.map((critique, index) => (
            <div key={index} style={styles.critiqueItem}>
              <div style={styles.critiqueHeader}>
                <span style={styles.targetIcon}>{getTargetIcon(critique.target)}</span>
                <span style={{
                  ...styles.targetBadge,
                  color: getTargetColor(critique.target),
                  background: `${getTargetColor(critique.target)}20`
                }}>
                  {critique.target} responds
                </span>
              </div>
              <p style={styles.critiqueText}>{critique.critique}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  icon: {
    fontSize: '1.2rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 600,
    flex: 1,
  },
  badge: {
    fontSize: '0.8rem',
    color: '#8892b0',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  arrow: {
    color: '#8892b0',
    fontSize: '0.9rem',
  },
  content: {
    padding: '0 20px 20px',
  },
  critiqueItem: {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '10px',
    padding: '14px 16px',
    marginBottom: '10px',
  },
  critiqueHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  targetIcon: {
    fontSize: '1rem',
  },
  targetBadge: {
    fontSize: '0.85rem',
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: '8px',
  },
  critiqueText: {
    color: '#c9d1d9',
    fontSize: '0.9rem',
    lineHeight: 1.5,
    margin: 0,
  },
}