"""
Risk Officer agent prompt and logic.
"""
import json
from typing import Dict, Any
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.llm import llm_service


RISK_OFFICER_SYSTEM_PROMPT = """You are a Risk Officer in a stock analysis arena. Your role is to assess risk levels and determine if any constraints are violated.

You are an EXPERT in risk management, portfolio protection, and volatility analysis. Think deeply and show your complete reasoning process.

Your characteristics:
- Focus on volatility, downside protection, and risk limits
- Evaluate: P/E ratio extremes, volatility metrics, concentration risk, market sentiment
- You have AUTHORITY to override and force a specific recommendation if risk is unacceptable
- Consider risk-reward tradeoff objectively
- ALWAYS show your chain-of-thought reasoning step by step

CRITICAL: Your reasoning field is extremely important. Users will see exactly how you evaluate risk. Make it detailed, structured, and comprehensive.

Risk Thresholds:
- HIGH risk: P/E > 100, extreme volatility, major red flags
- MEDIUM risk: P/E 50-100, elevated volatility, some concerns
- LOW risk: P/E < 50, stable metrics, manageable risks

Chain-of-Thought Format for Reasoning (include this in your reasoning output):
1. RISK EXTRACTION: List all risk metrics you examined (P/E, volatility, news sentiment, sector risks)
2. METRIC ANALYSIS: For each metric, explain the risk threshold and whether it's triggered
3. COMPOUND RISK: How do these risks interact? Do they compound?
4. SEVERITY WEIGHTING: Which risks are most severe and why?
5. DECISION MATRIX: How does each risk factor influence your final recommendation?
6. OVERRIDE ANALYSIS: Should you override the majority vote? Why or why not?
7. FINAL ASSESSMENT: Synthesize all risk factors into your risk level and recommendation

Your reasoning should be at least 300 words showing your complete analytical process.

Output Format (JSON):
{
    "risk_level": "LOW | MEDIUM | HIGH",
    "constraints_triggered": ["constraint1", "constraint2", ...],
    "override": true/false,
    "final_recommendation": "BUY | HOLD | SELL",
    "reasoning": "Your detailed step-by-step chain-of-thought risk analysis (minimum 300 words)."
}

IMPORTANT: Output ONLY valid JSON, no explanations or additional text. The reasoning field must be comprehensive."""


def analyze_risk(stock_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze stock data from a risk perspective.

    Args:
        stock_data: Dictionary with ticker, news, and financials

    Returns:
        Risk officer output as dict
    """
    ticker = stock_data.get("ticker", "")
    news = stock_data.get("news", [])
    financials = stock_data.get("financials", {})

    # Build context for the LLM
    news_summary = "\n".join([
        f"- {article.get('title', '')}: {article.get('summary', '')}"
        for article in news[:5]
    ])

    financials_summary = "\n".join([
        f"- {key}: {value}"
        for key, value in financials.items()
    ])

    # Try to parse P/E ratio as float for threshold checking
    pe_ratio_str = financials.get("pe_ratio", "")
    try:
        pe_ratio = float(pe_ratio_str) if pe_ratio_str else 0
    except:
        pe_ratio = 0

    user_prompt = f"""Analyze {ticker} for investment RISK. This is a critical risk assessment - think deeply and show ALL your reasoning.

Latest News:
{news_summary}

Key Financials:
{financials_summary}

P/E Ratio: {pe_ratio_str}

EXPOSE YOUR COMPLETE THINKING PROCESS. Your reasoning must be MINIMUM 300 WORDS and include:

1. RISK EXTRACTION: List every risk metric you examined
   - P/E ratio and what it indicates
   - Volatility measures
   - News sentiment risks
   - Sector-specific risks

2. THRESHOLD ANALYSIS: For EACH metric:
   - What is the threshold for this risk?
   - What value did you find?
   - Is the threshold triggered? Why or why not?

3. COMPOUND RISK: How do these risks interact?
   - Do they compound each other?
   - Are there any mitigating factors?

4. SEVERITY WEIGHTING: Which risks are most severe?
   - Which ones justify an override?

5. DECISION MATRIX: How does each risk factor influence your recommendation?
   - BUY: Low risk, good risk-reward
   - HOLD: Medium risk, uncertain outlook
   - SELL: High risk, poor risk-reward

6. OVERRIDE DECISION: Should you force a specific recommendation?
   - What would make you override the majority?
   - What specific conditions trigger override?

7. SYNTHESIS: How do all risk factors lead to your final assessment?

Provide your risk assessment as JSON with:
- risk_level: "LOW", "MEDIUM", or "HIGH"
- constraints_triggered: array of triggered risk constraints
- override: true if you want to force a specific recommendation
- final_recommendation: "BUY", "HOLD", or "SELL"
- reasoning: MINIMUM 300 WORDS - your complete chain-of-thought risk evaluation"""

    result = llm_service.chat_json(
        system_prompt=RISK_OFFICER_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        temperature=0.3,
        max_tokens=2000
    )

    # Ensure required fields
    if "risk_level" not in result:
        result["risk_level"] = "MEDIUM"
    if "constraints_triggered" not in result:
        result["constraints_triggered"] = []
    if "override" not in result:
        result["override"] = False
    if "final_recommendation" not in result:
        result["final_recommendation"] = "HOLD"
    if "reasoning" not in result or not result.get("reasoning"):
        result["reasoning"] = f"Risk assessment for {ticker} completed. Evaluated financial metrics and news sentiment to determine risk level and recommendation."

    # Auto-override if P/E is extreme
    if pe_ratio > 100:
        result["risk_level"] = "HIGH"
        result["constraints_triggered"] = result.get("constraints_triggered", []) + ["extreme_pe_ratio"]
        result["override"] = True
        result["final_recommendation"] = "SELL"
        result["reasoning"] = f"Extreme P/E ratio of {pe_ratio} detected. This triggers automatic HIGH risk override. Recommendation changed to SELL to protect against overvaluation risk."

    return result