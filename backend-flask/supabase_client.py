import os
import requests

class SupabaseClient:
    def __init__(self, url: str, service_key: str):
        self.url = url.rstrip("/")
        self.key = service_key

    def _headers(self):
        return {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json"
        }

    def get_list(self, table: str, select: str = "*", order: str = "ts.desc", limit: int = 300):
        if not self.url or not self.key:
            return []
        params = {"select": select, "limit": str(limit)}
        if order:
            params["order"] = order
        try:
            r = requests.get(f"{self.url}/rest/v1/{table}", headers=self._headers(), params=params, timeout=0.6)
            if r.status_code != 200:
                return []
            try:
                return r.json()
            except Exception:
                return []
        except Exception:
            return []

    def count(self, table: str):
        if not self.url or not self.key:
            return 0
        params = {"select": "id", "limit": "1"}
        try:
            r = requests.get(f"{self.url}/rest/v1/{table}", headers={**self._headers(), "Prefer": "count=exact"}, params=params, timeout=0.6)
            try:
                return int(r.headers.get("Content-Range", "0/0").split("/")[-1])
            except Exception:
                return 0
        except Exception:
            return 0
