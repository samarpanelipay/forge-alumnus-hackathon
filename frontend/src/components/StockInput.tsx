import { useState, FormEvent } from 'react'

interface StockInputProps {
  onAnalyze: (ticker: string) => void
  loading: boolean
}

export default function StockInput({ onAnalyze, loading }: StockInputProps) {
  const [ticker, setTicker] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (ticker.trim()) {
      onAnalyze(ticker.trim().toUpperCase())
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputGroup}>
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="Enter stock ticker (e.g., AAPL, TSLA)"
          disabled={loading}
          style={styles.input}
        />
        <button
          type="submit"
          disabled={loading || !ticker.trim()}
          style={{
            ...styles.button,
            ...(loading || !ticker.trim() ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
      <p style={styles.hint}>
        Try: AAPL, TSLA, GOOGL, MSFT, NVDA, AMZN
      </p>
    </form>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  form: {
    marginBottom: '30px',
  },
  inputGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    maxWidth: '400px',
    padding: '16px 20px',
    fontSize: '1.1rem',
    border: '2px solid #2d3748',
    borderRadius: '12px',
    background: '#1a202c',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '16px 32px',
    fontSize: '1.1rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'transform 0.2s, opacity 0.2s',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  hint: {
    textAlign: 'center',
    marginTop: '12px',
    color: '#5a6785',
    fontSize: '0.9rem',
  },
}