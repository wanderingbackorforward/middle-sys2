package com.example.tunnel.dao;

import com.example.tunnel.config.SupabaseClient;
import com.example.tunnel.model.AlarmPoint;
import com.example.tunnel.model.RiskEvent;
import com.example.tunnel.model.SettlementPoint;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class SafetyDao {
    private final SupabaseClient client;
    public SafetyDao(SupabaseClient client) {
        this.client = client;
    }

    public List<SettlementPoint> fetchSettlementActualRecent(int limit) {
        return client.fetchList("settlement_actual",
                Map.of("select", "*", "order", "ts.desc", "limit", String.valueOf(limit)),
                new TypeReference<List<SettlementPoint>>() {});
    }

    public List<SettlementPoint> fetchSettlementPredictRecent(int limit) {
        return client.fetchList("settlement_predict",
                Map.of("select", "*", "order", "ts.desc", "limit", String.valueOf(limit)),
                new TypeReference<List<SettlementPoint>>() {});
    }

    public List<AlarmPoint> fetchAlarmTrendRecent(int limit) {
        return client.fetchList("alarm_trend",
                Map.of("select", "*", "order", "ts.desc", "limit", String.valueOf(limit)),
                new TypeReference<List<AlarmPoint>>() {});
    }

    public List<RiskEvent> fetchRisksRecent(int limit) {
        return client.fetchList("risks",
                Map.of("select", "*", "order", "ts.desc", "limit", String.valueOf(limit)),
                new TypeReference<List<RiskEvent>>() {});
    }
}
