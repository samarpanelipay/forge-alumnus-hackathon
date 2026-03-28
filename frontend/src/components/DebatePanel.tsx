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

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'Bull': return '#10b981'
      case 'Bear': return '#ef4444'
      case 'Risk': return '#f59e0b'
      default: return '#8892b0'
    }
  }

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'Bull': return '🐂'
      case 'Bear': return '🐻'
      case 'Risk': return '🛡️'
      default: return '👤'
    }
  }

  if (!debateSummary && !debateMessages) {
    return null
  }

  const hasMessages = debateMessages && debateMessages.length > 0

  return (
    <div style={styles.container}>
      <div style={styles.header} onClick={() => setExpanded(!expanded)}>
        <span style={styles.icon}>⚔️</span>
        <span style={styles.title}>Agent Debate</span>
        {hasMessages && (
          <span style={styles.badge}>{debateMessages.length} rounds</span>
        )}
        {!hasMessages && debateSummary && (
          <span style={styles.badge}>{debateSummary.length} critiques</span>
        )}
        <span style={styles.arrow}>{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        <div style={styles.content}>
          {/* Show back-and-forth messages if available */}
          {hasMessages && (
            <div style={styles.messagesSection}>
              <h4 style={styles.sectionTitle}>Debate Flow</h4>
              {debateMessages.map((msg, index) => (
                <div key={index} style={{
                  ...styles.messageItem,
                  borderLeftColor: getAgentColor(msg.agent)
                }}>
                  <div style={styles.messageHeader}>
                    <span style={styles.messageIcon}>{getAgentIcon(msg.agent)}</span>
                    <span style={{
                      ...styles.agentName,
                      color: getAgentColor(msg.agent)
                    }}>
                      {msg.agent}
                    </span>
                    <span style={styles.roundNumber}>Round {index + 1}</span>
                  </div>
                  <p style={styles.messageContent}>{msg.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Show critiques if no messages or as additional info */}
          {debateSummary && debateSummary.length > 0 && (
            <div style={styles.critiquesSection}>
              <h4 style={styles.sectionTitle}>Key Critiques</h4>
              {debateSummary.map((critique, index) => (
                <div key={index} style={styles.critiqueItem}>
                  <div style={styles.critiqueHeader}>
                    <span style={styles.targetIcon}>{getAgentIcon(critique.target)}</span>
                    <span style={{
                      ...styles.targetBadge,
                      color: getAgentColor(critique.target),
                      background: `${getAgentColor(critique.target)}20`
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
  sectionTitle: {
    color: '#8892b0',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: '12px',
    marginTop: '16px',
  },
  messagesSection: {
    marginBottom: '16px',
  },
  messageItem: {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '10px',
    padding: '14px 16px',
    marginBottom: '10px',
    borderLeft: '3px solid',
  },
  messageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  messageIcon: {
    fontSize: '1rem',
  },
  agentName: {
    fontSize: '0.95rem',
    fontWeight: 600,
  },
  roundNumber: {
    fontSize: '0.75rem',
    color: '#5a6785',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  messageContent: {
    color: '#c9d1d9',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    margin: 0,
  },
  critiquesSection: {
    marginTop: '8px',
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