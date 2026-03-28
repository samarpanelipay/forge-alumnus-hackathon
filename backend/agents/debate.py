"""
Debate loop logic for agent critiques.
"""
import json
from typing import Dict, Any, List
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.llm import llm_service


DEBATE_SYSTEM_PROMPT = """You are orchestrating a live stock analysis DEBATE between three expert agents: Bull, Bear, and Risk Officer.

The debate should be DYNAMIC and BACK-AND-FORTH, not just one-sided. Each agent should respond to and challenge the others.

CRITICAL REQUIREMENTS:
- Each agent's message should be MINIMUM 150 words with specific points
- Show actual debate: agents challenging, counter-arguing, defending positions
- Include specific data points, metrics, and counter-arguments
- Make it feel like a real investment committee debate

Debate Flow (you can adapt based on the arguments):
1. Bull presents thesis with specific bullish points
2. Bear counters with specific bearish counter-points
3. Risk Officer weighs in on risk aspects
4. Bull responds to Bear's concerns
5. Bear responds to Bull's arguments
6. Risk Officer gives final risk-adjusted recommendation

Each agent should reference specific data points and challenge each other's assumptions.

OUTPUT ONLY JSON - NO thinking, NO explanations, NO markdown. Just the JSON.

Format:
{
  "messages": [
    {"agent": "Bull", "content": "Detailed bull argument (150+ words) with specific points..."},
    {"agent": "Bear", "content": "Detailed bear counter-argument (150+ words) with specific points..."},
    {"agent": "Risk", "content": "Detailed risk assessment (150+ words)..."},
    {"agent": "Bull", "content": "Bull responds to Bear concerns (100+ words)..."},
    {"agent": "Bear", "content": "Bear responds to Bull defense (100+ words)..."},
    {"agent": "Risk", "content": "Final risk-adjusted verdict (100+ words)..."}
  ],
  "critiques": [
    {"target": "Bull", "critique": "Summary of bull's key points..."},
    {"target": "Bear", "critique": "Summary of bear's key points..."},
    {"target": "Risk", "critique": "Summary of risk assessment..."}
  ]
}"""


def run_debate_round(
    bull_analysis: Dict[str, Any],
    bear_analysis: Dict[str, Any],
    risk_analysis: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Run a multi-round debate where agents critique each other in back-and-forth format.

    Args:
        bull_analysis: Bull agent's output (includes reasoning)
        bear_analysis: Bear agent's output (includes reasoning)
        risk_analysis: Risk officer's output (includes reasoning)

    Returns:
        Debate round with messages and critiques
    """
    # Include reasoning in the debate context for richer discussion
    user_prompt = f"""Bull: {bull_analysis.get('arguments')}. Bear: {bear_analysis.get('arguments')}. Risk: {risk_analysis.get('final_recommendation')}.

Create debate JSON only. No text before or after. No thinking. Just output:
{{"messages": [{{"agent": "Bull", "content": "..."}}, {{"agent": "Bear", "content": "..."}}, {{"agent": "Risk", "content": "..."}}], "critiques": [{{"target": "Bull", "critique": "..."}}, {{"target": "Bear", "critique": "..."}}]}}"""


    result = llm_service.chat_json(
        system_prompt=DEBATE_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        temperature=0.2
    )

    # Ensure messages and critiques exist
    if "messages" not in result:
        result["messages"] = []
    if "critiques" not in result:
        result["critiques"] = []

    # If still empty, try to parse from raw
    if not result["messages"] or not result["critiques"]:
        raw = result.get("raw", "")
        if not raw:
            raw = llm_service.chat(
                system_prompt=DEBATE_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=0.2
            )

        # Try to extract JSON from raw
        import re
        json_match = re.search(r'\{[\s\S]*\}', raw)
        if json_match:
            try:
                parsed = json.loads(json_match.group(0))
                if "messages" in parsed:
                    result["messages"] = parsed["messages"]
                if "critiques" in parsed:
                    result["critiques"] = parsed["critiques"]
            except:
                pass

    return result