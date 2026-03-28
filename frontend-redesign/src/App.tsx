import { useState } from 'react'
import StockInput from './components/StockInput'
import AgentPanel from './components/AgentPanel'
import VerdictDisplay from './components/VerdictDisplay'
import DebatePanel from './components/DebatePanel'
import LoadingSpinner from './components/LoadingSpinner'
import TickerCard from './components/TickerCard'
import { analyzeStock, analyzeBatch, AnalysisResult } from './api'

function App() {
  const [loading, setLoading] = useState(false)
  const [loadingCount, setLoadingCount] = useState(0)
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (ticker: string) => {
    setLoading(true)
    setLoadingCount(1)
    setError(null)
    setResults([])
    setSelectedResult(null)

    try {
      const data = await analyzeStock(ticker)
      setResults([data])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
      setLoadingCount(0)
    }
  }

  const handleAnalyzeBatch = async (tickers: string[]) => {
    setLoading(true)
    setLoadingCount(tickers.length)
    setError(null)
    setResults([])
    setSelectedResult(null)

    try {
      const data = await analyzeBatch(tickers)
      if (data.success) {
        setResults(data.results.filter(r => r.success))
        if (data.errors.length > 0) {
          setError(`Some analyses failed: ${data.errors.join(', ')}`)
        }
      } else {
        setError(data.errors.join(', ') || 'Batch analysis failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
      setLoadingCount(0)
    }
  }

  const handleSelectResult = (result: AnalysisResult) => {
    setSelectedResult(result)
  }

  const handleBackToGrid = () => {
    setSelectedResult(null)
  }

  return (
    <div style={styles.container}>
      <div style={styles.gridOverlay} aria-hidden="true" />

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logoMark}>
            <span style={styles.logoIcon}>⚖</span>
          </div>
          <div>
            <h1 style={styles.title}>STOCK VERDICT ARENA</h1>
            <p style={styles.subtitle}>Multi-agent AI analysis · Bull · Bear · Risk Officer</p>
          </div>
          <div style={styles.headerBadge}>
            <span style={styles.liveDot} />
            LIVE
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <StockInput
          onAnalyze={handleAnalyze}
          onAnalyzeBatch={handleAnalyzeBatch}
          loading={loading}
          loadingCount={loadingCount}
        />

        {loading && <LoadingSpinner />}

        {error && (
          <div style={styles.error}>
            <span style={styles.errorIcon}>!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Grid View for Multiple Results */}
        {results.length > 1 && !loading && (
          <div style={styles.grid}>
            {results.map((result, index) => (
              <TickerCard
                key={index}
                result={result}
                onClick={() => handleSelectResult(result)}
              />
            ))}
          </div>
        )}

        {/* Single Result or Selected Result Detail View */}
        {(selectedResult || (results.length === 1 && results[0] && !loading)) && (
          <div style={styles.detailView}>
            {selectedResult ? (
              <>
                <button onClick={handleBackToGrid} style={styles.backButton}>
                  ← BACK TO COMPARISON
                </button>
                <VerdictDisplay verdict={selectedResult.data!} />
                <DebatePanel
                  debateSummary={selectedResult.data?.debate_summary}
                  debateMessages={selectedResult.data?.debate_messages}
                />
                <AgentPanel
                  bull={selectedResult.bull_analysis}
                  bear={selectedResult.bear_analysis}
                  risk={selectedResult.risk_analysis}
                />
              </>
            ) : results[0]?.data ? (
              <>
                <VerdictDisplay verdict={results[0].data} />
                <DebatePanel
                  debateSummary={results[0].data?.debate_summary}
                  debateMessages={results[0].data?.debate_messages}
                />
                <AgentPanel
                  bull={results[0].bull_analysis}
                  bear={results[0].bear_analysis}
                  risk={results[0].risk_analysis}
                />
              </>
            ) : null}
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <span style={styles.footerDivider}>◆</span>
          <span>Powered by LangGraph · Featherless.ai · Bright Data</span>
          <span style={styles.footerDivider}>◆</span>
        </div>
      </footer>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#080c10',
    color: '#e2e8f0',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    position: 'relative',
    overflow: 'hidden',
  },
  gridOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
    position: 'relative',
    zIndex: 1,
    background: 'rgba(8, 12, 16, 0.95)',
  },
  headerInner: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  logoMark: {
    width: '48px',
    height: '48px',
    border: '2px solid #10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: 'rgba(16, 185, 129, 0.08)',
  },
  logoIcon: {
    fontSize: '1.5rem',
    color: '#10b981',
    lineHeight: 1,
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: '#f1f5f9',
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '0.72rem',
    color: '#4b6a5e',
    margin: '4px 0 0',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
  },
  headerBadge: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.7rem',
    letterSpacing: '0.12em',
    color: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    padding: '4px 10px',
    flexShrink: 0,
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#10b981',
    display: 'inline-block',
    boxShadow: '0 0 8px #10b981',
  },
  main: {
    flex: 1,
    maxWidth: '1100px',
    width: '100%',
    margin: '0 auto',
    padding: '32px 24px',
    position: 'relative',
    zIndex: 1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  detailView: {
    marginTop: '20px',
  },
  backButton: {
    padding: '10px 20px',
    marginBottom: '20px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '4px',
    color: '#10b981',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    letterSpacing: '0.05em',
    transition: 'background 0.2s',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 18px',
    background: 'rgba(239, 68, 68, 0.06)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    marginTop: '20px',
    color: '#f87171',
    fontSize: '0.9rem',
  },
  errorIcon: {
    width: '22px',
    height: '22px',
    border: '1.5px solid #ef4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '0.85rem',
    fontWeight: 700,
    borderRadius: '2px',
  },
  footer: {
    borderTop: '1px solid rgba(16, 185, 129, 0.15)',
    position: 'relative',
    zIndex: 1,
  },
  footerInner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    color: '#2d4a40',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
  },
  footerDivider: {
    fontSize: '0.5rem',
    color: '#10b981',
    opacity: 0.4,
  },
}

export default App