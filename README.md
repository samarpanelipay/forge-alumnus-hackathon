# Stock Verdict Arena

A production-ready multi-agent stock analysis system using LangGraph in Python, with a React frontend.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  React UI   │────▶│  FastAPI     │────▶│  LangGraph  │
│             │◀────│  Backend     │◀────│  Agents     │
└─────────────┘     └──────────────┘     └─────────────┘
                                                  │
                                            ┌─────┴─────┐
                                            │ Bright    │
                                            │ Data API  │
                                            └───────────┘
                                            │
                                            ┌───────────┐
                                            │Featherless│
                                            │.ai LLM    │
                                            └───────────┘
```

## Project Structure

```
hackforge/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── agents/
│   │   ├── state.py         # LangGraph state schema
│   │   ├── nodes.py         # All LangGraph nodes
│   │   ├── bull_agent.py    # Bull agent prompt & logic
│   │   ├── bear_agent.py    # Bear agent prompt & logic
│   │   ├── risk_officer.py  # Risk officer prompt & logic
│   │   └── debate.py        # Debate loop logic
│   ├── services/
│   │   ├── llm.py           # Featherless.ai LLM wrapper
│   │   └── bright_data.py  # Bright Data API integration
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── api.ts
    │   └── components/
    └── package.json
```

## Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your API keys

# Run the server
python main.py
```

The API will be available at `http://localhost:8000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at `http://localhost:5173`

## API Usage

### Analyze Stock

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"ticker": "TSLA"}'
```

### Response Format

```json
{
  "success": true,
  "data": {
    "ticker": "TSLA",
    "verdict": "BUY",
    "confidence": 0.75,
    "bull_case": "Strong revenue growth, market leadership...",
    "bear_case": "Overvaluation concerns, increasing competition...",
    "risk_summary": "MEDIUM risk - volatility_threshold",
    "dissent": "Bear argues: Overvaluation, competition...",
    "source": "majority_vote"
  },
  "bull_analysis": {...},
  "bear_analysis": {...},
  "risk_analysis": {...}
}
```

## Agent System

1. **Bull Agent** - Focuses on upside, growth, and opportunity
2. **Bear Agent** - Focuses on risks, overvaluation, and threats
3. **Risk Officer** - Assesses volatility and can override with final recommendation

The system runs a debate loop where agents critique each other, then uses voting to determine the final verdict.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `FEATHERLESS_API_KEY` | Your Featherless.ai API key for LLM inference |
| `BRIGHT_DATA_API_KEY` | Your Bright Data API key for web scraping |
| `PORT` | FastAPI server port (default: 8000) |

## Demo Mode

The system works in demo mode without API keys - it will return mock data. To get real analysis, configure the API keys in `.env`.