package com.example.tunnel.scheduler;

import com.example.tunnel.service.StreamService;
import com.example.tunnel.service.SafetyService;
import com.example.tunnel.service.DashboardService;
import com.example.tunnel.service.PersonnelService;
import com.example.tunnel.service.ProgressService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.List;

@Component
public class StreamScheduler {
    private final StreamService streamService;
    private final SafetyService safetyService;
    private final DashboardService dashboardService;
    private final PersonnelService personnelService;
    private final ProgressService progressService;
    private final Random random = new Random();

    private double advanceBase = 8.0;
    private double slurryBase = 0.42;
    private int gasBase = 10;

    private int totalRings = 1245;
    private int dailyRings = 12;

    public StreamScheduler(StreamService streamService, SafetyService safetyService,
                           DashboardService dashboardService, PersonnelService personnelService,
                           ProgressService progressService) {
        this.streamService = streamService;
        this.safetyService = safetyService;
        this.dashboardService = dashboardService;
        this.personnelService = personnelService;
        this.progressService = progressService;
    }

    private String nowTs() {
        return new Timestamp(System.currentTimeMillis()).toInstant().toString();
    }

    private double jitter(double base, double span) {
        return Math.max(0, base + (random.nextDouble() - 0.5) * span * 2);
    }

    @Scheduled(fixedRate = 1000)
    public void dashboardSeries() {
        try {
            var adv = dashboardService.getAdvanceSpeedRecent(1);
            if (!adv.isEmpty()) {
                var p = adv.get(0);
                streamService.broadcast("dashboard", Map.of(
                        "channel", "dashboard.advanceSpeed",
                        "payload", Map.of("ts", p.getTs().toString(), "value", p.getValue())
                ));
            }
            var sl = dashboardService.getSlurryPressureRecent(1);
            if (!sl.isEmpty()) {
                var p = sl.get(0);
                streamService.broadcast("dashboard", Map.of(
                        "channel", "dashboard.slurryPressure",
                        "payload", Map.of("ts", p.getTs().toString(), "value", p.getValue())
                ));
            }
            var gas = dashboardService.getGasConcentrationRecent(1);
            if (!gas.isEmpty()) {
                var p = gas.get(0);
                streamService.broadcast("dashboard", Map.of(
                        "channel", "dashboard.gasConcentration",
                        "payload", Map.of("ts", p.getTs().toString(), "value", p.getValue())
                ));
            }
        } catch (Exception ignored) {}
    }

    @Scheduled(fixedRate = 2000)
    public void dashboardKpi() {
        try {
            var s = dashboardService.getLatestSummary();
            if (s != null) {
                streamService.broadcast("dashboard", Map.of(
                        "channel", "dashboard.summary",
                        "payload", Map.of(
                                "ringToday", s.getRingToday(),
                                "ringCumulative", s.getRingCumulative(),
                                "muckToday", s.getMuckToday(),
                                "slurryPressureAvg", s.getSlurryPressureAvg(),
                                "cameraOnline", s.getCameraOnline(),
                                "cameraTotal", s.getCameraTotal()
                        )
                ));
            }
        } catch (Exception ignored) {}
    }

    @Scheduled(fixedRate = 1500)
    public void personnelAttendance() {
        try {
            var list = personnelService.getAttendanceTrendRecent(1);
            if (!list.isEmpty()) {
                var p = list.get(0);
                streamService.broadcast("personnel", Map.of(
                        "channel", "personnel.attendanceTrend",
                        "payload", Map.of("ts", p.getTs().toString(), "value", p.getValue())
                ));
            }
        } catch (Exception ignored) {}
    }

    @Scheduled(fixedRate = 4000)
    public void personnelStats() {
        try {
            var s = personnelService.getLatestStats();
            if (s != null) {
                streamService.broadcast("personnel", Map.of(
                        "channel", "personnel.stats",
                        "payload", Map.of(
                                "totalOnSite", s.getTotalOnSite(),
                                "attendanceRate", s.getAttendanceRate(),
                                "violations", s.getViolations(),
                                "managers", s.getManagers()
                        )
                ));
            }
        } catch (Exception ignored) {}
    }

    @Scheduled(fixedRate = 1200)
    public void safetySettlement() {
        try {
            List<com.example.tunnel.model.SettlementPoint> actualList = safetyService.getSettlementActualRecent(1);
            if (!actualList.isEmpty()) {
                var p = actualList.get(0);
                Map<String, Object> actual = new HashMap<>();
                actual.put("channel", "safety.settlement.actual");
                actual.put("payload", Map.of("ts", p.getTs().toString(), "value", p.getValue()));
                streamService.broadcast("safety", actual);
            }
            List<com.example.tunnel.model.SettlementPoint> predictList = safetyService.getSettlementPredictRecent(1);
            if (!predictList.isEmpty()) {
                var p2 = predictList.get(0);
                Map<String, Object> predict = new HashMap<>();
                predict.put("channel", "safety.settlement.predict");
                predict.put("payload", Map.of("ts", p2.getTs().toString(), "value", p2.getValue()));
                streamService.broadcast("safety", predict);
            }
        } catch (Exception ignored) {}
    }

    @Scheduled(fixedRate = 3000)
    public void safetyAlarm() {
        try {
            List<com.example.tunnel.model.AlarmPoint> list = safetyService.getAlarmTrendRecent(1);
            if (!list.isEmpty()) {
                var p = list.get(0);
                Map<String, Object> alarm = new HashMap<>();
                alarm.put("channel", "safety.alarmTrend");
                alarm.put("payload", Map.of("ts", p.getTs().toString(), "value", p.getValue()));
                streamService.broadcast("safety", alarm);
            }
        } catch (Exception ignored) {}
    }

    @Scheduled(fixedRate = 2000)
    public void progressRingsAndStats() {
        try {
            var dr = progressService.getDailyRingsRecent(1);
            if (!dr.isEmpty()) {
                var p = dr.get(0);
                streamService.broadcast("progress", Map.of(
                        "channel", "progress.dailyRings",
                        "payload", Map.of("ts", p.getTs().toString(), "value", p.getValue())
                ));
            }
            var s = progressService.getLatestStats();
            if (s != null) {
                streamService.broadcast("progress", Map.of(
                        "channel", "progress.stats",
                        "payload", Map.of(
                                "totalRings", s.getTotalRings(),
                                "totalGoal", s.getTotalGoal(),
                                "dailyRings", s.getDailyRings(),
                                "remainingDays", s.getRemainingDays(),
                                "value", s.getValue()
                        )
                ));
            }
        } catch (Exception ignored) {}
    }
}
