package com.example.tunnel.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
@RequestMapping("/api/safety")
public class SafetyController {

    @GetMapping("/risks")
    public List<Map<String, Object>> getRisks() {
        return List.of(
            Map.of("level", "一级风险", "name", "下穿燃气管线", "status", "进行中", "desc", "当前盾构机位于管线正下方 5m 处，需严格控制土仓压力波动。", "code", "YZ10302", "ts", isoNow()),
            Map.of("level", "二级风险", "name", "侧穿桥桩", "status", "待进入", "desc", "预计 3 天后到达桥梁保护区范围。", "code", "YZ10310", "ts", isoNow())
        );
    }
    
    @GetMapping("/settlement")
    public Map<String, Object> getSettlement() {
        List<Map<String, Object>> actual = new ArrayList<>();
        List<Map<String, Object>> predict = new ArrayList<>();
        long now = System.currentTimeMillis();
        Random r = new Random();
        double base = 10.0;
        for (int i = 24; i >= 0; i--) {
            long ts = now - i * 3600_000L;
            double val = base + (24 - i) * 0.3 + (r.nextDouble() - 0.5) * 0.6;
            actual.add(Map.of("ts", new java.sql.Timestamp(ts).toInstant().toString(), "value", Math.round(val * 100.0) / 100.0));
            if (i <= 6) {
                double p = val + (r.nextDouble()) * 1.2;
                predict.add(Map.of("ts", new java.sql.Timestamp(ts).toInstant().toString(), "value", Math.round(p * 100.0) / 100.0));
            }
        }
        return Map.of("actual", actual, "predict", predict);
    }
    
    @GetMapping("/score")
    public Map<String, Integer> getScore() {
        return Map.of("score", 92);
    }
    
    @GetMapping("/alarmTrend")
    public List<Map<String, Object>> getAlarmTrend() {
         List<Map<String, Object>> series = new ArrayList<>();
         long now = System.currentTimeMillis();
         Random r = new Random();
         for (int i = 6; i >= 0; i--) {
             long ts = now - i * 24 * 3600_000L;
             int val = r.nextInt(6);
             series.add(Map.of("ts", new java.sql.Timestamp(ts).toInstant().toString(), "value", val));
         }
         return series;
    }

    private String isoNow() {
        return new java.sql.Timestamp(System.currentTimeMillis()).toInstant().toString();
    }
}
