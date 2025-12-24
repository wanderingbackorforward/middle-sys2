package com.example.tunnel.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        Map<String, Object> data = new HashMap<>();
        data.put("projectName", "江苏扬州地铁盾构隧道工程");
        data.put("lat", 32.3942);
        data.put("lng", 119.4070);
        data.put("cameraOnline", 1018);
        data.put("cameraTotal", 1415);
        data.put("ringToday", 12);
        data.put("ringCumulative", 1245);
        data.put("muckToday", 260.5);
        data.put("slurryPressureAvg", 0.42);
        data.put("gasAlerts", 2);
        return data;
    }

    @GetMapping("/notifications")
    public List<Map<String, String>> getNotifications() {
        List<Map<String, String>> list = new ArrayList<>();
        list.add(Map.of("time", "19:27", "type", "掘进", "content", "扬州XX区间左线完成1020环掘进"));
        list.add(Map.of("time", "19:25", "type", "注浆", "content", "盾尾注浆压力波动，已调参稳定"));
        list.add(Map.of("time", "19:20", "type", "设备", "content", "皮带机短时停机，检修后恢复"));
        list.add(Map.of("time", "19:15", "type", "监测", "content", "DK12+200沉降速率接近阈值，加强观测"));
        list.add(Map.of("time", "19:10", "type", "安全", "content", "管片搬运通道拥挤，现场已疏导"));
        return list;
    }
    
    @GetMapping("/supplies")
    public Map<String, Integer> getSupplies() {
        return Map.of("注浆料", 4500, "水泥", 3200, "防护用品", 3500, "应急照明", 1200, "其他", 500);
    }
    
    @GetMapping("/dispatch")
    public List<Map<String, String>> getDispatch() {
        return List.of(
            Map.of("time", "19:27", "type", "掘进", "unit", "盾构操作班", "status", "处理中"),
            Map.of("time", "19:15", "type", "监测", "unit", "监测项目部", "status", "待处理"),
            Map.of("time", "18:30", "type", "设备", "unit", "机电维修组", "status", "已完成")
        );
    }

    @GetMapping("/timeseries")
    public Map<String, List<Map<String, Object>>> getTimeSeries() {
        Map<String, List<Map<String, Object>>> result = new HashMap<>();
        result.put("advanceSpeed", generateSeries(24, 8.0, 2.0)); // 环/小时
        result.put("slurryPressure", generateSeries(24, 0.42, 0.05)); // MPa
        result.put("gasConcentration", generateSeries(24, 10.0, 6.0)); // ppm
        return result;
    }

    private List<Map<String, Object>> generateSeries(int hours, double base, double fluct) {
        List<Map<String, Object>> series = new ArrayList<>();
        long now = System.currentTimeMillis();
        Random r = new Random();
        for (int i = hours; i >= 0; i--) {
            long ts = now - i * 3600_000L;
            double val = Math.max(0, base + (r.nextDouble() - 0.5) * fluct * 2);
            Map<String, Object> point = new HashMap<>();
            point.put("ts", new java.sql.Timestamp(ts).toInstant().toString());
            point.put("value", Math.round(val * 100.0) / 100.0);
            series.add(point);
        }
        return series;
    }
}
