import os
import json
import urllib.request
import urllib.error
from openai import OpenAI
from datetime import datetime, timezone
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from supabase_client import SupabaseClient
from sse import SseHub

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
supa = SupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
sse_hub = SseHub()
USE_SUPABASE = bool(SUPABASE_URL and SUPABASE_SERVICE_KEY and os.getenv("USE_SUPABASE", "0") == "1")
if os.getenv("DISABLE_SCHEDULER", "0") != "1":
    from scheduler import start_scheduler
    start_scheduler(supa, sse_hub)
video_store = []

def fmt_time_str(iso):
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone()
        return dt.strftime("%H:%M:%S")
    except Exception:
        return iso

def fmt_ts_value(rows):
    return [{"ts": r.get("ts"), "value": r.get("value")} for r in rows]

@app.get("/api/dashboard/summary")
def dashboard_summary():
    latest = supa.get_list("summary", limit=1)
    base = {
        "projectName": "隧道监测项目",
        "lat": 31.2304,
        "lng": 121.4737
    }
    if latest:
        row = latest[0]
        base["cameraOnline"] = row.get("camera_online", 0)
        base["cameraTotal"] = row.get("camera_total", 0)
        base["ringToday"] = row.get("ring_today", 0)
        base["ringCumulative"] = row.get("ring_cumulative", 0)
        base["muckToday"] = row.get("muck_today", 0)
        base["slurryPressureAvg"] = row.get("slurry_pressure_avg", 0)
        base["gasAlerts"] = row.get("gas_alerts", 0)
    else:
        base.update({
            "cameraOnline": 12, "cameraTotal": 16, "ringToday": 4,
            "ringCumulative": 128, "muckToday": 300, "slurryPressureAvg": 1.8,
            "gasAlerts": 0
        })
    return jsonify(base)

@app.get("/api/dashboard/notifications")
def dashboard_notifications():
    rows = supa.get_list("notifications", order="ts.desc", limit=30) if USE_SUPABASE else []
    result = [{"time": fmt_time_str(r.get("ts", "")), "type": r.get("type", ""), "content": r.get("content", "")} for r in rows]
    if not result:
        now = datetime.now().strftime("%H:%M:%S")
        result = [
            {"time": now, "type": "通知", "content": "系统已启动"},
            {"time": now, "type": "告警", "content": "气体浓度短时升高"},
            {"time": now, "type": "通知", "content": "管片运输完成一批"}
        ]
    return jsonify(result)

@app.get("/api/dashboard/supplies")
def dashboard_supplies():
    rows = supa.get_list("supplies", order="category.asc", limit=100) if USE_SUPABASE else []
    result = {}
    for r in rows:
        k = r.get("category")
        v = r.get("quantity", 0)
        if k is not None:
            result[str(k)] = v
    if not result:
        result = {"水泥": 120, "砂石": 200, "钢筋": 80, "燃料": 60}
    return jsonify(result)

@app.get("/api/dashboard/dispatch")
def dashboard_dispatch():
    rows = supa.get_list("dispatch", order="ts.desc", limit=50) if USE_SUPABASE else []
    result = [{"time": fmt_time_str(r.get("ts", "")), "type": r.get("type", ""), "unit": r.get("unit", ""), "status": r.get("status", "")} for r in rows]
    if not result:
        now = datetime.now().strftime("%H:%M:%S")
        result = [
            {"time": now, "type": "人员", "unit": "注浆班", "status": "到岗"},
            {"time": now, "type": "车辆", "unit": "物资运输", "status": "出发"}
        ]
    return jsonify(result)

@app.get("/api/dashboard/timeseries")
def dashboard_timeseries():
    if USE_SUPABASE:
        advance = fmt_ts_value(supa.get_list("advance_speed", order="ts.asc", limit=300))
        slurry = fmt_ts_value(supa.get_list("slurry_pressure", order="ts.asc", limit=300))
        gas = fmt_ts_value(supa.get_list("gas_concentration", order="ts.asc", limit=300))
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
    return jsonify({"advanceSpeed": advance, "slurryPressure": slurry, "gasConcentration": gas})

@app.get("/api/personnel/stats")
def personnel_stats():
    latest = supa.get_list("stats", limit=1)
    if latest:
        r = latest[0]
        return jsonify({
            "totalOnSite": r.get("total_on_site", 0),
            "attendanceRate": r.get("attendance_rate", "0%"),
            "violations": r.get("violations", 0),
            "managers": r.get("managers", 0)
        })
    return jsonify({"totalOnSite": 0, "attendanceRate": "0%", "violations": 0, "managers": 0})

