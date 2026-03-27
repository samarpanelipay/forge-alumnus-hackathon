import { StockVerdict } from '../api'

interface VerdictDisplayProps {
  verdict: StockVerdict
}

export default function VerdictDisplay({ verdict }: VerdictDisplayProps) {
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'BUY':
        return '#10b981'
      case 'SELL':
        return '#ef4444'
      default:
        return '#f59e0b'
    }
  }

  const getVerdictBg = (verdict: string) => {
    switch (verdict) {
      case 'BUY':
        return 'rgba(16, 185, 129, 0.15)'
      case 'SELL':
        return 'rgba(239, 68, 68, 0.15)'
      default:
        return 'rgba(245, 158, 11, 0.15)'
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.ticker}>{verdict.ticker}</span>
        <span
          style={{
            ...styles.verdict,
            color: getVerdictColor(verdict.verdict),
            background: getVerdictBg(verdict.verdict),
          }}
        >
          {verdict.verdict}
        </span>
      </div>

      <div style={styles.confidence}>
        <span style={styles.confidenceLabel}>Confidence</span>
        <span style={styles.confidenceValue}>
          {Math.round(verdict.confidence * 100)}%
        </span>
      </div>

      <div style={styles.cases}>
        <div style={styles.case}>
          <div style={styles.caseHeader}>
            <span style={styles.bullIcon}>🐂</span>
            <span>Bull Case</span>
          </div>
          <p style={styles.caseText}>{verdict.bull_case}</p>
        </div>

        <div style={styles.case}>
          <div style={styles.caseHeader}>
            <span style={styles.bearIcon}>🐻</span>
            <span>Bear Case</span>
          </div>
          <p style={styles.caseText}>{verdict.bear_case}</p>
        </div>
      </div>

      <div style={styles.riskRow}>
        <span style={styles.riskLabel}>Risk:</span>
        <span style={styles.riskValue}>{verdict.risk_summary}</span>
      </div>

      {verdict.dissent && (
        <div style={styles.dissent}>
          <span style={styles.dissentLabel}>📢 Dissent:</span>
          <span>{verdict.dissent}</span>
        </div>
      )}

      <div style={styles.source}>
        Decision via: {verdict.source === 'risk_override' ? 'Risk Officer Override' : 'Majority Vote'}
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  ticker: {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  verdict: {
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: '1.2rem',
    fontWeight: 700,
  },
  confidence: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '10px',
  },
  confidenceLabel: {
    color: '#8892b0',
  },
  confidenceValue: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#64ffda',
  },
  cases: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '20px',
  },
  case: {
    padding: '16px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
  },
  caseHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontWeight: 600,
  },
  bullIcon: {
    fontSize: '1.2rem',
  },
  bearIcon: {
    fontSize: '1.2rem',
  },
  caseText: {
    color: '#c9d1d9',
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
  riskRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '10px',
    marginBottom: '16px',
  },
  riskLabel: {
    color: '#8892b0',
  },
  riskValue: {
    color: '#f59e0b',
  },
  dissent: {
    padding: '12px',
    background: 'rgba(245, 158, 11, 0.1)',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '0.9rem',
  },
  dissentLabel: {
    fontWeight: 600,
    marginRight: '8px',
  },
  source: {
    textAlign: 'center',
    color: '#5a6785',
    fontSize: '0.85rem',
  },
}