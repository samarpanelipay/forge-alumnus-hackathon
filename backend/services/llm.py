"""
Featherless.ai LLM wrapper service.
"""
import os
import json
from typing import Optional

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Use OpenAI SDK for Featherless.ai compatibility
from openai import OpenAI


class LLMService:
    """Wrapper for Featherless.ai API using OpenAI SDK."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("FEATHERLESS_API_KEY", "")
        self.base_url = os.getenv("FEATHERLESS_BASE_URL", "https://api.featherless.ai/v1")
        self.default_model = os.getenv("FEATHERLESS_MODEL", "Qwen/Qwen3-14B")

        # Initialize OpenAI client
        self.client = OpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
            timeout=60.0
        )

    def chat(
        self,
        model: str = None,
        system_prompt: str = "",
        user_prompt: str = "",
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """
        Send a chat request to Featherless.ai.

        Args:
            model: Model identifier (defaults to FEATHERLESS_MODEL env var)
            system_prompt: System prompt instructions
            user_prompt: User message
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens to generate

        Returns:
            Response content as string
        """
        if not self.api_key:
            # Return mock response for demo purposes when no API key
            return self._mock_response(user_prompt)

        model = model or self.default_model

        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens
            )
            # Handle Qwen3 model's response format - content may be empty but reasoning contains the response
            content = response.choices[0].message.content
            reasoning = response.choices[0].message.reasoning
            return reasoning if reasoning else content
        except Exception as e:
            print(f"LLM API error: {e}")
            import traceback
            traceback.print_exc()
            return self._mock_response(user_prompt)

    def chat_json(
        self,
        model: str = None,
        system_prompt: str = "",
        user_prompt: str = "",
        temperature: float = 0.3,
        max_tokens: int = None
    ) -> dict:
        """
        Send a chat request and parse response as JSON.
        """
        response = self.chat(
            model=model,
            system_prompt=system_prompt + "\n\nIMPORTANT: Output ONLY valid JSON, no explanations.",
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens
        )

        return self._parse_json_with_fallback(response)

    def _parse_json_with_fallback(self, response: str) -> dict:
        """Try to parse JSON, with fallback to extract from verbose response."""
        import re

        # First try direct parse
        try:
            return json.loads(response.strip())
        except json.JSONDecodeError:
            pass

        # Try to find JSON in markdown code blocks
        json_patterns = [
            r'```json\s*([\s\S]*?)\s*```',
            r'```\s*({[\s\S]*?})\s*```',
            r'\{[\s\S]*\}'
        ]

        for pattern in json_patterns:
            match = re.search(pattern, response)
            if match:
                try:
                    json_str = match.group(1) if '```' in pattern else match.group(0)
                    return json.loads(json_str)
                except:
                    pass

        # If still fails, extract key info manually from verbose response
        # This handles the Qwen model's reasoning format
        try:
            # Look for stance
            stance = "BULL"
            if "BEAR" in response.upper():
                stance = "BEAR"

            # Look for confidence - search for patterns like "0.X" or "confidence: X" or "16.37"
            conf_match = re.search(r'(?:confidence[:\s]*)?(\d+\.?\d*)', response)
            confidence = float(conf_match.group(1)) if conf_match else 0.7

            # Normalize confidence to 0-1 range
            if confidence > 1:
                confidence = confidence / 100
            # Cap at 1.0 and minimum 0.0
            confidence = max(0.0, min(1.0, confidence))

            # Look for arguments - look for specific patterns that indicate bullet points
            # Only accept short lines that look like actual arguments (numbered list or bullet points)
            arguments = []
            lines = response.split('\n')
            for line in lines:
                line = line.strip()
                # Only accept lines that start with numbers (1., 2., etc.) or bullets (-, *, •)
                # and are reasonably short (under 100 chars means it's a concise argument)
                if (line.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '- ', '* ', '• '))
                    and len(line) > 5 and len(line) < 150):
                    # Clean the line - remove the number/bullet prefix
                    arg = line.lstrip('123456789.-*•').strip()
                    if arg and len(arg) > 5:
                        arguments.append(arg)

            # If we didn't find any proper bullet points, try harder - look for short complete sentences
            if not arguments:
                for line in lines:
                    line = line.strip()
                    # Look for short lines (under 80 chars) that are complete thoughts
                    if 15 < len(line) < 80 and not line.startswith('Okay,'):
                        # Skip lines that look like thinking/reasoning
                        if any(word in line.lower() for word in ['think', 'need', 'recall', 'first i', 'let me', 'make sure']):
                            continue
                        arguments.append(line[:100])

            arguments = arguments[:5]  # Limit to 5 arguments

            # Look for debate messages in the response
            messages = []
            current_agent = None
            current_content = []
            in_message_block = False

            for line in lines:
                line = line.strip()
                # Look for patterns like "Bull:" or "Bear:" or "Risk:" at start of line
                if line.lower().startswith(('bull:', 'bear:', 'risk officer:', 'risk:')):
                    # Save previous message if any
                    if current_agent and current_content:
                        messages.append({
                            "agent": current_agent,
                            "content": " ".join(current_content[:3])  # Limit to first 3 lines
                        })
                    # Start new message
                    current_agent = line.split(':')[0].title().replace('Officer', 'Officer')
                    current_content = [line.split(':', 1)[1].strip()] if ':' in line else []
                    in_message_block = True
                elif in_message_block and line and not line.startswith('#'):
                    current_content.append(line)

            # Save last message
            if current_agent and current_content:
                messages.append({
                    "agent": current_agent,
                    "content": " ".join(current_content[:3])
                })

            return {
                "stance": stance,
                "arguments": arguments if arguments else ["Analysis based on market data"],
                "confidence": confidence,
                "messages": messages,
                "critiques": [],
                "raw": response  # Pass raw response for fallback parsing
            }
        except:
            pass

        # Ultimate fallback
        return {"error": "Failed to parse JSON", "raw": response}

    def _mock_response(self, user_prompt: str) -> str:
        """
        Generate mock response for demo when no API key is available.
        """
        # This is a fallback - in production, you'd want real responses
        if "Bull" in user_prompt or "bull" in user_prompt.lower():
            return json.dumps({
                "stance": "BULL",
                "arguments": [
                    "Strong revenue growth trajectory",
                    "Market leadership position",
                    "Innovative product pipeline",
                    "Positive analyst upgrades"
                ],
                "confidence": 0.75
            })
        elif "Bear" in user_prompt or "bear" in user_prompt.lower():
            return json.dumps({
                "stance": "BEAR",
                "arguments": [
                    "Overvaluation concerns",
                    "Increasing competition",
                    "Macro economic headwinds",
                    "Regulatory risks"
                ],
                "confidence": 0.65
            })
        elif "Risk" in user_prompt or "risk" in user_prompt.lower():
            return json.dumps({
                "risk_level": "MEDIUM",
                "constraints_triggered": ["volatility_threshold"],
                "override": False,
                "final_recommendation": "HOLD"
            })
        elif "Generate critiques" in user_prompt:
            # Extract ticker from prompt if available
            ticker = "the stock"
            for word in user_prompt.split()[-10:]:
                if len(word) >= 3 and word.isupper():
                    ticker = word
                    break

            return json.dumps({
                "critiques": [
                    {"target": "Bull", "critique": f"The Bull's revenue growth argument is valid but doesn't account for increasing competition in {ticker}'s sector. The current P/E ratio suggests potential overvaluation at these levels."},
                    {"target": "Bear", "critique": f"The Bear raises valid concerns about competition and macro headwinds, but underestimates {ticker}'s strong enterprise ecosystem, brand loyalty, and recurring revenue model that provides resilience."},
                    {"target": "Risk", "critique": f"The Risk Officer's medium risk assessment is reasonable. However, the volatility threshold constraint seems arbitrary - we recommend examining actual beta and VIX correlations before triggering risk alerts."}
                ]
            })
        else:
            return json.dumps({"result": "Analysis complete"})


# Singleton instance
llm_service = LLMService()