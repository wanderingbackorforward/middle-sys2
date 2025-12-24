package com.example.tunnel.controller;

import com.example.tunnel.service.SafetyService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
@RequestMapping("/api/safety")
public class SafetyController {
    private final SafetyService safetyService;
    public SafetyController(SafetyService safetyService) {
        this.safetyService = safetyService;
    }

    @GetMapping("/risks")
    public List<Map<String, Object>> getRisks() {
        var list = safetyService.getRisksRecent(20);
        List<Map<String, Object>> out = new ArrayList<>();
        for (var r : list) {
            out.add(Map.of(
                    "level", r.getLevel(),
                    "name", r.getName(),
                    "status", r.getStatus(),
                    "desc", r.getDescription(),
                    "code", r.getCode(),
                    "ts", r.getTs().toString()
            ));
        }
        return out;
    }
    
    @GetMapping("/settlement")
    public Map<String, Object> getSettlement() {
        var actualPoints = safetyService.getSettlementActualRecent(25);
        var predictPoints = safetyService.getSettlementPredictRecent(25);
        List<Map<String, Object>> actual = new ArrayList<>();
        for (var p : actualPoints) {
            actual.add(Map.of("ts", p.getTs().toString(), "value", p.getValue()));
        }
        List<Map<String, Object>> predict = new ArrayList<>();
        for (var p : predictPoints) {
            predict.add(Map.of("ts", p.getTs().toString(), "value", p.getValue()));
        }
        return Map.of("actual", actual, "predict", predict);
    }
    
    @GetMapping("/score")
    public Map<String, Integer> getScore() {
        return Map.of("score", 92);
    }
    
    @GetMapping("/alarmTrend")
    public List<Map<String, Object>> getAlarmTrend() {
         var points = safetyService.getAlarmTrendRecent(7);
         List<Map<String, Object>> out = new ArrayList<>();
         for (var p : points) {
             out.add(Map.of("ts", p.getTs().toString(), "value", p.getValue()));
         }
         return out;
    }

    @GetMapping("/verify")
    public Map<String, Object> verify() {
        var actual = safetyService.getSettlementActualRecent(1);
        var risks = safetyService.getRisksRecent(1);
        return Map.of(
                "settlement_actual_count", actual.size(),
                "risks_count", risks.size(),
                "sample_actual", actual.isEmpty() ? null : actual.get(0),
                "sample_risk", risks.isEmpty() ? null : risks.get(0)
        );
    }

    private String isoNow() {
        return new java.sql.Timestamp(System.currentTimeMillis()).toInstant().toString();
    }
}
