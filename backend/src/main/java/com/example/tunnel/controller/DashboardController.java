package com.example.tunnel.controller;

import com.example.tunnel.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        Map<String, Object> data = new HashMap<>();
        data.put("projectName", "江苏扬州地铁盾构隧道工程");
        data.put("lat", 32.3942);
        data.put("lng", 119.4070);
        var s = dashboardService.getLatestSummary();
        if (s != null) {
            data.put("cameraOnline", s.getCameraOnline());
            data.put("cameraTotal", s.getCameraTotal());
            data.put("ringToday", s.getRingToday());
            data.put("ringCumulative", s.getRingCumulative());
            data.put("muckToday", s.getMuckToday());
            data.put("slurryPressureAvg", s.getSlurryPressureAvg());
            data.put("gasAlerts", 2);
        }
        return data;
    }

    @GetMapping("/notifications")
    public List<Map<String, String>> getNotifications() {
        List<Map<String, String>> out = new ArrayList<>();
        for (var n : dashboardService.getNotificationsRecent(20)) {
            String time = java.time.OffsetDateTime.ofInstant(n.getTs(), java.time.ZoneOffset.UTC).toLocalTime().toString();
            out.add(Map.of("time", time, "type", n.getType(), "content", n.getContent()));
        }
        return out;
    }
    
    @GetMapping("/supplies")
    public Map<String, Integer> getSupplies() {
        Map<String, Integer> out = new LinkedHashMap<>();
        for (var s : dashboardService.getSuppliesAll()) {
            out.put(s.getCategory(), s.getQuantity());
        }
        return out;
    }
    
    @GetMapping("/dispatch")
    public List<Map<String, String>> getDispatch() {
        List<Map<String, String>> out = new ArrayList<>();
        for (var d : dashboardService.getDispatchRecent(20)) {
            String time = java.time.OffsetDateTime.ofInstant(d.getTs(), java.time.ZoneOffset.UTC).toLocalTime().toString();
            out.add(Map.of("time", time, "type", d.getType(), "unit", d.getUnit(), "status", d.getStatus()));
        }
        return out;
    }

    @GetMapping("/timeseries")
    public Map<String, List<Map<String, Object>>> getTimeSeries() {
        Map<String, List<Map<String, Object>>> result = new HashMap<>();
        List<Map<String, Object>> adv = new ArrayList<>();
        for (var p : dashboardService.getAdvanceSpeedRecent(24)) {
            adv.add(Map.of("ts", p.getTs().toString(), "value", p.getValue()));
        }
        List<Map<String, Object>> sl = new ArrayList<>();
        for (var p : dashboardService.getSlurryPressureRecent(24)) {
            sl.add(Map.of("ts", p.getTs().toString(), "value", p.getValue()));
        }
        List<Map<String, Object>> gas = new ArrayList<>();
        for (var p : dashboardService.getGasConcentrationRecent(24)) {
            gas.add(Map.of("ts", p.getTs().toString(), "value", p.getValue()));
        }
        result.put("advanceSpeed", adv);
        result.put("slurryPressure", sl);
        result.put("gasConcentration", gas);
        return result;
    }
}
