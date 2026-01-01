import os
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import cache as _cache

class SupabaseClient:
    def __init__(self, url: str, service_key: str):
        self.url = url.rstrip("/")
        self.key = service_key
        self.timeout = float(os.getenv("SUPABASE_HTTP_TIMEOUT", "2.5"))
        self.session = self._make_session()

    def _make_session(self):
        s = requests.Session()
        retries = Retry(
            total=3,
            connect=3,
            read=3,
            backoff_factor=0.3,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=frozenset(["GET"])
        )
        adapter = HTTPAdapter(max_retries=retries, pool_connections=50, pool_maxsize=50)
        s.mount("https://", adapter)
        s.mount("http://", adapter)
        return s

    def _headers(self):
        return {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json"
        }

    def _cache_key(self, table: str, select: str, order: str, limit: int):
        return "|".join([table or "", select or "", order or "", str(limit or "")])

    def get_list(self, table: str, select: str = "*", order: str = "ts.desc", limit: int = 300, ttl=None):
        if not self.url or not self.key:
            return []
        params = {"select": select, "limit": str(limit)}
        if order:
            params["order"] = order
        key = self._cache_key(table, select, order, limit)
        cached = _cache.get(key, ttl) if ttl else None
        if cached is not None:
            return cached
        try:
            r = self.session.get(
                f"{self.url}/rest/v1/{table}",
                headers=self._headers(),
                params=params,
                timeout=self.timeout
            )
            if r.status_code != 200:
                last = _cache.get_last(key)
                return last if last is not None else []
            try:
                data = r.json()
                _cache.set(key, data)
                return data
            except Exception:
                last = _cache.get_last(key)
                return last if last is not None else []
        except Exception:
            last = _cache.get_last(key)
            return last if last is not None else []

    def count(self, table: str, ttl=None):
        if not self.url or not self.key:
            return 0
        params = {"select": "id", "limit": "1"}
        key = f"count:{table}"
        cached = _cache.get(key, ttl) if ttl else None
        if cached is not None:
            return cached
        try:
            r = self.session.get(
                f"{self.url}/rest/v1/{table}",
                headers={**self._headers(), "Prefer": "count=exact"},
                params=params,
                timeout=self.timeout
            )
            try:
                value = int(r.headers.get("Content-Range", "0/0").split("/")[-1])
                _cache.set(key, value)
                return value
            except Exception:
                last = _cache.get_last(key)
                return last if last is not None else 0
        except Exception:
            last = _cache.get_last(key)
            return last if last is not None else 0
