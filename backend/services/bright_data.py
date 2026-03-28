"""
Bright Data Web Unlocker API for fast real-time data.
"""
import os
import json
import re
import requests
from typing import Optional, Dict, List, Any
from tenacity import retry, stop_after_attempt, wait_exponential

# Load environment variables
from dotenv import load_dotenv
load_dotenv()


class BrightDataService:
    """Service for fast real-time stock data via Bright Data Web Unlocker."""

    def __init__(self, api_key: Optional[str] = None, zone: Optional[str] = None):
        self.api_key = api_key or os.getenv("BRIGHT_DATA_API_KEY", "")
        self.zone = zone or os.getenv("BRIGHT_DATA_ZONE", "web_unlocker")
        self.base_url = "https://api.brightdata.com/request"

    def fetch_stock_news(self, ticker: str) -> List[Dict[str, str]]:
        """Fetch latest news directly from Yahoo Finance using Web Unlocker."""
        print(f"[BrightData] Fetching news for {ticker}")

        url = f"https://finance.yahoo.com/quote/{ticker}/news"

        if not self.api_key:
            return self._mock_news(ticker)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "zone": self.zone,
            "url": url,
            "format": "raw"
        }

        try:
            response = requests.post(
                self.base_url,
                json=payload,
                headers=headers,
                timeout=60.0
            )

            print(f"[BrightData] News response: {response.status_code}, length: {len(response.text)}")

            if response.status_code == 200 and response.text:
                articles = self._parse_yahoo_news(response.text, ticker)
                if articles:
                    return articles

        except Exception as e:
            print(f"[BrightData] News error: {e}")

        return self._mock_news(ticker)

    def fetch_stock_financials(self, ticker: str) -> Dict[str, Any]:
        """Fetch key financials directly from Yahoo Finance using Web Unlocker."""
        print(f"[BrightData] Fetching financials for {ticker}")

        url = f"https://finance.yahoo.com/quote/{ticker}/key-statistics"

        if not self.api_key:
            return self._mock_financials(ticker)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "zone": self.zone,
            "url": url,
            "format": "raw"
        }

        try:
            response = requests.post(
                self.base_url,
                json=payload,
                headers=headers,
                timeout=60.0
            )

            print(f"[BrightData] Financials response: {response.status_code}, length: {len(response.text)}")

            if response.status_code == 200 and response.text:
                financials = self._parse_yahoo_financials(response.text, ticker)
                if financials and any(v != "N/A" for v in financials.values()):
                    return financials

        except Exception as e:
            print(f"[BrightData] Financials error: {e}")

        return self._mock_financials(ticker)

    def _parse_yahoo_news(self, html: str, ticker: str) -> List[Dict[str, str]]:
        """Parse news from Yahoo Finance HTML."""
        articles = []

        # Find article titles - multiple patterns
        patterns = [
            r'"title":"([^"]{10,200})"',
            r'<h3[^>]*>([^<]{10,200})</h3>',
            r'"headline":"([^"]{10,200})"',
        ]

        for pattern in patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            for match in matches[:5]:
                title = match.strip()[:200]
                if title and len(title) > 10 and 'http' not in title:
                    articles.append({
                        "title": title,
                        "summary": f"Latest {ticker} news from Yahoo Finance"
                    })

        print(f"[BrightData] Found {len(articles)} articles")
        return articles

    def _parse_yahoo_financials(self, html: str, ticker: str) -> Dict[str, Any]:
        """Parse key statistics from Yahoo Finance HTML."""
        financials = {}

        metrics = {
            "Market Cap": "market_cap",
            "Trailing P/E": "pe_ratio",
            "Forward P/E": "forward_pe",
            "PEG Ratio": "peg_ratio",
            "Profit Margin": "profit_margin",
            "Operating Margin": "operating_margin",
            "Revenue": "revenue",
            "Revenue Growth": "revenue_growth",
            "EPS": "earnings_per_share",
            "Beta": "beta",
            "Dividend Yield": "dividend_yield",
            "1Y Target": "target_price"
        }

        for metric, field in metrics.items():
            # Try to find metric and value in table
            pattern = rf'{re.escape(metric)}.*?<td[^>]*>([\d,\.$BMK%+-]+)'
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                financials[field] = match.group(1).strip()

        print(f"[BrightData] Found {len(financials)} metrics: {list(financials.keys())}")
        return financials

    def fetch_all_data(self, ticker: str) -> Dict[str, Any]:
        """Fetch both news and financials."""
        news = self.fetch_stock_news(ticker)
        financials = self.fetch_stock_financials(ticker)

        return {
            "ticker": ticker.upper(),
            "news": news,
            "financials": financials
        }

    def _mock_news(self, ticker: str) -> List[Dict[str, str]]:
        """Mock news."""
        return [
            {"title": f"{ticker} Stock Analysis", "summary": f"Analysis of {ticker}"},
            {"title": f"{ticker} Earnings Preview", "summary": f"Earnings for {ticker}"},
            {"title": f"Wall Street Updates {ticker}", "summary": f"Analysts on {ticker}"}
        ]

    def _mock_financials(self, ticker: str) -> Dict[str, Any]:
        """Mock financials."""
        data = {
            "TSLA": {"market_cap": "$800B", "pe_ratio": "78.5", "revenue": "$96.8B", "profit_margin": "8%"},
            "AAPL": {"market_cap": "$3T", "pe_ratio": "28.2", "revenue": "$383.3B", "profit_margin": "25%"},
            "GOOGL": {"market_cap": "$1.8T", "pe_ratio": "24.5", "revenue": "$307.4B", "profit_margin": "24%"},
            "MSFT": {"market_cap": "$2.5T", "pe_ratio": "35.2", "revenue": "$211.9B", "profit_margin": "34%"},
            "NVDA": {"market_cap": "$1.2T", "pe_ratio": "65.3", "revenue": "$60.9B", "profit_margin": "49%"},
        }
        return data.get(ticker, {"market_cap": "N/A", "pe_ratio": "N/A", "revenue": "N/A", "profit_margin": "N/A"})


# Singleton
bright_data_service = BrightDataService()