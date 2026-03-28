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
        <div style={styles.ticker}>Error</div>
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
        <span style={styles.confidenceLabel}>Confidence</span>
        <span style={styles.confidenceValue}>
          {Math.round((confidence || 0) * 100)}%
        </span>
      </div>

      <div style={styles.riskRow}>
        <span style={styles.riskLabel}>Risk:</span>
        <span style={styles.riskValue}>{risk}</span>
      </div>

      <div style={styles.clickHint}>
        Click for full analysis →
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  errorCard: {
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  ticker: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#fff',
  },
  verdict: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '1rem',
    fontWeight: 700,
  },
  confidenceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  confidenceLabel: {
    color: '#8892b0',
    fontSize: '0.9rem',
  },
  confidenceValue: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#64ffda',
  },
  riskRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    fontSize: '0.9rem',
  },
  riskLabel: {
    color: '#8892b0',
  },
  riskValue: {
    color: '#f59e0b',
  },
  clickHint: {
    textAlign: 'center',
    color: '#5a6785',
    fontSize: '0.8rem',
    marginTop: '8px',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: '0.9rem',
  },
}