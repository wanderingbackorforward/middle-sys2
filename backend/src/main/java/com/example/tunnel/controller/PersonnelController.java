package com.example.tunnel.controller;

import com.example.tunnel.service.PersonnelService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
@RequestMapping("/api/personnel")
public class PersonnelController {
    private final PersonnelService personnelService;
    public PersonnelController(PersonnelService personnelService) { this.personnelService = personnelService; }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        var s = personnelService.getLatestStats();
        if (s == null) {
            return Map.of("totalOnSite", 0, "attendanceRate","0%", "violations",0, "managers",0);
        }
        return Map.of(
            "totalOnSite", s.getTotalOnSite(),
            "attendanceRate", s.getAttendanceRate(),
            "violations", s.getViolations(),
            "managers", s.getManagers()
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
        for (var p : personnelService.getAttendanceTrendRecent(12)) {
            series.add(Map.of("ts", p.getTs().toString(), "value", p.getValue()));
        }
        return series;
    }
}
