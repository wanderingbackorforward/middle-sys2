import os
import sys
import json
import datetime
import requests

# keep backend app for other routes
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend-flask'))
os.environ.setdefault("DISABLE_SCHEDULER", "1")
from app import app as backend_app

def _json_response(start_response, status_code, obj):
    start_response(f"{status_code} {'OK' if status_code==200 else 'Error'}", [("Content-Type", "application/json")])
    return [json.dumps(obj, ensure_ascii=False).encode("utf-8")]

def _read_json(environ):
    try:
        length = int(environ.get("CONTENT_LENGTH") or "0")
    except Exception:
        length = 0
    body = b""
    if length > 0 and environ.get("wsgi.input"):
        body = environ["wsgi.input"].read(length)
    try:
        return json.loads(body.decode("utf-8") if body else "{}")
    except Exception:
        return {}

def app(environ, start_response):
    path = environ.get("PATH_INFO", "") or ""
    method = environ.get("REQUEST_METHOD", "GET") or "GET"

    # AI proxy: DeepSeek
    if path == "/api/ai/deepseek" and method == "POST":
        data = _read_json(environ)
        prompt = data.get("prompt", "")
        system_instruction = data.get("systemInstruction", "")
        api_key = os.getenv("DEEPSEEK_API_KEY", "")
        if not api_key:
            return _json_response(start_response, 500, {"error": "DEEPSEEK_API_KEY not set"})
        try:
            payload = {
                "model": "deepseek-chat",
                "messages": (
                    ([{"role": "system", "content": system_instruction}] if system_instruction else [])
                    + [{"role": "user", "content": prompt}]
                ),
                "stream": False
            }
            r = requests.post(
                "https://api.deepseek.com/v1/chat/completions",
                json=payload,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                timeout=15
            )
            if r.status_code // 100 == 2:
                j = r.json()
                text = (j.get("choices") or [{}])[0].get("message", {}).get("content", "") or ""
                return _json_response(start_response, 200, {"text": text})
            return _json_response(start_response, 502, {"error": f"HTTP {r.status_code}"})
        except Exception as e:
            return _json_response(start_response, 502, {"error": str(e)})

    # SSE endpoints: return a single heartbeat and close to avoid 500
    if path.startswith("/api/stream/") and method == "GET":
        start_response("200 OK", [
            ("Content-Type", "text/event-stream"),
            ("Cache-Control", "no-cache"),
            ("Connection", "close")
        ])
        return [b"event: heartbeat\ndata: ok\n\n"]

    # Demo data endpoints to avoid 500 errors
    if path == "/api/dashboard/summary":
        now = datetime.datetime.now()
        return _json_response(start_response, 200, {
            "projectName": "江苏扬州地铁盾构隧道工程",
            "lat": 32.3942,
            "lng": 119.407,
            "cameraOnline": 12,
            "cameraTotal": 16,
            "ringToday": 12,
            "ringCumulative": 1978,
            "muckToday": 252.9,
            "slurryPressureAvg": 0.43,
            "gasAlerts": 0,
            "ts": now.isoformat()
        })

    if path == "/api/dashboard/notifications":
        return _json_response(start_response, 200, [
            {"time": "19:27", "type": "交通", "content": "上海路与长宁路交叉口发生车辆剐蹭，造成拥堵，已派员处理"},
            {"time": "19:35", "type": "消防", "content": "管片拼装区进行安全巡检，未发现异常"},
            {"time": "19:45", "type": "通知", "content": "注浆站完成例检，设备状态良好"}
        ])

    if path == "/api/dashboard/supplies":
        return _json_response(start_response, 200, {"水泥": 120, "砂石": 200, "钢筋": 80, "燃料": 60})

    if path == "/api/dashboard/dispatch":
        return _json_response(start_response, 200, [
            {"time": "19:27", "type": "人员", "unit": "注浆班", "status": "到岗"},
            {"time": "19:45", "type": "车辆", "unit": "物资运输", "status": "出发"},
            {"time": "20:05", "type": "人员", "unit": "巡检队", "status": "处理中"}
        ])

    if path == "/api/dashboard/timeseries":
        base = datetime.datetime.now(datetime.timezone.utc)
        advance = [{"ts": (base.replace(microsecond=0).isoformat()), "value": 6 + (i % 5)} for i in range(24)]
        slurry = [{"ts": (base.replace(microsecond=0).isoformat()), "value": 0.3 + (i % 4) * 0.03} for i in range(24)]
        gas = [{"ts": (base.replace(microsecond=0).isoformat()), "value": 0.1 + (i % 3) * 0.02} for i in range(24)]
        return _json_response(start_response, 200, {
            "advanceSpeed": advance,
            "slurryPressure": slurry,
            "gasConcentration": gas
        })

    # Fallback to original backend app for any other routes
    return backend_app(environ, start_response)
