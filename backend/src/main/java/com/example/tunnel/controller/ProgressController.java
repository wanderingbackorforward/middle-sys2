package com.example.tunnel.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return Map.of(
            "totalRings", 1245,
            "totalGoal", 2400,
            "dailyRings", 12,
            "remainingDays", 145,
            "value", 35430
        );
    }
    
    @GetMapping("/gantt")
    public List<Map<String, Object>> getGantt() {
        return List.of(
            Map.of("name", "始发井施工", "start", "2023-10-01", "end", "2023-11-01", "progress", 100),
            Map.of("name", "盾构组装调试", "start", "2023-11-01", "end", "2023-11-15", "progress", 100),
            Map.of("name", "扬州区间掘进（左线）", "start", "2023-11-15", "end", "2024-05-01", "progress", 52),
            Map.of("name", "扬州区间掘进（右线）", "start", "2023-12-01", "end", "2024-05-15", "progress", 45),
            Map.of("name", "联络通道施工", "start", "2024-05-01", "end", "2024-06-01", "progress", 0)
        );
    }

    @GetMapping("/dailyRings")
    public List<Map<String, Object>> getDailyRings() {
        List<Map<String, Object>> series = new ArrayList<>();
        long now = System.currentTimeMillis();
        Random r = new Random();
        for (int i = 14; i >= 0; i--) {
            long ts = now - i * 24 * 3600_000L;
            int val = 10 + r.nextInt(6);
            series.add(Map.of("ts", new java.sql.Timestamp(ts).toInstant().toString(), "value", val));
        }
        return series;
    }
}
