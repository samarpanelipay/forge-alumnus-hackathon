"""
LangGraph nodes for the Stock Verdict Arena.

This module defines all the nodes in the LangGraph workflow using pydantic state.
"""
import logging
import sys
import os
from typing import Dict, Any, Literal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pydantic import BaseModel
from langgraph.graph import StateGraph, END
from langgraph.types import Command

# Import state and agents
from agents.state import ArenaState, StockData, BullOutput, BearOutput, RiskOutput
from agents.bull_agent import analyze_as_bull
from agents.bear_agent import analyze_as_bear
from agents.risk_officer import analyze_risk
from agents.debate import run_debate_round

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _extract_critiques(debate: Any) -> list:
    """Extract critiques from debate result."""
    if not debate:
        return []
    if isinstance(debate, dict):
        return debate.get("critiques", [])
    if hasattr(debate, "critiques"):
        return debate.critiques
    return []


def _extract_debate_messages(debate: Any) -> list:
    """Extract debate messages from debate result."""
    if not debate:
        return []
    if isinstance(debate, dict):
        return debate.get("messages", [])
    if hasattr(debate, "messages"):
        return debate.messages
    return []


def collect_data_node(state: ArenaState) -> Dict[str, Any]:
    """
    Data Collection Node - Fetch stock data from Bright Data.
    """
    ticker = state.ticker
    logger.info(f"[DATA COLLECTION] Fetching data for ticker: {ticker}")

    try:
        # Import the sync service
        from services.bright_data import bright_data_service

        # Use sync method
        stock_data_dict = bright_data_service.fetch_all_data(ticker)
        stock_data = StockData(**stock_data_dict)

        stock_data = StockData(**stock_data_dict)

        logger.info(f"[DATA COLLECTION] Successfully fetched data for {ticker}")

        return {
            "stock_data": stock_data
        }

    except Exception as e:
        logger.error(f"[DATA COLLECTION] Error fetching data: {e}")
        return {"error": f"Failed to fetch data: {str(e)}"}


def bull_agent_node(state: ArenaState) -> Dict[str, Any]:
    """
    Bull Agent Node - Analyze from bullish perspective.
    """
    logger.info(f"[BULL AGENT] Starting analysis for {state.ticker}")

    try:
        if not state.stock_data:
            raise ValueError("No stock data available")

        stock_data_dict = state.stock_data.model_dump()
        bull_analysis = analyze_as_bull(stock_data_dict)
        bull_output = BullOutput(**bull_analysis)

        logger.info(f"[BULL AGENT] Completed with confidence: {bull_output.confidence}")

        return {"bull_analysis": bull_output}

    except Exception as e:
        logger.error(f"[BULL AGENT] Error: {e}")
        return {"error": f"Bull agent failed: {str(e)}"}


def bear_agent_node(state: ArenaState) -> Dict[str, Any]:
    """
    Bear Agent Node - Analyze from bearish perspective.
    """
    logger.info(f"[BEAR AGENT] Starting analysis for {state.ticker}")

    try:
        if not state.stock_data:
            raise ValueError("No stock data available")

        stock_data_dict = state.stock_data.model_dump()
        bear_analysis = analyze_as_bear(stock_data_dict)
        bear_output = BearOutput(**bear_analysis)

        logger.info(f"[BEAR AGENT] Completed with confidence: {bear_output.confidence}")

        return {"bear_analysis": bear_output}

    except Exception as e:
        logger.error(f"[BEAR AGENT] Error: {e}")
        return {"error": f"Bear agent failed: {str(e)}"}


def risk_officer_node(state: ArenaState) -> Dict[str, Any]:
    """
    Risk Officer Node - Analyze risk and provide override if needed.
    """
    logger.info(f"[RISK OFFICER] Starting analysis for {state.ticker}")

    try:
        if not state.stock_data:
            raise ValueError("No stock data available")

        stock_data_dict = state.stock_data.model_dump()
        risk_analysis = analyze_risk(stock_data_dict)
        risk_output = RiskOutput(**risk_analysis)

        logger.info(f"[RISK OFFICER] Completed with risk level: {risk_output.risk_level}")

        return {"risk_analysis": risk_output}

    except Exception as e:
        logger.error(f"[RISK OFFICER] Error: {e}")
        return {"error": f"Risk officer failed: {str(e)}"}


