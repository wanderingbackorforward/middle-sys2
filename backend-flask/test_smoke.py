from app import app

def run():
    c = app.test_client()
    r1 = c.get("/api/dashboard/summary")
    print("summary", r1.status_code, len(r1.get_data()))
    r2 = c.get("/api/dashboard/notifications")
    print("notifications", r2.status_code, len(r2.get_data()))
    r3 = c.get("/api/dashboard/timeseries")
    print("timeseries", r3.status_code, len(r3.get_data()))
    r4 = c.get("/api/personnel/stats")
    print("personnel.stats", r4.status_code, len(r4.get_data()))
    r5 = c.get("/api/progress/stats")
    print("progress.stats", r5.status_code, len(r5.get_data()))
    r6 = c.get("/api/safety/settlement")
    print("safety.settlement", r6.status_code, len(r6.get_data()))
    r7 = c.get("/api/video/list")
    print("video.list", r7.status_code, len(r7.get_data()))

if __name__ == "__main__":
    run()

