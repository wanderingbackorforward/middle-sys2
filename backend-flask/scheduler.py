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

    # ================= 智能体自主监控任务 =================
    
    # 上次触发时间，避免过于频繁
    last_trigger_ts = 0
    
    def monitor_risk_agent():
        nonlocal last_trigger_ts
        import time
        import random
        import os
        
        # 开关控制：默认开启，除非设置 DISABLE_AUTO_AGENT=1
        if os.getenv("DISABLE_AUTO_AGENT", "0") == "1":
            return

        # 冷却时间检查 (例如至少间隔 60 秒)
        now = time.time()
        if now - last_trigger_ts < 60:
            return

        # 模拟随机触发 (20% 概率)
        if random.random() > 0.2:
            return

        print("[Scheduler] ☁️ 智能体自主监控：检测到传感器数据异常，正在介入...")
        
        try:
            from agent import run_agent
            
            # 随机生成一种风险场景
            scenarios = [
                {
                    "type": "gas",
                    "data": {"ch4": round(random.uniform(0.8, 1.5), 2), "trend": "rising"},
                    "location": "回风管路 A1段"
                },
                {
                    "type": "personnel",
                    "data": {"distance": round(random.uniform(0.5, 1.5), 1), "confidence": 98.5},
                    "location": "管片拼装区 B2段"
                },
                {
                    "type": "vehicle",
                    "data": {"speed": random.randint(15, 25), "proximity": 3.0},
                    "location": "后配套物流通道"
                }
            ]
            scenario = random.choice(scenarios)
            
            # 发送"正在分析"的信号
            hub.broadcast("agent-status", "agent", {
                "state": "detecting",
                "message": f"监测到 {scenario['location']} 异常数据，智能体介入分析中..."
            })
            
            # 运行智能体
            result = run_agent(scenario["type"], scenario["data"], scenario["location"])
            
            # 广播分析结果
            hub.broadcast("agent-status", "agent", {
                "state": "completed",
                "risk_type": scenario["type"],
                "risk_level": result.get("risk_level"),
                "plan_count": len(result.get("decision_plan", [])),
                "auto_triggered": True, # 标记为自动触发
                "result": {
                     "analysis": result.get("analysis_result"),
                     "decision_plan": result.get("decision_plan", []),
                     "report": result.get("report", "")
                }
            })
            
            last_trigger_ts = now
            print(f"[Scheduler] ✅ 智能体自主分析完成: {scenario['type']}")
            
        except Exception as e:
            print(f"[Scheduler] ❌ 智能体监控任务异常: {e}")
            import traceback
            traceback.print_exc()

    scheduler.add_job(push_dashboard, "interval", seconds=2, max_instances=1)
    scheduler.add_job(push_personnel, "interval", seconds=3, max_instances=1)
    scheduler.add_job(push_progress, "interval", seconds=3, max_instances=1)
    scheduler.add_job(push_safety, "interval", seconds=4, max_instances=1)
    
    # 添加智能体监控任务 (每 10 秒轮询一次)
    scheduler.add_job(monitor_risk_agent, "interval", seconds=10, max_instances=1)
    
    scheduler.start()
