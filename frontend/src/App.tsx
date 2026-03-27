import { useState } from 'react'
import StockInput from './components/StockInput'
import AgentPanel from './components/AgentPanel'
import VerdictDisplay from './components/VerdictDisplay'
import DebatePanel from './components/DebatePanel'
import LoadingSpinner from './components/LoadingSpinner'
import { analyzeStock, AnalysisResult } from './api'

function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (ticker: string) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await analyzeStock(ticker)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>
          <span style={styles.titleIcon}>⚖️</span>
          Stock Verdict Arena
        </h1>
        <p style={styles.subtitle}>
          Multi-agent AI analysis with Bull, Bear & Risk Officer
        </p>
      </header>

      <main style={styles.main}>
        <StockInput onAnalyze={handleAnalyze} loading={loading} />

        {loading && <LoadingSpinner />}

        {error && (
          <div style={styles.error}>
            <span>⚠️</span> {error}
          </div>
        )}

        {result && !loading && result.data && (
          <>
            <VerdictDisplay verdict={result.data} />
            <DebatePanel debateSummary={result.data?.debate_summary} />
            <AgentPanel
              bull={result.bull_analysis}
              bear={result.bear_analysis}
              risk={result.risk_analysis}
            />
          </>
        )}
      </main>

      <footer style={styles.footer}>
        <p>Powered by LangGraph • Featherless.ai • Bright Data</p>
      </footer>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    textAlign: 'center',
    padding: '40px 20px 20px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  titleIcon: {
    fontSize: '2rem',
  },
  subtitle: {
    color: '#8892b0',
    fontSize: '1.1rem',
  },
  main: {
    flex: 1,
    maxWidth: '900px',
    width: '100%',
    margin: '0 auto',
    padding: '20px',
  },
  error: {
    background: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid #ff6b6b',
    borderRadius: '12px',
    padding: '16px 20px',
    color: '#ff6b6b',
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    color: '#5a6785',
    fontSize: '0.9rem',
  },
}

export default App