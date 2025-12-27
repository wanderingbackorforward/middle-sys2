from datetime import datetime, timezone
from typing import Dict, Any, List
from config import USE_SUPABASE

def risks(dao) -> List[Dict[str, Any]]:
    rows = dao.list("risks", order="ts.desc", limit=100) if USE_SUPABASE else []
    result = []
    for r in rows:
        result.append({"level": r.get("level", ""), "name": r.get("name", ""), "status": r.get("status", ""), "desc": r.get("description", ""), "code": r.get("code", ""), "ts": r.get("ts", "")})
    if not result:
        now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
        result = [{"level": "高", "name": "气体浓度偏高", "status": "未处理", "desc": "请加强通风", "code": "GAS-01", "ts": now}, {"level": "中", "name": "浆液压力波动", "status": "处理中", "desc": "监控并调参", "code": "SLURRY-02", "ts": now}, {"level": "低", "name": "设备维护提醒", "status": "已处理", "desc": "完成例检", "code": "MAINT-03", "ts": now}]
    return result

def settlement(dao) -> Dict[str, Any]:
    if USE_SUPABASE:
        actual = [{"ts": r.get("ts"), "value": r.get("value")} for r in dao.list("settlement_actual", order="ts.asc", limit=300)]
        predict = [{"ts": r.get("ts"), "value": r.get("value")} for r in dao.list("settlement_predict", order="ts.asc", limit=300)]
    else:
        actual, predict = [], []
    if not actual:
        base = datetime.now(timezone.utc)
        actual = [{"ts": (base.replace(microsecond=0).isoformat()), "value": (i % 7) * 0.5} for i in range(40)]
    if not predict:
        base = datetime.now(timezone.utc)
        predict = [{"ts": (base.replace(microsecond=0).isoformat()), "value": (i % 7) * 0.6} for i in range(40)]
    return {"actual": actual, "predict": predict}

def score() -> Dict[str, Any]:
    return {"score": 96}

def alarm_trend(dao) -> List[Dict[str, Any]]:
    rows = dao.list("alarm_trend", order="ts.asc", limit=300) if USE_SUPABASE else []
    series = [{"ts": r.get("ts"), "value": r.get("value")} for r in rows]
    if not series:
        base = datetime.now(timezone.utc)
        series = [{"ts": (base.replace(microsecond=0).isoformat()), "value": (i % 5)} for i in range(60)]
    return series
