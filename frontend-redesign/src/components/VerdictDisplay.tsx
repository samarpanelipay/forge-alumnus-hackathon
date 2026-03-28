import { StockVerdict } from '../api'

interface VerdictDisplayProps {
  verdict: StockVerdict
}

export default function VerdictDisplay({ verdict }: VerdictDisplayProps) {
  const getVerdictConfig = (v: string) => {
    switch (v) {
      case 'BUY':
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.4)', glow: '0 0 24px rgba(16, 185, 129, 0.15)', label: 'BUY' }
      case 'SELL':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.4)', glow: '0 0 24px rgba(239, 68, 68, 0.15)', label: 'SELL' }
      default:
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.4)', glow: '0 0 24px rgba(245, 158, 11, 0.15)', label: 'HOLD' }
    }
  }

  const cfg = getVerdictConfig(verdict.verdict)
  const pct = Math.round(verdict.confidence * 100)
  const bars = 20
  const filled = Math.round((pct / 100) * bars)

  return (
    <div style={{ ...styles.card, borderColor: cfg.border, boxShadow: cfg.glow }}>
      {/* Top strip */}
      <div style={{ ...styles.topStrip, background: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}>
        <div style={styles.topLeft}>
          <span style={styles.tickerLabel}>TICKER</span>
          <span style={{ ...styles.tickerValue, color: cfg.color }}>{verdict.ticker}</span>
        </div>
        <div style={styles.verdictBig}>
          <span style={styles.verdictLabel}>VERDICT</span>
          <span style={{ ...styles.verdictValue, color: cfg.color }}>{cfg.label}</span>
        </div>
        <div style={styles.topRight}>
          <span style={styles.confLabel}>CONFIDENCE</span>
          <span style={{ ...styles.confValue, color: cfg.color }}>{pct}%</span>
        </div>
      </div>

      {/* Confidence bar */}
      <div style={styles.barRow}>
        <span style={styles.barLabel}>{'['}
          {Array.from({ length: bars }).map((_, i) => (
            <span key={i} style={{ color: i < filled ? cfg.color : '#1a2e28' }}>█</span>
          ))}
          {']'}
        </span>
      </div>

      {/* Cases */}
      <div style={styles.cases}>
        <div style={styles.caseBox}>
          <div style={styles.caseHeader}>
            <span style={{ ...styles.caseTag, color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>BULL CASE</span>
          </div>
          <p style={styles.caseText}>{verdict.bull_case}</p>
        </div>
        <div style={styles.caseDivider} />
        <div style={styles.caseBox}>
          <div style={styles.caseHeader}>
            <span style={{ ...styles.caseTag, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>BEAR CASE</span>
          </div>
          <p style={styles.caseText}>{verdict.bear_case}</p>
        </div>
      </div>

      {/* Footer row */}
      <div style={styles.footRow}>
        <div style={styles.riskPill}>
          <span style={styles.riskLabelText}>RISK —</span>
          <span style={styles.riskValueText}>{verdict.risk_summary}</span>
        </div>
        {verdict.dissent && (
          <div style={styles.dissentPill}>
            <span style={styles.dissentMark}>◆ DISSENT:</span>
            <span style={styles.dissentText}>{verdict.dissent}</span>
          </div>
        )}
        <div style={styles.sourceTag}>
          {verdict.source === 'risk_override' ? 'RISK OVERRIDE' : 'MAJORITY VOTE'}
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    border: '1px solid',
    marginBottom: '20px',
    background: '#0a1612',
    overflow: 'hidden',
  },
  topStrip: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    gap: '16px',
  },
  topLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  tickerLabel: {
    fontSize: '0.6rem',
    letterSpacing: '0.15em',
    color: '#2d6a5a',
  },
  tickerValue: {
    fontSize: '2.4rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    lineHeight: 1,
  },
  verdictBig: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
  },
  verdictLabel: {
    fontSize: '0.6rem',
    letterSpacing: '0.15em',
    color: '#2d6a5a',
  },
  verdictValue: {
    fontSize: '2.8rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    lineHeight: 1,
  },
  topRight: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '2px',
  },
  confLabel: {
    fontSize: '0.6rem',
    letterSpacing: '0.15em',
    color: '#2d6a5a',
  },
  confValue: {
    fontSize: '2.4rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    lineHeight: 1,
  },
  barRow: {
    padding: '8px 24px 12px',
    borderBottom: '1px solid rgba(16, 185, 129, 0.08)',
  },
  barLabel: {
    fontSize: '0.85rem',
    letterSpacing: '0.02em',
    fontFamily: 'inherit',
  },
  cases: {
    display: 'grid',
    gridTemplateColumns: '1fr 1px 1fr',
    gap: '0',
    padding: '20px 24px',
  },
  caseBox: {
    padding: '0 16px',
  },
  caseDivider: {
    background: 'rgba(16, 185, 129, 0.1)',
    width: '1px',
  },
  caseHeader: {
    marginBottom: '10px',
  },
  caseTag: {
    fontSize: '0.65rem',
    letterSpacing: '0.12em',
    border: '1px solid',
    padding: '2px 8px',
    fontFamily: 'inherit',
  },
  caseText: {
    color: '#94a3b8',
    fontSize: '0.88rem',
    lineHeight: 1.65,
    margin: 0,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  footRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 24px',
    borderTop: '1px solid rgba(16, 185, 129, 0.08)',
    background: 'rgba(0,0,0,0.2)',
    flexWrap: 'wrap' as const,
  },
  riskPill: {
    display: 'flex',
    gap: '8px',
    fontSize: '0.78rem',
  },
  riskLabelText: {
    color: '#2d6a5a',
    letterSpacing: '0.08em',
  },
  riskValueText: {
    color: '#f59e0b',
  },
  dissentPill: {
    display: 'flex',
    gap: '8px',
    fontSize: '0.78rem',
    color: '#94a3b8',
  },
  dissentMark: {
    color: '#f59e0b',
    letterSpacing: '0.05em',
  },
  dissentText: {
    color: '#94a3b8',
  },
  sourceTag: {
    marginLeft: 'auto',
    fontSize: '0.65rem',
    letterSpacing: '0.1em',
    color: '#1e4a3a',
    border: '1px solid rgba(16, 185, 129, 0.1)',
    padding: '3px 10px',
  },
}
