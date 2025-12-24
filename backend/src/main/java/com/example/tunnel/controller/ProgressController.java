package com.example.tunnel.controller;

import com.example.tunnel.service.ProgressService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {
    private final ProgressService progressService;
    public ProgressController(ProgressService progressService) { this.progressService = progressService; }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        var s = progressService.getLatestStats();
        if (s == null) {
            return Map.of("totalRings",0,"totalGoal",0,"dailyRings",0,"remainingDays",0,"value",0);
        }
        return Map.of(
            "totalRings", s.getTotalRings(),
            "totalGoal", s.getTotalGoal(),
            "dailyRings", s.getDailyRings(),
            "remainingDays", s.getRemainingDays(),
            "value", s.getValue()
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
        for (var p : progressService.getDailyRingsRecent(14)) {
            series.add(Map.of("ts", p.getTs().toString(), "value", p.getValue()));
        }
        return series;
    }
}
