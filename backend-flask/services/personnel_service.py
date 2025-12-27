from datetime import datetime, timezone
from typing import Dict, Any, List
from config import USE_SUPABASE

def stats(dao) -> Dict[str, Any]:
    rows = dao.latest("stats") if USE_SUPABASE else []
    if rows:
        r = rows[0]
        return {"totalOnSite": r.get("total_on_site", 0), "attendanceRate": r.get("attendance_rate", "0%"), "violations": r.get("violations", 0), "managers": r.get("managers", 0)}
    return {"totalOnSite": 0, "attendanceRate": "0%", "violations": 0, "managers": 0}

def distribution() -> List[Dict[str, Any]]:
    return [{"name": "掘进班", "value": 40}, {"name": "管片拼装班", "value": 30}, {"name": "注浆班", "value": 20}, {"name": "其他", "value": 10}]

def list_people() -> List[Dict[str, Any]]:
    return [{"id": "P001", "name": "张三", "team": "掘进班", "location": "盾构机", "time": "08:15", "temp": "36.5", "status": "正常"}, {"id": "P002", "name": "李四", "team": "注浆班", "location": "注浆站", "time": "08:20", "temp": "36.6", "status": "正常"}]

def attendance_trend(dao) -> List[Dict[str, Any]]:
    rows = dao.list("attendance_trend", order="ts.asc", limit=300) if USE_SUPABASE else []
    series = [{"ts": r.get("ts"), "value": r.get("value")} for r in rows]
    if not series:
        base = datetime.now(timezone.utc)
        series = [{"ts": (base.replace(microsecond=0).isoformat()), "value": 80 + (i % 10)} for i in range(60)]
    return series
