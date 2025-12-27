from typing import List, Dict, Any
from supabase_client import SupabaseClient

class SupabaseDao:
    def __init__(self, client: SupabaseClient):
        self.client = client

    def latest(self, table: str) -> List[Dict[str, Any]]:
        return self.client.get_list(table, limit=1)

    def list(self, table: str, order: str = "ts.desc", limit: int = 300) -> List[Dict[str, Any]]:
        return self.client.get_list(table, order=order, limit=limit)
