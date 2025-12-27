from datetime import datetime, timezone
from typing import Dict, Any, List
from config import USE_SUPABASE

def fmt_time_str(iso: str) -> str:
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone()
        return dt.strftime("%H:%M:%S")
    except Exception:
        return iso

def fmt_ts(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [{"ts": r.get("ts"), "value": r.get("value")} for r in rows]

def summary(dao) -> Dict[str, Any]:
    base = {"projectName": "隧道监测项目", "lat": 31.2304, "lng": 121.4737}
    rows = dao.latest("summary") if USE_SUPABASE else []
    if rows:
        r = rows[0]
        base["cameraOnline"] = r.get("camera_online", 0)
        base["cameraTotal"] = r.get("camera_total", 0)
        base["ringToday"] = r.get("ring_today", 0)
        base["ringCumulative"] = r.get("ring_cumulative", 0)
        base["muckToday"] = r.get("muck_today", 0)
        base["slurryPressureAvg"] = r.get("slurry_pressure_avg", 0)
        base["gasAlerts"] = r.get("gas_alerts", 0)
    else:
        base.update({"cameraOnline": 12, "cameraTotal": 16, "ringToday": 4, "ringCumulative": 128, "muckToday": 300, "slurryPressureAvg": 1.8, "gasAlerts": 0})
    return base

def notifications(dao) -> List[Dict[str, Any]]:
    rows = dao.list("notifications", order="ts.desc", limit=30) if USE_SUPABASE else []
    result = [{"time": fmt_time_str(r.get("ts", "")), "type": r.get("type", ""), "content": r.get("content", "")} for r in rows]
    if not result:
        now = datetime.now().strftime("%H:%M:%S")
        result = [{"time": now, "type": "通知", "content": "系统已启动"}, {"time": now, "type": "告警", "content": "气体浓度短时升高"}, {"time": now, "type": "通知", "content": "管片运输完成一批"}]
    return result

def supplies(dao) -> Dict[str, Any]:
    rows = dao.list("supplies", order="category.asc", limit=100) if USE_SUPABASE else []
    result = {}
    for r in rows:
        k = r.get("category")
        v = r.get("quantity", 0)
        if k is not None:
            result[str(k)] = v
    if not result:
        result = {"水泥": 120, "砂石": 200, "钢筋": 80, "燃料": 60}
    return result

def dispatch(dao) -> List[Dict[str, Any]]:
    rows = dao.list("dispatch", order="ts.desc", limit=50) if USE_SUPABASE else []
    result = [{"time": fmt_time_str(r.get("ts", "")), "type": r.get("type", ""), "unit": r.get("unit", ""), "status": r.get("status", "")} for r in rows]
    if not result:
        now = datetime.now().strftime("%H:%M:%S")
        result = [{"time": now, "type": "人员", "unit": "注浆班", "status": "到岗"}, {"time": now, "type": "车辆", "unit": "物资运输", "status": "出发"}]
    return result

def timeseries(dao) -> Dict[str, Any]:
    if USE_SUPABASE:
        advance = fmt_ts(dao.list("advance_speed", order="ts.asc", limit=300))
        slurry = fmt_ts(dao.list("slurry_pressure", order="ts.asc", limit=300))
        gas = fmt_ts(dao.list("gas_concentration", order="ts.asc", limit=300))
    else:
        advance, slurry, gas = [], [], []
    if not advance:
        base = datetime.now(timezone.utc)
        advance = [{"ts": (base.replace(microsecond=0).isoformat()), "value": 1.2 + i * 0.01} for i in range(60)]
    if not slurry:
        base = datetime.now(timezone.utc)
        slurry = [{"ts": (base.replace(microsecond=0).isoformat()), "value": 1.8 + (i % 5) * 0.02} for i in range(60)]
    if not gas:
        base = datetime.now(timezone.utc)
        gas = [{"ts": (base.replace(microsecond=0).isoformat()), "value": 0.1 + (i % 3) * 0.01} for i in range(60)]
    return {"advanceSpeed": advance, "slurryPressure": slurry, "gasConcentration": gas}
