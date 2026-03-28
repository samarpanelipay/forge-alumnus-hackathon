import { useState, FormEvent } from 'react'

interface StockInputProps {
  onAnalyze: (ticker: string) => void
  onAnalyzeBatch: (tickers: string[]) => void
  loading: boolean
  loadingCount?: number
}

export default function StockInput({ onAnalyze, onAnalyzeBatch, loading, loadingCount = 0 }: StockInputProps) {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)

  const parseTickers = (value: string): string[] => {
    return value
      .toUpperCase()
      .split(/[\s,]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .slice(0, 10)
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

  const tickers = parseTickers(input)
  const isMultiMode = tickers.length > 1

  const handleChipClick = (ticker: string) => {
    if (loading) return
    onAnalyze(ticker)
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.labelRow}>
        <span style={styles.label}>// {isMultiMode ? 'ENTER MULTIPLE TICKERS' : 'ENTER TICKER SYMBOL'}</span>
        <span style={styles.counter}>{tickers.length} {tickers.length === 1 ? 'ticker' : 'tickers'}</span>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={{ ...styles.inputWrap, ...(focused ? styles.inputWrapFocused : {}) }}>
          <span style={styles.prompt}>&gt;_</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder={isMultiMode ? "AAPL, TSLA, GOOGL" : "TSLA"}
            disabled={loading}
            style={{...styles.input, fontSize: isMultiMode ? '1rem' : '1.4rem'}}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button
          type="submit"
          disabled={loading || tickers.length === 0}
          style={{
            ...styles.button,
            ...(loading || tickers.length === 0 ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? (
            <span style={styles.buttonContent}>
              <span style={styles.loadingBar} />
              {loadingCount > 1 ? `ANALYZING ${loadingCount}...` : 'PROCESSING'}
            </span>
          ) : (
            <span style={styles.buttonContent}>
              <span style={styles.buttonArrow}>→</span>
              {isMultiMode ? `ANALYZE ${tickers.length}` : 'ANALYZE'}
            </span>
          )}
        </button>
      </form>

      {tickers.length > 0 && (
        <div style={styles.tickerTags}>
          {tickers.map((t, i) => (
            <span key={i} style={styles.tickerTag}>{t}</span>
          ))}
        </div>
      )}

      <div style={styles.suggestions}>
        <span style={styles.suggestionsLabel}>QUICK:</span>
        {['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'NVDA', 'AMZN'].map((s) => (
          <button
            key={s}
            onClick={() => handleChipClick(s)}
            disabled={loading}
            style={{
              ...styles.chip,
              ...(loading ? styles.chipDisabled : {}),
            }}
          >
            {s}
          </button>
        ))}
        <button
          onClick={() => !loading && onAnalyzeBatch(['AAPL', 'TSLA', 'GOOGL'])}
          disabled={loading}
          style={{
            ...styles.chip,
            ...(loading ? styles.chipDisabled : {}),
          }}
        >
          ALL 3
        </button>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    marginBottom: '36px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  label: {
    fontSize: '0.68rem',
    letterSpacing: '0.1em',
    color: '#2d6a5a',
    fontFamily: 'inherit',
  },
  counter: {
    fontSize: '0.68rem',
    color: '#1e3d35',
    fontFamily: 'inherit',
  },
  form: {
    display: 'flex',
    gap: '0',
  },
  inputWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    background: '#0d1a14',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRight: 'none',
    padding: '0 16px',
    transition: 'border-color 0.2s',
  },
  inputWrapFocused: {
    borderColor: 'rgba(16, 185, 129, 0.7)',
  },
  prompt: {
    color: '#10b981',
    fontSize: '1rem',
    marginRight: '10px',
    opacity: 0.7,
    flexShrink: 0,
    fontFamily: 'inherit',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#f1f5f9',
    fontWeight: 700,
    letterSpacing: '0.15em',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    padding: '16px 0',
    caretColor: '#10b981',
  },
  button: {
    padding: '0 28px',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    border: 'none',
    background: '#10b981',
    color: '#030a07',
    cursor: 'pointer',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    transition: 'background 0.15s',
    flexShrink: 0,
  },
  buttonDisabled: {
    background: '#0e3d2e',
    color: '#1e6a50',
    cursor: 'not-allowed',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  buttonArrow: {
    fontSize: '1.1rem',
  },
  loadingBar: {
    width: '8px',
    height: '8px',
    background: '#1e6a50',
    borderRadius: '50%',
    display: 'inline-block',
  },
  tickerTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '10px',
  },
  tickerTag: {
    padding: '4px 10px',
    background: 'rgba(16, 185, 129, 0.15)',
    borderRadius: '4px',
    fontSize: '0.75rem',
    color: '#10b981',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  suggestions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
  },
  suggestionsLabel: {
    fontSize: '0.65rem',
    color: '#1e4a3a',
    letterSpacing: '0.1em',
    fontFamily: 'inherit',
  },
  chip: {
    padding: '3px 10px',
    background: 'transparent',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    color: '#2d7a62',
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    transition: 'all 0.15s',
  },
  chipDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },
}