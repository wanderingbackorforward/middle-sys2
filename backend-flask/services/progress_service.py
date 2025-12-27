from datetime import datetime, timezone
from typing import Dict, Any, List
from config import USE_SUPABASE

def stats(dao) -> Dict[str, Any]:
    rows = dao.latest("stats_progress") if USE_SUPABASE else []
    if rows:
        r = rows[0]
        return {"totalRings": r.get("total_rings", 0), "totalGoal": r.get("total_goal", 0), "dailyRings": r.get("daily_rings", 0), "remainingDays": r.get("remaining_days", 0), "value": r.get("value", 0)}
    return {"totalRings": 0, "totalGoal": 0, "dailyRings": 0, "remainingDays": 0, "value": 0}

def gantt() -> List[Dict[str, Any]]:
    return [{"name": "区间掘进", "start": "2025-01-01", "end": "2025-02-28", "progress": 0.62}, {"name": "管片拼装", "start": "2025-01-10", "end": "2025-03-15", "progress": 0.48}, {"name": "注浆施工", "start": "2025-01-20", "end": "2025-03-25", "progress": 0.33}]

def daily_rings(dao) -> List[Dict[str, Any]]:
    rows = dao.list("daily_rings", order="ts.asc", limit=300) if USE_SUPABASE else []
    series = [{"ts": r.get("ts"), "value": r.get("value")} for r in rows]
    if not series:
        base = datetime.now(timezone.utc)
        series = [{"ts": (base.replace(microsecond=0).isoformat()), "value": 3 + (i % 4)} for i in range(60)]
    return series
