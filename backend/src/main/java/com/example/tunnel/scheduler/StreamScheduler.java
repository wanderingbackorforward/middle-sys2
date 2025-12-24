package com.example.tunnel.scheduler;

import com.example.tunnel.service.StreamService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Component
public class StreamScheduler {
    private final StreamService streamService;
    private final Random random = new Random();

    private double advanceBase = 8.0;
    private double slurryBase = 0.42;
    private int gasBase = 10;

    private int totalRings = 1245;
    private int dailyRings = 12;

    public StreamScheduler(StreamService streamService) {
        this.streamService = streamService;
    }

    private String nowTs() {
        return new Timestamp(System.currentTimeMillis()).toInstant().toString();
    }

    private double jitter(double base, double span) {
        return Math.max(0, base + (random.nextDouble() - 0.5) * span * 2);
    }

    @Scheduled(fixedRate = 1000)
    public void dashboardSeries() {
        Map<String, Object> point1 = new HashMap<>();
        point1.put("channel", "dashboard.advanceSpeed");
        point1.put("payload", Map.of("ts", nowTs(), "value", Math.round(jitter(advanceBase, 2.0) * 100.0) / 100.0));
        streamService.broadcast("dashboard", point1);

        Map<String, Object> point2 = new HashMap<>();
        point2.put("channel", "dashboard.slurryPressure");
        point2.put("payload", Map.of("ts", nowTs(), "value", Math.round(jitter(slurryBase, 0.06) * 100.0) / 100.0));
        streamService.broadcast("dashboard", point2);

        Map<String, Object> point3 = new HashMap<>();
        point3.put("channel", "dashboard.gasConcentration");
        point3.put("payload", Map.of("ts", nowTs(), "value", Math.max(0, gasBase + random.nextInt(6) - 3)));
        streamService.broadcast("dashboard", point3);
    }

    @Scheduled(fixedRate = 2000)
    public void dashboardKpi() {
        int cameraOnline = 1018 + random.nextInt(5) - 2;
        Map<String, Object> kpi = new HashMap<>();
        kpi.put("channel", "dashboard.summary");
        kpi.put("payload", Map.of(
                "ringToday", dailyRings + random.nextInt(3) - 1,
                "ringCumulative", totalRings,
                "muckToday", Math.round((260.0 + (random.nextDouble() - 0.5) * 20) * 10.0) / 10.0,
                "slurryPressureAvg", Math.round(jitter(slurryBase, 0.03) * 100.0) / 100.0,
                "cameraOnline", cameraOnline,
                "cameraTotal", 1415
        ));
        streamService.broadcast("dashboard", kpi);
    }

    @Scheduled(fixedRate = 1500)
    public void personnelAttendance() {
        Map<String, Object> evt = new HashMap<>();
        int val = 420 + random.nextInt(80) - 40;
        evt.put("channel", "personnel.attendanceTrend");
        evt.put("payload", Map.of("ts", nowTs(), "value", Math.max(300, val)));
        streamService.broadcast("personnel", evt);
    }

    @Scheduled(fixedRate = 4000)
    public void personnelStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("channel", "personnel.stats");
        stats.put("payload", Map.of(
                "totalOnSite", 480 + random.nextInt(10),
                "attendanceRate", "98.5%",
                "violations", 3 + random.nextInt(2),
                "managers", 45
        ));
        streamService.broadcast("personnel", stats);
    }

    @Scheduled(fixedRate = 1200)
    public void safetySettlement() {
        Map<String, Object> actual = new HashMap<>();
        double val = 10.0 + (random.nextDouble() - 0.5) * 0.6 + Instant.now().getEpochSecond() % 100 * 0.002;
        actual.put("channel", "safety.settlement.actual");
        actual.put("payload", Map.of("ts", nowTs(), "value", Math.round(val * 100.0) / 100.0));
        streamService.broadcast("safety", actual);

        if (random.nextDouble() < 0.2) {
            Map<String, Object> predict = new HashMap<>();
            double pv = val + random.nextDouble();
            predict.put("channel", "safety.settlement.predict");
            predict.put("payload", Map.of("ts", nowTs(), "value", Math.round(pv * 100.0) / 100.0));
            streamService.broadcast("safety", predict);
        }
    }

    @Scheduled(fixedRate = 3000)
    public void safetyAlarm() {
        Map<String, Object> alarm = new HashMap<>();
        int v = random.nextInt(6);
        alarm.put("channel", "safety.alarmTrend");
        alarm.put("payload", Map.of("ts", nowTs(), "value", v));
        streamService.broadcast("safety", alarm);
    }

    @Scheduled(fixedRate = 2000)
    public void progressRingsAndStats() {
        Map<String, Object> rings = new HashMap<>();
        int v = 10 + random.nextInt(6);
        rings.put("channel", "progress.dailyRings");
        rings.put("payload", Map.of("ts", nowTs(), "value", v));
        streamService.broadcast("progress", rings);

        totalRings += v;
        Map<String, Object> stats = new HashMap<>();
        stats.put("channel", "progress.stats");
        stats.put("payload", Map.of(
                "totalRings", totalRings,
                "totalGoal", 2400,
                "dailyRings", v,
                "remainingDays", Math.max(1, (2400 - totalRings) / Math.max(1, dailyRings)),
                "value", 35430
        ));
        streamService.broadcast("progress", stats);
    }
}
