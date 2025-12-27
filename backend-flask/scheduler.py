from apscheduler.schedulers.background import BackgroundScheduler

def start_scheduler(supa, hub):
    scheduler = BackgroundScheduler()

    def push_dashboard():
        a = supa.get_list("advance_speed", limit=1)
        s = supa.get_list("slurry_pressure", limit=1)
        g = supa.get_list("gas_concentration", limit=1)
        if a:
            hub.broadcast("dashboard", "dashboard.advanceSpeed", {"ts": a[0].get("ts"), "value": a[0].get("value")})
        else:
            hub.broadcast("dashboard", "dashboard.advanceSpeed", {"ts": None, "value": 1.2})
        if s:
            hub.broadcast("dashboard", "dashboard.slurryPressure", {"ts": s[0].get("ts"), "value": s[0].get("value")})
        else:
            hub.broadcast("dashboard", "dashboard.slurryPressure", {"ts": None, "value": 1.8})
        if g:
            hub.broadcast("dashboard", "dashboard.gasConcentration", {"ts": g[0].get("ts"), "value": g[0].get("value")})
        else:
            hub.broadcast("dashboard", "dashboard.gasConcentration", {"ts": None, "value": 0.1})
        summary = supa.get_list("summary", limit=1)
        if summary:
            row = summary[0]
            hub.broadcast("dashboard", "dashboard.summary", {
                "cameraOnline": row.get("camera_online", 0),
                "cameraTotal": row.get("camera_total", 0),
                "ringToday": row.get("ring_today", 0),
                "ringCumulative": row.get("ring_cumulative", 0),
                "muckToday": row.get("muck_today", 0),
                "slurryPressureAvg": row.get("slurry_pressure_avg", 0),
                "gasAlerts": row.get("gas_alerts", 0)
            })

    def push_personnel():
        a = supa.get_list("attendance_trend", limit=1)
        if a:
            hub.broadcast("personnel", "personnel.attendanceTrend", {"ts": a[0].get("ts"), "value": a[0].get("value")})
        else:
            hub.broadcast("personnel", "personnel.attendanceTrend", {"ts": None, "value": 85})
        stats = supa.get_list("stats", limit=1)
        if stats:
            r = stats[0]
            hub.broadcast("personnel", "personnel.stats", {
                "totalOnSite": r.get("total_on_site", 0),
                "attendanceRate": r.get("attendance_rate", "0%"),
                "violations": r.get("violations", 0),
                "managers": r.get("managers", 0)
            })
        else:
            hub.broadcast("personnel", "personnel.stats", {"totalOnSite": 48, "attendanceRate": "92%", "violations": 0, "managers": 6})

    def push_progress():
        d = supa.get_list("daily_rings", limit=1)
        if d:
            hub.broadcast("progress", "progress.dailyRings", {"ts": d[0].get("ts"), "value": d[0].get("value")})
        else:
            hub.broadcast("progress", "progress.dailyRings", {"ts": None, "value": 4})
        stats = supa.get_list("stats_progress", limit=1)
        if stats:
            r = stats[0]
            hub.broadcast("progress", "progress.stats", {
                "totalRings": r.get("total_rings", 0),
                "totalGoal": r.get("total_goal", 0),
                "dailyRings": r.get("daily_rings", 0),
                "remainingDays": r.get("remaining_days", 0),
                "value": r.get("value", 0)
            })
        else:
            hub.broadcast("progress", "progress.stats", {"totalRings": 130, "totalGoal": 240, "dailyRings": 4, "remainingDays": 28, "value": 54})

    def push_safety():
        a = supa.get_list("settlement_actual", limit=1)
        p = supa.get_list("settlement_predict", limit=1)
        if a:
            hub.broadcast("safety", "safety.settlement.actual", {"ts": a[0].get("ts"), "value": a[0].get("value")})
        else:
            hub.broadcast("safety", "safety.settlement.actual", {"ts": None, "value": 1.0})
        if p:
            hub.broadcast("safety", "safety.settlement.predict", {"ts": p[0].get("ts"), "value": p[0].get("value")})
        else:
            hub.broadcast("safety", "safety.settlement.predict", {"ts": None, "value": 1.2})
        alarm = supa.get_list("alarm_trend", limit=1)
        if alarm:
            hub.broadcast("safety", "safety.alarmTrend", {"ts": alarm[0].get("ts"), "value": alarm[0].get("value")})
        else:
            hub.broadcast("safety", "safety.alarmTrend", {"ts": None, "value": 1})

    scheduler.add_job(push_dashboard, "interval", seconds=2, max_instances=1)
    scheduler.add_job(push_personnel, "interval", seconds=3, max_instances=1)
    scheduler.add_job(push_progress, "interval", seconds=3, max_instances=1)
    scheduler.add_job(push_safety, "interval", seconds=4, max_instances=1)
    scheduler.start()
