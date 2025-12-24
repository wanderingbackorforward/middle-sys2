package com.example.tunnel.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
@RequestMapping("/api/personnel")
public class PersonnelController {

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return Map.of(
            "totalOnSite", 482,
            "attendanceRate", "98.5%",
            "violations", 3,
            "managers", 45
        );
    }
    
    @GetMapping("/distribution")
    public List<Map<String, Object>> getDistribution() {
        return List.of(
            Map.of("name", "掘进班", "value", 120),
            Map.of("name", "管片拼装班", "value", 85),
            Map.of("name", "注浆班", "value", 60),
            Map.of("name", "其他", "value", 217)
        );
    }

    @GetMapping("/list")
    public List<Map<String, Object>> getList() {
        List<Map<String, Object>> list = new ArrayList<>();
        String[] teams = {"注浆班", "电工班", "掘进班", "管片班"};
        for (int i = 0; i < 10; i++) {
            list.add(Map.of(
                "id", "wk-100" + i,
                "name", "张三" + i,
                "team", teams[i % 4],
                "location", "扬州区间左线 " + (100 + i*10) + "m",
                "time", "07:30:00",
                "temp", "36." + (3+i%5) + "°C",
                "status", "作业中"
            ));
        }
        return list;
    }

    @GetMapping("/attendanceTrend")
    public List<Map<String, Object>> attendanceTrend() {
        List<Map<String, Object>> series = new ArrayList<>();
        long now = System.currentTimeMillis();
        Random r = new Random();
        int base = 420;
        for (int i = 12; i >= 0; i--) {
            long ts = now - i * 3600_000L;
            int val = base + r.nextInt(80) - 40;
            Map<String, Object> point = new HashMap<>();
            point.put("ts", new java.sql.Timestamp(ts).toInstant().toString());
            point.put("value", Math.max(300, val));
            series.add(point);
        }
        return series;
    }
}
