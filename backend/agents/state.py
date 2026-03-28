"""
LangGraph state schema for the Stock Verdict Arena.
Using pydantic for proper LangGraph compatibility.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class StockData(BaseModel):
    """Collected stock data from Bright Data."""
    ticker: str
    news: List[Dict[str, str]] = Field(default_factory=list)
    financials: Dict[str, Any] = Field(default_factory=dict)


class BullOutput(BaseModel):
    """Bull agent analysis output."""
    stance: str = "BULL"
    arguments: List[str] = Field(default_factory=list)
    confidence: float = 0.5
    reasoning: str = ""  # Detailed step-by-step reasoning


class BearOutput(BaseModel):
    """Bear agent analysis output."""
    stance: str = "BEAR"
    arguments: List[str] = Field(default_factory=list)
    confidence: float = 0.5
    reasoning: str = ""  # Detailed step-by-step reasoning


class RiskOutput(BaseModel):
    """Risk officer analysis output."""
    risk_level: str = "MEDIUM"
    constraints_triggered: List[str] = Field(default_factory=list)
    override: bool = False
    final_recommendation: str = "HOLD"
    reasoning: str = ""  # Detailed step-by-step reasoning


class Critique(BaseModel):
    """Critique in the debate loop."""
    target: str
    critique: str
    agent: str = ""  # Which agent made the critique
    round: int = 0  # Which debate round


class DebateRound(BaseModel):
    """Single round of debate."""
    critiques: List[Critique] = Field(default_factory=list)
    messages: List[Dict[str, str]] = Field(default_factory=list)  # Back-and-forth messages


class ArenaState(BaseModel):
    """
    Main state that flows through the LangGraph workflow.
    """
    ticker: str = ""
    stock_data: Optional[StockData] = None
    bull_analysis: Optional[BullOutput] = None
    bear_analysis: Optional[BearOutput] = None
    risk_analysis: Optional[RiskOutput] = None
    debate_rounds: Optional[List[DebateRound]] = None
    final_verdict: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

    class Config:
        extra = "allow"