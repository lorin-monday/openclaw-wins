"""
openclaw-wins — Python SDK for reporting bot wins.

Quickstart:
    from openclaw_wins import WinsClient
    client = WinsClient(api_key="your-key")
    client.report("Opened the gate successfully", tags=["gate", "automation"])

One-liner:
    from openclaw_wins import report
    report("my win", api_key="your-key")
"""

import os
import json
import urllib.request
import urllib.error
from typing import Optional, List

DEFAULT_BASE_URL = "https://openclaw-wins.vercel.app"


class WinsClient:
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = DEFAULT_BASE_URL,
    ):
        self.api_key = api_key or os.environ.get("OPENCLAW_WINS_API_KEY", "")
        self.base_url = base_url.rstrip("/")

    def report(
        self,
        title: str,
        tags: Optional[List[str]] = None,
        status: str = "reported",
        confidence: str = "medium",
        source: Optional[str] = None,
        provider: Optional[str] = None,
        **kwargs,
    ) -> dict:
        """
        Report a win. Returns the API response dict.
        Raises RuntimeError on failure.
        """
        payload = {
            "title": title,
            "tags": tags or [],
            "status": status,
            "confidence": confidence,
        }
        if source:
            payload["source"] = source
        if provider:
            payload["provider"] = provider
        payload.update(kwargs)

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            f"{self.base_url}/api/wins",
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                if not result.get("ok"):
                    raise RuntimeError(f"API error: {result.get('error')}")
                return result
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"HTTP {e.code}: {body}") from e

    def list_wins(self, query: str = "", status: str = "", tag: str = "") -> list:
        """List wins with optional filters."""
        params = []
        if query:
            params.append(f"query={urllib.parse.quote(query)}")
        if status:
            params.append(f"status={urllib.parse.quote(status)}")
        if tag:
            params.append(f"tag={urllib.parse.quote(tag)}")
        qs = "?" + "&".join(params) if params else ""
        req = urllib.request.Request(
            f"{self.base_url}/api/wins{qs}",
            headers={"Accept": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result.get("wins", [])


# Module-level one-liner
def report(
    title: str,
    api_key: Optional[str] = None,
    base_url: str = DEFAULT_BASE_URL,
    **kwargs,
) -> dict:
    """One-liner report. Uses OPENCLAW_WINS_API_KEY env if api_key not passed."""
    return WinsClient(api_key=api_key, base_url=base_url).report(title, **kwargs)


# Fix missing import
import urllib.parse  # noqa: E402
