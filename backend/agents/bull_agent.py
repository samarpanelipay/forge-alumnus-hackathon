"""
Bull agent prompt and logic.
"""
import json
from typing import Dict, Any
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.llm import llm_service


BULL_SYSTEM_PROMPT = """You are a Bull Agent in a stock analysis arena. Your role is to identify and advocate for the BULLISH case for a stock.

You are an EXPERT in technical analysis, fundamental analysis, and market sentiment. Think deeply and show your complete reasoning process.

Your characteristics:
- Focus on upside potential, growth opportunities, and positive catalysts
- Look for reasons to BUY
- Consider: revenue growth, market share gains, product innovation, analyst upgrades, insider buying
- Be optimistic but grounded in data
- ALWAYS show your chain-of-thought reasoning step by step

CRITICAL: Your reasoning field is extremely important. Users will see exactly how you think. Make it detailed, structured, and comprehensive.

Chain-of-Thought Format for Reasoning (include this in your reasoning output):
1. DATA EXTRACTION: List the specific data points you examined (from news, financials, market data)
2. DATA INTERPRETATION: For each data point, explain what it means and how you interpreted it
3. CORRELATION: Show how different data points relate to each other
4. WEIGHTING: Explain which factors you gave more weight and why
5. COUNTER-ANALYSIS: Address potential weaknesses in your bullish case
6. FINAL THESIS: Synthesize all points into your final bullish stance
7. CONDITIONAL OPTIMISM: State what would need to happen to change your view

Your reasoning should be at least 300 words showing your complete analytical process.

Output Format (JSON):
{
    "stance": "BULL",
    "arguments": ["reason 1", "reason 2", ...],
    "confidence": 0.0-1.0,
    "reasoning": "Your detailed step-by-step chain-of-thought analysis (minimum 300 words)."
}

IMPORTANT: Output ONLY valid JSON, no explanations or additional text. The reasoning field must be comprehensive."""


def analyze_as_bull(stock_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze stock data from a bullish perspective.

    Args:
        stock_data: Dictionary with ticker, news, and financials

    Returns:
        Bull agent output as dict
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

    user_prompt = f"""Analyze {ticker} from a BULLISH perspective. This is a critical investment decision - think deeply and show ALL your reasoning.

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
   - Why is it positive/negative?

3. CORRELATION ANALYSIS: How do these data points connect?
   - Which points reinforce each other?
   - Are there any contradictions?

4. WEIGHTING: Which factors matter most and why?
   - Give more detail on high-impact factors

5. COUNTER-ANALYSIS: What are the weaknesses in this bullish case?
   - What could go wrong?
   - What are bears likely to point out?

6. SYNTHESIS: How do all these points lead to your bullish conclusion?

7. CONDITIONAL THRESHOLD: What specific conditions would change your mind?

Provide your bullish investment thesis as JSON with:
- stance: "BULL"
- arguments: array of 5-7 bullish arguments (detailed, specific)
- confidence: a number between 0 and 1
- reasoning: MINIMUM 300 WORDS - your complete chain-of-thought showing every step of your analysis"""

    result = llm_service.chat_json(
        system_prompt=BULL_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        temperature=0.7,
        max_tokens=2000
    )

    # Ensure required fields
    if "stance" not in result:
        result["stance"] = "BULL"
    if "arguments" not in result:
        result["arguments"] = ["Strong growth potential"]
    if "confidence" not in result:
        result["confidence"] = 0.7
    if "reasoning" not in result or not result.get("reasoning"):
        result["reasoning"] = f"Based on analysis of {ticker}'s news and financials, I identified key bullish factors. The positive news sentiment combined with financial metrics indicate upside potential."

    # Normalize confidence to 0-1 range
    try:
        conf = float(result["confidence"])
        if conf > 1:
            conf = conf / 100
        conf = max(0.0, min(1.0, conf))
        result["confidence"] = round(conf, 2)
    except:
        result["confidence"] = 0.7

    return result