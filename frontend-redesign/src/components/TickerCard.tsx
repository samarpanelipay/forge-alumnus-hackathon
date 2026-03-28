import { AnalysisResult } from '../api'

interface TickerCardProps {
  result: AnalysisResult
  onClick: () => void
}

export default function TickerCard({ result, onClick }: TickerCardProps) {
  const verdict = result.data?.verdict
  const ticker = result.data?.ticker
  const confidence = result.data?.confidence
  const risk = result.data?.risk_summary

  const getVerdictColor = (v: string | undefined) => {
    switch (v) {
      case 'BUY': return '#10b981'
      case 'SELL': return '#ef4444'
      default: return '#f59e0b'
    }
  }

  const getVerdictBg = (v: string | undefined) => {
    switch (v) {
      case 'BUY': return 'rgba(16, 185, 129, 0.15)'
      case 'SELL': return 'rgba(239, 68, 68, 0.15)'
      default: return 'rgba(245, 158, 11, 0.15)'
    }
  }

  if (!result.success || !result.data) {
    return (
      <div style={{...styles.card, ...styles.errorCard}}>
        <div style={styles.ticker}>ERROR</div>
        <p style={styles.errorText}>{result.error}</p>
      </div>
    )
  }

  return (
    <div style={styles.card} onClick={onClick}>
      <div style={styles.header}>
        <span style={styles.ticker}>{ticker}</span>
        <span
          style={{
            ...styles.verdict,
            color: getVerdictColor(verdict),
            background: getVerdictBg(verdict),
          }}
        >
          {verdict}
        </span>
      </div>

      <div style={styles.confidenceRow}>
        <span style={styles.confidenceLabel}>CONFIDENCE</span>
        <span style={styles.confidenceValue}>
          {Math.round((confidence || 0) * 100)}%
        </span>
      </div>

      <div style={styles.riskRow}>
        <span style={styles.riskLabel}>RISK:</span>
        <span style={styles.riskValue}>{risk}</span>
      </div>

      <div style={styles.clickHint}>
        CLICK FOR DETAILS →
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    background: 'rgba(16, 185, 129, 0.04)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '4px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  errorCard: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    background: 'rgba(239, 68, 68, 0.04)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  ticker: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '0.1em',
  },
  verdict: {
    padding: '4px 12px',
    borderRadius: '2px',
    fontSize: '0.85rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  confidenceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '2px',
    marginBottom: '10px',
  },
  confidenceLabel: {
    color: '#4b6a5e',
    fontSize: '0.6rem',
    letterSpacing: '0.1em',
  },
  confidenceValue: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#10b981',
  },
  riskRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '12px',
    fontSize: '0.75rem',
  },
  riskLabel: {
    color: '#4b6a5e',
    letterSpacing: '0.05em',
  },
  riskValue: {
    color: '#f59e0b',
  },
  clickHint: {
    textAlign: 'center',
    color: '#2d4a40',
    fontSize: '0.65rem',
    letterSpacing: '0.1em',
    marginTop: '8px',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.8rem',
  },
}