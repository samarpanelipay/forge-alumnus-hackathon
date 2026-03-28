"""
FastAPI backend for Stock Verdict Arena.
"""
import os
import logging
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Stock Verdict Arena API",
    description="Multi-agent stock analysis system using LangGraph",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class StockRequest(BaseModel):
    ticker: str


class StockVerdict(BaseModel):
    ticker: str
    verdict: str
    confidence: float
    bull_case: str
    bull_reasoning: str = ""
    bear_case: str
    bear_reasoning: str = ""
    risk_summary: str
    risk_reasoning: str = ""
    dissent: str
    source: str
    debate_summary: list = []
    debate_messages: list = []


class AnalysisResponse(BaseModel):
    success: bool
    data: Optional[StockVerdict] = None
    error: Optional[str] = None
    bull_analysis: Optional[dict] = None
    bear_analysis: Optional[dict] = None
    risk_analysis: Optional[dict] = None


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Stock Verdict Arena API",
        "version": "1.0.0",
        "description": "Multi-agent stock analysis with Bull, Bear, and Risk Officer agents"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


class BatchStockRequest(BaseModel):
    tickers: list[str]


class BatchAnalysisResponse(BaseModel):
    success: bool
    results: list[AnalysisResponse]
    errors: list[str] = []


@app.post("/analyze/batch", response_model=BatchAnalysisResponse)
async def analyze_batch(request: BatchStockRequest):
    """
    Analyze multiple stock tickers in parallel using the multi-agent LangGraph workflow.
    """
    tickers = [t.upper().strip() for t in request.tickers if t.strip()]

    if not tickers:
        raise HTTPException(status_code=400, detail="At least one ticker is required")

    logger.info(f"Starting batch analysis for {len(tickers)} tickers: {tickers}")

    try:
        import sys
        import os
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

        from agents.nodes import graph
        from agents.state import ArenaState

        results = []
        errors = []

        # Run all analyses in parallel using asyncio
        import asyncio

        async def analyze_single(ticker: str):
            try:
                initial_state = ArenaState(ticker=ticker)
                result = graph.invoke(initial_state)

                error = result.error if hasattr(result, 'error') else result.get('error')
                if error:
                    return AnalysisResponse(success=False, error=error)

                if hasattr(result, 'model_dump'):
                    final_verdict = result.final_verdict
                    bull_analysis = result.bull_analysis
                    bear_analysis = result.bear_analysis
                    risk_analysis = result.risk_analysis
                else:
                    final_verdict = result.get('final_verdict', {})
                    bull_analysis = result.get('bull_analysis')
                    bear_analysis = result.get('bear_analysis')
                    risk_analysis = result.get('risk_analysis')

                if not final_verdict:
                    return AnalysisResponse(success=False, error="No verdict generated")

                return AnalysisResponse(
                    success=True,
                    data=StockVerdict(**final_verdict),
                    bull_analysis=bull_analysis.model_dump() if hasattr(bull_analysis, 'model_dump') else bull_analysis,
                    bear_analysis=bear_analysis.model_dump() if hasattr(bear_analysis, 'model_dump') else bear_analysis,
                    risk_analysis=risk_analysis.model_dump() if hasattr(risk_analysis, 'model_dump') else risk_analysis
                )
            except Exception as e:
                logger.error(f"Error analyzing {ticker}: {str(e)}")
                return AnalysisResponse(success=False, error=f"Analysis failed for {ticker}: {str(e)}")

        # Run all analyses concurrently
        results = await asyncio.gather(*[analyze_single(t) for t in tickers])

        logger.info(f"Batch analysis complete: {sum(1 for r in results if r.success)}/{len(tickers)} successful")

        return BatchAnalysisResponse(
            success=True,
            results=results,
            errors=[r.error for r in results if not r.success and r.error]
        )

    except Exception as e:
        logger.error(f"Unexpected batch error: {str(e)}")
        import traceback
        traceback.print_exc()
        return BatchAnalysisResponse(success=False, results=[], errors=[str(e)])


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_stock(request: StockRequest):
    """
    Analyze a stock ticker using the multi-agent LangGraph workflow.
    """
    ticker = request.ticker.upper().strip()

    if not ticker:
        raise HTTPException(status_code=400, detail="Ticker is required")

    logger.info(f"Starting LangGraph analysis for ticker: {ticker}")

    try:
        # Import here to ensure path is set correctly
        import sys
        import os
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

        from agents.nodes import graph
        from agents.state import ArenaState

        # Initialize state
        initial_state = ArenaState(ticker=ticker)

        # Run the LangGraph workflow
        result = graph.invoke(initial_state)

        logger.info(f"LangGraph result type: {type(result)}")
        logger.info(f"LangGraph result keys: {result.model_dump() if hasattr(result, 'model_dump') else result.keys() if hasattr(result, 'keys') else 'N/A'}")

        # Check for errors
        error = result.error if hasattr(result, 'error') else result.get('error')
        if error:
            logger.error(f"Analysis error: {error}")
            return AnalysisResponse(success=False, error=error)

        # Extract results - handle both pydantic model and dict
        if hasattr(result, 'model_dump'):
            final_verdict = result.final_verdict
            bull_analysis = result.bull_analysis
            bear_analysis = result.bear_analysis
            risk_analysis = result.risk_analysis
        else:
            final_verdict = result.get('final_verdict', {})
            bull_analysis = result.get('bull_analysis')
            bear_analysis = result.get('bear_analysis')
            risk_analysis = result.get('risk_analysis')

        if not final_verdict:
            return AnalysisResponse(success=False, error="No verdict generated")

        logger.info(f"Analysis complete for {ticker}: {final_verdict.get('verdict')}")

        return AnalysisResponse(
            success=True,
            data=StockVerdict(**final_verdict),
            bull_analysis=bull_analysis.model_dump() if hasattr(bull_analysis, 'model_dump') else bull_analysis,
            bear_analysis=bear_analysis.model_dump() if hasattr(bear_analysis, 'model_dump') else bear_analysis,
            risk_analysis=risk_analysis.model_dump() if hasattr(risk_analysis, 'model_dump') else risk_analysis
        )

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        return AnalysisResponse(success=False, error=f"Analysis failed: {str(e)}")


# For local development
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)