# 🏟️ Stock Verdict Arena

> Multi-agent AI system where 3 analysts debate and deliver a live BUY / HOLD / SELL verdict on any stock.

Built for the Finance Hackathon — Problem Statement 1: _AI & AI Agents Autonomous System That Takes Action_

---

## What It Does

Enter a stock ticker. Three AI agents independently research it using live web data, then debate each other in real-time before the Risk Officer delivers a final verdict.

| Agent           | Role                                    | Bias |
| --------------- | --------------------------------------- | ---- |
| 🟢 Bull Agent   | Finds upside signals, growth catalysts  | BUY  |
| 🔴 Bear Agent   | Finds risks, red flags, macro headwinds | SELL |
| 🟡 Risk Officer | Weighs both sides, enforces risk limits | HOLD |

---

## Tech Stack

- **Backend** — Python, FastAPI, SSE streaming
- **LLM** — [Featherless.ai](https://featherless.ai) (Llama-3.3-70B)
- **Live Data** — [Bright Data](https://brightdata.com) Web Unlocker (Yahoo Finance scraping)
- **Frontend** — Vanilla JS, dark terminal UI

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/your-username/stock-verdict-arena
cd stock-verdict-arena
pip install -r requirements.txt

# 2. Set up environment
cp .env.example .env
# Fill in your API keys in .env

# 3. Run
uvicorn main:app --reload
# Open http://localhost:8000
```

---

## Environment Variables

```env
FEATHERLESS_API_KEY=your_key_here        # featherless.ai/register
BRIGHT_DATA_USER=brd-customer-xxx-zone-residential
BRIGHT_DATA_PASS=your_password_here
```

Get keys:

- Featherless.ai → [featherless.ai/register](https://featherless.ai/register)
- Bright Data → [brightdata.com](https://brightdata.com) → Create a **Web Unlocker** zone

---

## Demo Mode

No API keys? Run with the demo flag to replay a cached TSLA analysis:

```
http://localhost:8000?demo=true
```

---

## Project Structure

## placeholders for later

## Hackathon

**Event:** Forge alumnus hackathon
**Problem:** AI & AI Agents — Autonomous System That Takes Action
**Team:** binary-exploitors
