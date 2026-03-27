const API_BASE = 'http://localhost:8000'

export interface StockVerdict {
  ticker: string
  verdict: string
  confidence: number
  bull_case: string
  bear_case: string
  risk_summary: string
  dissent: string
  source: string
  debate_summary: Array<{
    target: string
    critique: string
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
  } | null
  bear_analysis: {
    stance: string
    arguments: string[]
    confidence: number
  } | null
  risk_analysis: {
    risk_level: string
    constraints_triggered: string[]
    override: boolean
    final_recommendation: string
  } | null
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