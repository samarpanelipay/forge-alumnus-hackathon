const API_BASE = 'http://localhost:8000'

export interface StockVerdict {
  ticker: string
  verdict: string
  confidence: number
  bull_case: string
  bull_reasoning: string
  bear_case: string
  bear_reasoning: string
  risk_summary: string
  risk_reasoning: string
  dissent: string
  source: string
  debate_summary: Array<{
    target: string
    critique: string
  }>
  debate_messages: Array<{
    agent: string
    content: string
  }>
}

export interface AnalysisResult {
  success: boolean
  data: StockVerdict | null
  error: string | null
  bull_analysis: {
    stance: string
    arguments: string[]
    confidence: number
    reasoning: string
  } | null
  bear_analysis: {
    stance: string
    arguments: string[]
    confidence: number
    reasoning: string
  } | null
  risk_analysis: {
    risk_level: string
    constraints_triggered: string[]
    override: boolean
    final_recommendation: string
    reasoning: string
  } | null
}

export interface BatchAnalysisResult {
  success: boolean
  results: AnalysisResult[]
  errors: string[]
}

export async function analyzeStock(ticker: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ticker }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

export async function analyzeBatch(tickers: string[]): Promise<BatchAnalysisResult> {
  const response = await fetch(`${API_BASE}/analyze/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tickers }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}