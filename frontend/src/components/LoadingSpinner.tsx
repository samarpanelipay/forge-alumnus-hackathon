export default function LoadingSpinner() {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}>
        <div style={styles.ring}></div>
        <div style={styles.ring}></div>
        <div style={styles.ring}></div>
      </div>
      <p style={styles.text}>Analyzing stock with AI agents...</p>
      <div style={styles.steps}>
        <span>📰 Collecting Data</span>
        <span>🐂 Bull Analysis</span>
        <span>🐻 Bear Analysis</span>
        <span>🛡️ Risk Assessment</span>
        <span>⚖️ Debate & Vote</span>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  spinner: {
    display: 'inline-flex',
    gap: '8px',
    marginBottom: '20px',
  },
  ring: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#667eea',
    animation: 'bounce 1.4s infinite ease-in-out both',
  },
  text: {
    color: '#8892b0',
    fontSize: '1.1rem',
    marginBottom: '20px',
  },
  steps: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '16px',
    color: '#5a6785',
    fontSize: '0.9rem',
  },
}

// Add animation keyframes via a style tag
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
  .spinner div:nth-child(1) { animation-delay: -0.32s; }
  .spinner div:nth-child(2) { animation-delay: -0.16s; }
`
document.head.appendChild(styleSheet)