def debate_node(state: ArenaState) -> Dict[str, Any]:
    """
    Debate Loop Node - Agents critique each other once.
    """
    logger.info(f"[DEBATE] Starting debate round for {state.ticker}")

    try:
        if not all([state.bull_analysis, state.bear_analysis, state.risk_analysis]):
            raise ValueError("Not all agents have completed analysis")

        bull_dict = state.bull_analysis.model_dump()
        bear_dict = state.bear_analysis.model_dump()
        risk_dict = state.risk_analysis.model_dump()

        debate_result = run_debate_round(bull_dict, bear_dict, risk_dict)

        # Debug: log the actual result
        logger.info(f"[DEBATE] Debate result type: {type(debate_result)}")
        logger.info(f"[DEBATE] Debate result keys: {debate_result.keys() if isinstance(debate_result, dict) else 'N/A'}")
        logger.info(f"[DEBATE] Debate result: {debate_result}")
        logger.info("[DEBATE] Debate round completed")

        return {"debate_rounds": [debate_result]}

    except Exception as e:
        logger.error(f"[DEBATE] Error: {e}")
        return {"error": f"Debate failed: {str(e)}"}


def voting_node(state: ArenaState) -> Dict[str, Any]:
    """
    Voting Node - Combine agent outputs into final verdict.
    """
    logger.info(f"[VOTING] Computing final verdict for {state.ticker}")

    try:
        if not all([state.bull_analysis, state.bear_analysis, state.risk_analysis]):
            raise ValueError("Not all agents have completed analysis")

        bull = state.bull_analysis
        bear = state.bear_analysis
        risk = state.risk_analysis
        debate = state.debate_rounds[0] if state.debate_rounds else {}

        # Check for risk override first
        risk_override = risk.override
        risk_recommendation = risk.final_recommendation

        if risk_override:
            verdict = risk_recommendation
            verdict_source = "risk_override"
            logger.info(f"[VOTING] Using Risk Officer override: {verdict}")
        else:
            # Majority vote
            votes = []

            if bull.confidence > 0.5:
                votes.append("BUY")
            else:
                votes.append("HOLD")

            if bear.confidence > 0.5:
                votes.append("SELL")
            else:
                votes.append("HOLD")

            votes.append(risk_recommendation)

            buy_count = votes.count("BUY")
            sell_count = votes.count("SELL")
            hold_count = votes.count("HOLD")

            if buy_count > sell_count and buy_count > hold_count:
                verdict = "BUY"
            elif sell_count > buy_count and sell_count > hold_count:
                verdict = "SELL"
            else:
                verdict = "HOLD"

            verdict_source = "majority_vote"
            logger.info(f"[VOTING] Majority vote: {verdict} (votes: {votes})")

        # Calculate confidence
        confidences = [bull.confidence, bear.confidence, 1.0 if risk_override else 0.5]
        avg_confidence = sum(confidences) / len(confidences)

        # Determine dissent
        if verdict == "BUY":
            dissent = f"Bear argues: {', '.join(bear.arguments[:2])}"
        elif verdict == "SELL":
            dissent = f"Bull argues: {', '.join(bull.arguments[:2])}"
        else:
            dissent = f"Bull: {bull.arguments[0] if bull.arguments else 'N/A'}; Bear: {bear.arguments[0] if bear.arguments else 'N/A'}"

        final_verdict = {
            "ticker": state.ticker,
            "verdict": verdict,
            "confidence": round(avg_confidence, 2),
            "bull_case": ", ".join(bull.arguments[:3]),
            "bull_reasoning": bull.reasoning,
            "bear_case": ", ".join(bear.arguments[:3]),
            "bear_reasoning": bear.reasoning,
            "risk_summary": f"{risk.risk_level} risk - {', '.join(risk.constraints_triggered)}",
            "risk_reasoning": risk.reasoning,
            "dissent": dissent,
            "source": verdict_source,
            "debate_summary": _extract_critiques(debate),
            "debate_messages": _extract_debate_messages(debate)
        }

        logger.info(f"[VOTING] Final verdict: {verdict} with confidence {avg_confidence}")

        return {"final_verdict": final_verdict}

    except Exception as e:
        logger.error(f"[VOTING] Error: {e}")
        return {"error": f"Voting failed: {str(e)}"}


def create_workflow():
    """
    Create and return the LangGraph workflow using pydantic state.
    """
    workflow = StateGraph(ArenaState)

    # Add nodes
    workflow.add_node("collect_data", collect_data_node)
    workflow.add_node("bull_agent", bull_agent_node)
    workflow.add_node("bear_agent", bear_agent_node)
    workflow.add_node("risk_officer", risk_officer_node)
    workflow.add_node("debate", debate_node)
    workflow.add_node("voting", voting_node)

    # Define edges - parallel execution of agents
    workflow.set_entry_point("collect_data")
    workflow.add_edge("collect_data", "bull_agent")
    workflow.add_edge("collect_data", "bear_agent")
    workflow.add_edge("collect_data", "risk_officer")

    # All agents run in parallel, then go to debate
    workflow.add_edge("bull_agent", "debate")
    workflow.add_edge("bear_agent", "debate")
    workflow.add_edge("risk_officer", "debate")

    workflow.add_edge("debate", "voting")
    workflow.add_edge("voting", END)

    return workflow.compile()


# Create the compiled graph
graph = create_workflow()