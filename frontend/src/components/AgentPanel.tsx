interface AgentPanelProps {
  bull: {
    stance: string
    arguments: string[]
    confidence: number
  } | null
  bear: {
    stance: string
    arguments: string[]
    confidence: number
  } | null
  risk: {
    risk_level: string
    constraints_triggered: string[]
    override: boolean
    final_recommendation: string
  } | null
}

export default function AgentPanel({ bull, bear, risk }: AgentPanelProps) {
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Agent Analysis</h2>
      <div style={styles.grid}>
        {/* Bull Agent */}
        <div style={{ ...styles.card, borderColor: '#10b981' }}>
          <div style={styles.cardHeader}>
            <span style={styles.icon}>🐂</span>
            <span style={styles.agentName}>Bull Agent</span>
          </div>
          <div style={styles.stance}>
            <span style={{ ...styles.stanceBadge, background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
              {bull?.stance || 'BULL'}
            </span>
            <span style={styles.confidence}>
              Confidence: {bull ? Math.round(bull.confidence * 100) : 0}%
            </span>
          </div>
          <ul style={styles.arguments}>
            {bull?.arguments?.map((arg, i) => (
              <li key={i} style={styles.argument}>{arg}</li>
            ))}
          </ul>
        </div>

        {/* Bear Agent */}
        <div style={{ ...styles.card, borderColor: '#ef4444' }}>
          <div style={styles.cardHeader}>
            <span style={styles.icon}>🐻</span>
            <span style={styles.agentName}>Bear Agent</span>
          </div>
          <div style={styles.stance}>
            <span style={{ ...styles.stanceBadge, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
              {bear?.stance || 'BEAR'}
            </span>
            <span style={styles.confidence}>
              Confidence: {bear ? Math.round(bear.confidence * 100) : 0}%
            </span>
          </div>
          <ul style={styles.arguments}>
            {bear?.arguments?.map((arg, i) => (
              <li key={i} style={styles.argument}>{arg}</li>
            ))}
          </ul>
        </div>

        {/* Risk Officer */}
        <div style={{ ...styles.card, borderColor: '#f59e0b' }}>
          <div style={styles.cardHeader}>
            <span style={styles.icon}>🛡️</span>
            <span style={styles.agentName}>Risk Officer</span>
          </div>
          <div style={styles.stance}>
            <span style={{ ...styles.stanceBadge, background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
              {risk?.risk_level || 'MEDIUM'} RISK
            </span>
            {risk?.override && (
              <span style={styles.override}>⚠️ OVERRIDE</span>
            )}
          </div>
          <div style={styles.recommendation}>
            Recommendation: <strong>{risk?.final_recommendation || 'HOLD'}</strong>
          </div>
          {risk?.constraints_triggered && risk.constraints_triggered.length > 0 && (
            <div style={styles.constraints}>
              <span style={styles.constraintsLabel}>Constraints triggered:</span>
              {risk.constraints_triggered.map((c, i) => (
                <span key={i} style={styles.constraint}>{c}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginTop: '20px',
  },
  heading: {
    fontSize: '1.3rem',
    marginBottom: '16px',
    color: '#8892b0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    padding: '20px',
    border: '2px solid',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  icon: {
    fontSize: '1.5rem',
  },
  agentName: {
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  stance: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  stanceBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  confidence: {
    color: '#8892b0',
    fontSize: '0.9rem',
  },
  arguments: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  argument: {
    padding: '6px 0',
    color: '#c9d1d9',
    fontSize: '0.9rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  override: {
    color: '#ef4444',
    fontSize: '0.8rem',
    fontWeight: 700,
  },
  recommendation: {
    color: '#c9d1d9',
    marginBottom: '10px',
  },
  constraints: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
  },
  constraintsLabel: {
    color: '#8892b0',
    fontSize: '0.85rem',
  },
  constraint: {
    padding: '2px 8px',
    background: 'rgba(245, 158, 11, 0.2)',
    borderRadius: '8px',
    fontSize: '0.75rem',
    color: '#f59e0b',
  },
}