@app.get("/api/personnel/distribution")
def personnel_distribution():
    return jsonify([
        {"name": "掘进班", "value": 40},
        {"name": "管片拼装班", "value": 30},
        {"name": "注浆班", "value": 20},
        {"name": "其他", "value": 10}
    ])

@app.get("/api/personnel/list")
def personnel_list():
    return jsonify([
        {"id": "P001", "name": "张三", "team": "掘进班", "location": "盾构机", "time": "08:15", "temp": "36.5", "status": "正常"},
        {"id": "P002", "name": "李四", "team": "注浆班", "location": "注浆站", "time": "08:20", "temp": "36.6", "status": "正常"}
    ])

@app.get("/api/personnel/attendanceTrend")
def personnel_attendance_trend():
    rows = supa.get_list("attendance_trend", order="ts.asc", limit=300) if USE_SUPABASE else []
    series = fmt_ts_value(rows)
    if not series:
        base = datetime.now(timezone.utc)
        series = [{"ts": (base.replace(microsecond=0).isoformat()), "value": 80 + (i % 10)} for i in range(60)]
    return jsonify(series)

@app.get("/api/progress/stats")
def progress_stats():
    latest = supa.get_list("stats_progress", limit=1)
    if latest:
        r = latest[0]
        return jsonify({
            "totalRings": r.get("total_rings", 0),
            "totalGoal": r.get("total_goal", 0),
            "dailyRings": r.get("daily_rings", 0),
            "remainingDays": r.get("remaining_days", 0),
            "value": r.get("value", 0)
        })
    return jsonify({"totalRings": 0, "totalGoal": 0, "dailyRings": 0, "remainingDays": 0, "value": 0})

@app.get("/api/progress/gantt")
def progress_gantt():
    return jsonify([
        {"name": "区间掘进", "start": "2025-01-01", "end": "2025-02-28", "progress": 0.62},
        {"name": "管片拼装", "start": "2025-01-10", "end": "2025-03-15", "progress": 0.48},
        {"name": "注浆施工", "start": "2025-01-20", "end": "2025-03-25", "progress": 0.33}
    ])

@app.get("/api/progress/dailyRings")
def progress_daily_rings():
    rows = supa.get_list("daily_rings", order="ts.asc", limit=300) if USE_SUPABASE else []
    series = fmt_ts_value(rows)
    if not series:
        base = datetime.now(timezone.utc)
        series = [{"ts": (base.replace(microsecond=0).isoformat()), "value": 3 + (i % 4)} for i in range(60)]
    return jsonify(series)

@app.get("/api/safety/risks")
def safety_risks():
    rows = supa.get_list("risks", order="ts.desc", limit=100) if USE_SUPABASE else []
    result = []
    for r in rows:
        result.append({
            "level": r.get("level", ""),
            "name": r.get("name", ""),
            "status": r.get("status", ""),
            "desc": r.get("description", ""),
            "code": r.get("code", ""),
            "ts": r.get("ts", "")
        })
    if not result:
        now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
        result = [
            {"level": "高", "name": "气体浓度偏高", "status": "未处理", "desc": "请加强通风", "code": "GAS-01", "ts": now},
            {"level": "中", "name": "浆液压力波动", "status": "处理中", "desc": "监控并调参", "code": "SLURRY-02", "ts": now},
            {"level": "低", "name": "设备维护提醒", "status": "已处理", "desc": "完成例检", "code": "MAINT-03", "ts": now}
        ]
    return jsonify(result)

@app.get("/api/safety/settlement")
def safety_settlement():
    if USE_SUPABASE:
        actual = fmt_ts_value(supa.get_list("settlement_actual", order="ts.asc", limit=300))
        predict = fmt_ts_value(supa.get_list("settlement_predict", order="ts.asc", limit=300))
    else:
        actual, predict = [], []
    if not actual:
        base = datetime.now(timezone.utc)
        actual = [{"ts": (base.replace(microsecond=0).isoformat()), "value": (i % 7) * 0.5} for i in range(40)]
    if not predict:
        base = datetime.now(timezone.utc)
        predict = [{"ts": (base.replace(microsecond=0).isoformat()), "value": (i % 7) * 0.6} for i in range(40)]
    return jsonify({"actual": actual, "predict": predict})

