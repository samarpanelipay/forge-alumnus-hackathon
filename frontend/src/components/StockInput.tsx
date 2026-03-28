import { useState, FormEvent } from 'react'

interface StockInputProps {
  onAnalyze: (ticker: string) => void
  onAnalyzeBatch: (tickers: string[]) => void
  loading: boolean
  loadingCount?: number
}

export default function StockInput({ onAnalyze, onAnalyzeBatch, loading, loadingCount = 0 }: StockInputProps) {
  const [input, setInput] = useState('')

  const parseTickers = (value: string): string[] => {
    return value
      .toUpperCase()
      .split(/[\s,]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const tickers = parseTickers(input)
    if (tickers.length === 0) return

    if (tickers.length === 1) {
      onAnalyze(tickers[0])
    } else {
      onAnalyzeBatch(tickers)
    }
  }

  const handleAnalyzeSingle = () => {
    const tickers = parseTickers(input)
    if (tickers.length === 1) {
      onAnalyze(tickers[0])
    } else if (tickers.length > 1) {
      onAnalyzeBatch(tickers)
    }
  }

  const tickers = parseTickers(input)

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputGroup}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="Enter stock tickers (e.g., AAPL, TSLA, GOOGL)"
          disabled={loading}
          style={{
            ...styles.input,
            minHeight: '60px',
            resize: 'vertical',
          }}
          rows={2}
        />
        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleAnalyzeSingle}
            disabled={loading || tickers.length === 0}
            style={{
              ...styles.button,
              ...(loading || tickers.length === 0 ? styles.buttonDisabled : {}),
            }}
          >
            {loading
              ? loadingCount > 1
                ? `Analyzing ${loadingCount}...`
                : 'Analyzing...'
              : tickers.length === 1
                ? 'Analyze'
                : `Analyze ${tickers.length} Tickers`}
          </button>
        </div>
      </div>
      {tickers.length > 0 && (
        <div style={styles.tickerList}>
          {tickers.map((t, i) => (
            <span key={i} style={styles.tickerTag}>{t}</span>
          ))}
        </div>
      )}
      <p style={styles.hint}>
        Enter multiple tickers separated by commas or spaces. Try: AAPL, TSLA, GOOGL, MSFT, NVDA, AMZN
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
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    maxWidth: '500px',
    padding: '16px 20px',
    fontSize: '1rem',
    border: '2px solid #2d3748',
    borderRadius: '12px',
    background: '#1a202c',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'monospace',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  button: {
    padding: '14px 28px',
    fontSize: '1rem',
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
  tickerList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    marginTop: '12px',
  },
  tickerTag: {
    padding: '4px 12px',
    background: 'rgba(102, 126, 234, 0.2)',
    borderRadius: '20px',
    fontSize: '0.85rem',
    color: '#a3bffa',
  },
  hint: {
    textAlign: 'center',
    marginTop: '12px',
    color: '#5a6785',
    fontSize: '0.9rem',
  },
}