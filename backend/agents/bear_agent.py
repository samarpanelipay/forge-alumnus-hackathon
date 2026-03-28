"""
Bear agent prompt and logic.
"""
import json
from typing import Dict, Any
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.llm import llm_service


BEAR_SYSTEM_PROMPT = """You are a Bear Agent in a stock analysis arena. Your role is to identify and advocate for the BEARISH case for a stock.

You are an EXPERT in risk analysis, forensic accounting, and market corrections. Think deeply and show your complete reasoning process.

Your characteristics:
- Focus on risks, overvaluation, and negative catalysts
- Look for reasons to SELL or stay cautious
- Consider: overvaluation, competition, regulatory risks, macroeconomic headwinds, declining metrics
- Be skeptical but fair
- ALWAYS show your chain-of-thought reasoning step by step

CRITICAL: Your reasoning field is extremely important. Users will see exactly how you think. Make it detailed, structured, and comprehensive.

Chain-of-Thought Format for Reasoning (include this in your reasoning output):
1. DATA EXTRACTION: List the specific data points you examined (from news, financials, market data)
2. DATA INTERPRETATION: For each data point, explain what it means and how you interpreted it
3. CORRELATION: Show how different data points relate to each other
4. WEIGHTING: Explain which factors you gave more weight and why
5. BULL-COUNTER: Address potential strengths in the bullish case and why they don't outweigh risks
6. FINAL THESIS: Synthesize all points into your final bearish stance
7. CONDITIONAL PESSIMISM: State what specific improvements would change your view

Your reasoning should be at least 300 words showing your complete analytical process.

Output Format (JSON):
{
    "stance": "BEAR",
    "arguments": ["reason 1", "reason 2", ...],
    "confidence": 0.0-1.0,
    "reasoning": "Your detailed step-by-step chain-of-thought analysis (minimum 300 words)."
}

IMPORTANT: Output ONLY valid JSON, no explanations or additional text. The reasoning field must be comprehensive."""


def analyze_as_bear(stock_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze stock data from a bearish perspective.

    Args:
        stock_data: Dictionary with ticker, news, and financials

    Returns:
        Bear agent output as dict
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

    user_prompt = f"""Analyze {ticker} from a BEARISH perspective. This is a critical investment decision - think deeply and show ALL your reasoning.

Latest News:
{news_summary}

Key Financials:
{financials_summary}

EXPOSE YOUR COMPLETE THINKING PROCESS. Your reasoning must be MINIMUM 300 WORDS and include:

1. DATA EXTRACTION: List every specific data point you examined
   - News headlines and what they indicate
   - Financial metrics and their values
   - Market indicators

2. DATA INTERPRETATION: For EACH data point:
   - What does this data point mean?
   - How does it relate to the company's fundamentals?
   - Why is it negative/risky?

3. CORRELATION ANALYSIS: How do these risk factors connect?
   - Which risks compound each other?
   - Are there any mitigating factors?

4. WEIGHTING: Which risks matter most and why?
   - Give more detail on high-impact risks

5. BULL-COUNTER: What are the strengths in the bullish case?
   - Why don't these strengths outweigh the risks?
   - What are the flaws in bullish arguments?

6. SYNTHESIS: How do all these points lead to your bearish conclusion?

7. CONDITIONAL THRESHOLD: What specific improvements would change your view to bullish?

Provide your bearish investment thesis as JSON with:
- stance: "BEAR"
- arguments: array of 5-7 bearish arguments (detailed, specific)
- confidence: a number between 0 and 1
- reasoning: MINIMUM 300 WORDS - your complete chain-of-thought showing every step of your analysis"""

    result = llm_service.chat_json(
        system_prompt=BEAR_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        temperature=0.7,
        max_tokens=2000
    )

    # Ensure required fields
    if "stance" not in result:
        result["stance"] = "BEAR"
    if "arguments" not in result:
        result["arguments"] = ["Valuation concerns"]
    if "confidence" not in result:
        result["confidence"] = 0.6
    if "reasoning" not in result or not result.get("reasoning"):
        result["reasoning"] = f"Based on analysis of {ticker}'s news and financials, I identified key bearish factors. The negative news sentiment and financial metrics indicate downside risks."

    # Normalize confidence to 0-1 range
    try:
        conf = float(result["confidence"])
        if conf > 1:
            conf = conf / 100
        conf = max(0.0, min(1.0, conf))
        result["confidence"] = round(conf, 2)
    except:
        result["confidence"] = 0.6

    return result