@app.get("/api/safety/score")
def safety_score():
    return jsonify({"score": 96})

@app.get("/api/safety/alarmTrend")
def safety_alarm_trend():
    rows = supa.get_list("alarm_trend", order="ts.asc", limit=300) if USE_SUPABASE else []
    series = fmt_ts_value(rows)
    if not series:
        base = datetime.now(timezone.utc)
        series = [{"ts": (base.replace(microsecond=0).isoformat()), "value": (i % 5)} for i in range(60)]
    return jsonify(series)

@app.get("/api/safety/verify")
def safety_verify():
    a_count = supa.count("settlement_actual")
    r_count = supa.count("risks")
    sample_actual = supa.get_list("settlement_actual", limit=1)
    sample_risk = supa.get_list("risks", limit=1)
    return jsonify({
        "settlement_actual_count": a_count,
        "risks_count": r_count,
        "sample_actual": sample_actual[0] if sample_actual else None,
        "sample_risk": sample_risk[0] if sample_risk else None
    })

@app.get("/api/video/list")
def video_list():
    demo = os.getenv("DEMO_STREAM", "1") == "1"
    data = [
        {"id": "cam-01", "name": "盾构机前方", "status": "在线"},
        {"id": "cam-02", "name": "管片拼装区", "status": "在线"},
        {"id": "cam-03", "name": "注浆站", "status": "在线"}
    ]
    if demo:
        streams = [
            "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            "https://test-streams.mux.dev/pts/stream.m3u8",
            "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
        ]
        for i, s in enumerate(data):
            s["streamUrl"] = streams[i % len(streams)]
    return jsonify(data + video_store)

@app.post("/api/video/add")
def video_add():
    body = request.get_json(silent=True) or {}
    name = body.get("name") or f"摄像头{len(video_store)+1}"
    url = body.get("streamUrl") or ""
    status = body.get("status") or "在线"
    if not url:
        return jsonify({"error":"streamUrl required"}), 400
    item = {"id": f"cam-{len(video_store)+11}", "name": name, "status": status, "streamUrl": url}
    video_store.append(item)
    return jsonify({"ok": True, "item": item})

@app.get("/api/stream/<topic>")
def stream_topic(topic):
    def event_stream(q):
        yield "event: heartbeat\ndata: ok\n\n"
        while True:
            item = q.get()
            data = json.dumps(item, ensure_ascii=False)
            yield f"event: message\ndata: {data}\n\n"
    q = sse_hub.subscribe(topic)
    return Response(event_stream(q), mimetype="text/event-stream")

@app.post("/api/dev/push-risk")
def dev_push_risk():
    body = request.get_json(silent=True) or {}
    sse_hub.broadcast("tunnel-risk", "risk", body)
    return jsonify({"ok": True})

@app.post("/api/dev/push-sensors")
def dev_push_sensors():
    body = request.get_json(silent=True) or {}
    sse_hub.broadcast("sensors", "sensor", body)
    return jsonify({"ok": True})

@app.post("/api/ai/gemini")
def ai_gemini():
    body = request.get_json(silent=True) or {}
    prompt = body.get("prompt", "")
    system_instruction = body.get("systemInstruction", "")
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return jsonify({"error": "GEMINI_API_KEY not set"}), 500
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    if system_instruction:
        payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key={api_key}"
    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        text = (
            (data.get("candidates") or [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )
        return jsonify({"text": text})
    except urllib.error.HTTPError as e:
        return jsonify({"error": f"HTTP {e.code}"}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 502

@app.post("/api/ai/deepseek")
def ai_deepseek():
    body = request.get_json(silent=True) or {}
    prompt = body.get("prompt", "")
    system_instruction = body.get("systemInstruction", "")
    api_key = os.getenv("DEEPSEEK_API_KEY", "")
    if not api_key:
        return jsonify({"error": "DEEPSEEK_API_KEY not set"}), 500
    try:
        client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})
        resp = client.chat.completions.create(model="deepseek-chat", messages=messages, stream=False)
        text = ""
        try:
            text = resp.choices[0].message.content or ""
        except Exception:
            pass
        return jsonify({"text": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 502

@app.get("/api/health")
def health():
    status = "ok"
    return jsonify({"status": status, "useSupabase": USE_SUPABASE})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081, debug=False)
