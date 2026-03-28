import { useState } from 'react'

interface AgentPanelProps {
  bull: {
    stance: string
    arguments: string[]
    confidence: number
    reasoning: string
  } | null
  bear: {
    stance: string
    arguments: string[]
    confidence: number
    reasoning: string
  } | null
  risk: {
    risk_level: string
    constraints_triggered: string[]
    override: boolean
    final_recommendation: string
    reasoning: string
  } | null
}

function ReasoningToggle({ reasoning, color }: { reasoning: string; color: string }) {
  const [expanded, setExpanded] = useState(false)

  if (!reasoning) return null

  return (
    <div style={reasoningStyles.wrapper}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{ ...reasoningStyles.toggle, borderColor: `${color}30` }}
      >
        <span style={{ ...reasoningStyles.toggleIcon, color }}>◈</span>
        <span style={reasoningStyles.toggleText}>REASONING</span>
        <span style={reasoningStyles.toggleArrow}>{expanded ? '▼' : '▶'}</span>
      </button>
      {expanded && (
        <div style={{ ...reasoningStyles.content, borderColor: `${color}20` }}>
          <p style={reasoningStyles.paragraph}>{reasoning}</p>
        </div>
      )}
    </div>
  )
}

export default function AgentPanel({ bull, bear, risk }: AgentPanelProps) {
  const agents = [
    {
      id: 'bull',
      label: 'BULL AGENT',
      sigil: '▲',
      color: '#10b981',
      borderColor: 'rgba(16, 185, 129, 0.25)',
      stance: bull?.stance || 'BULL',
      confidence: bull ? Math.round(bull.confidence * 100) : 0,
      items: bull?.arguments || [],
      reasoning: bull?.reasoning || '',
    },
    {
      id: 'bear',
      label: 'BEAR AGENT',
      sigil: '▼',
      color: '#ef4444',
      borderColor: 'rgba(239, 68, 68, 0.25)',
      stance: bear?.stance || 'BEAR',
      confidence: bear ? Math.round(bear.confidence * 100) : 0,
      items: bear?.arguments || [],
      reasoning: bear?.reasoning || '',
    },
    {
      id: 'risk',
      label: 'RISK OFFICER',
      sigil: '■',
      color: '#f59e0b',
      borderColor: 'rgba(245, 158, 11, 0.25)',
      stance: risk?.risk_level ? `${risk.risk_level} RISK` : 'MEDIUM RISK',
      confidence: null,
      items: risk?.constraints_triggered || [],
      reasoning: risk?.reasoning || '',
      recommendation: risk?.final_recommendation,
      override: risk?.override,
    },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionLine} />
        <span style={styles.sectionLabel}>AGENT ANALYSIS</span>
        <span style={styles.sectionLine} />
      </div>
      <div style={styles.grid}>
        {agents.map((agent) => (
          <div key={agent.id} style={{ ...styles.card, borderColor: agent.borderColor }}>
            <div style={{ ...styles.cardTop, background: `${agent.color}08`, borderBottom: `1px solid ${agent.borderColor}` }}>
              <span style={{ ...styles.sigil, color: agent.color }}>{agent.sigil}</span>
              <span style={styles.agentLabel}>{agent.label}</span>
              <span style={{ ...styles.stanceTag, color: agent.color, borderColor: `${agent.color}40` }}>
                {agent.stance}
              </span>
            </div>

            {agent.confidence !== null && (
              <div style={styles.confRow}>
                <span style={styles.confKey}>CONFIDENCE</span>
                <span style={{ ...styles.confVal, color: agent.color }}>{agent.confidence}%</span>
              </div>
            )}

            {agent.id === 'risk' && agent.recommendation && (
              <div style={styles.confRow}>
                <span style={styles.confKey}>RECOMMENDATION</span>
                <span style={{ ...styles.confVal, color: agent.color }}>{agent.recommendation}</span>
                {agent.override && (
                  <span style={styles.overrideBadge}>OVERRIDE</span>
                )}
              </div>
            )}

            <div style={styles.listWrap}>
              {agent.items.length > 0 ? (
                agent.items.map((item, i) => (
                  <div key={i} style={styles.listItem}>
                    <span style={{ ...styles.bullet, color: agent.color }}>—</span>
                    <span style={styles.listText}>{item}</span>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>NO DATA</div>
              )}
            </div>

            <ReasoningToggle reasoning={agent.reasoning} color={agent.color} />
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginTop: '20px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  sectionLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(16, 185, 129, 0.1)',
  },
  sectionLabel: {
    fontSize: '0.65rem',
    letterSpacing: '0.15em',
    color: '#2d6a5a',
    flexShrink: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '12px',
  },
  card: {
    border: '1px solid',
    background: '#0a1612',
    overflow: 'hidden',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
  },
  sigil: {
    fontSize: '0.9rem',
    flexShrink: 0,
  },
  agentLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    flex: 1,
  },
  stanceTag: {
    fontSize: '0.65rem',
    letterSpacing: '0.08em',
    border: '1px solid',
    padding: '2px 8px',
  },
  confRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 16px',
    borderBottom: '1px solid rgba(16, 185, 129, 0.05)',
    background: 'rgba(0, 0, 0, 0.15)',
  },
  confKey: {
    fontSize: '0.62rem',
    letterSpacing: '0.1em',
    color: '#2d6a5a',
    flex: 1,
  },
  confVal: {
    fontSize: '0.9rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  overrideBadge: {
    fontSize: '0.6rem',
    letterSpacing: '0.1em',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    padding: '1px 6px',
    marginLeft: '8px',
  },
  listWrap: {
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  listItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  bullet: {
    flexShrink: 0,
    lineHeight: 1.6,
    fontSize: '0.85rem',
  },
  listText: {
    color: '#94a3b8',
    fontSize: '0.83rem',
    lineHeight: 1.6,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  emptyState: {
    color: '#1e4a3a',
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    padding: '8px 0',
  },
}

const reasoningStyles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    borderTop: '1px solid rgba(16,185,129,0.08)',
    padding: '8px 12px',
  },
  toggle: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    background: 'rgba(0,0,0,0.15)',
    border: '1px solid',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'inherit',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  toggleIcon: {
    fontSize: '0.9rem',
  },
  toggleText: {
    flex: 1,
    fontSize: '0.65rem',
    letterSpacing: '0.1em',
    color: '#4b6a5e',
  },
  toggleArrow: {
    fontSize: '0.6rem',
    color: '#4b6a5e',
  },
  content: {
    marginTop: '8px',
    padding: '12px',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid',
    borderRadius: '4px',
    maxHeight: '200px',
    overflowY: 'auto' as const,
  },
  paragraph: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    lineHeight: 1.6,
    margin: 0,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
}