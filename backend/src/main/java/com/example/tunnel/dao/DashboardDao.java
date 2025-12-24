package com.example.tunnel.dao;

import com.example.tunnel.config.SupabaseClient;
import com.example.tunnel.model.AdvanceSpeedPoint;
import com.example.tunnel.model.SlurryPressurePoint;
import com.example.tunnel.model.GasConcentrationPoint;
import com.example.tunnel.model.DashboardSummary;
import com.example.tunnel.model.NotificationItem;
import com.example.tunnel.model.SupplyItem;
import com.example.tunnel.model.DispatchItem;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class DashboardDao {
    private final SupabaseClient client;
    public DashboardDao(SupabaseClient client) { this.client = client; }
    public List<AdvanceSpeedPoint> fetchAdvanceSpeedRecent(int limit) {
        return client.fetchList("advance_speed", Map.of("select","*","order","ts.desc","limit",String.valueOf(limit)),
                new TypeReference<List<AdvanceSpeedPoint>>() {});
    }
    public List<SlurryPressurePoint> fetchSlurryPressureRecent(int limit) {
        return client.fetchList("slurry_pressure", Map.of("select","*","order","ts.desc","limit",String.valueOf(limit)),
                new TypeReference<List<SlurryPressurePoint>>() {});
    }
    public List<GasConcentrationPoint> fetchGasConcentrationRecent(int limit) {
        return client.fetchList("gas_concentration", Map.of("select","*","order","ts.desc","limit",String.valueOf(limit)),
                new TypeReference<List<GasConcentrationPoint>>() {});
    }
    public List<DashboardSummary> fetchSummaryLatest() {
        return client.fetchList("summary", Map.of("select","*","order","ts.desc","limit","1"),
                new TypeReference<List<DashboardSummary>>() {});
    }
    public List<NotificationItem> fetchNotificationsRecent(int limit) {
        return client.fetchList("notifications", Map.of("select","*","order","ts.desc","limit",String.valueOf(limit)),
                new TypeReference<List<NotificationItem>>() {});
    }
    public List<SupplyItem> fetchSuppliesAll() {
        return client.fetchList("supplies", Map.of("select","*"),
                new TypeReference<List<SupplyItem>>() {});
    }
    public List<DispatchItem> fetchDispatchRecent(int limit) {
        return client.fetchList("dispatch", Map.of("select","*","order","ts.desc","limit",String.valueOf(limit)),
                new TypeReference<List<DispatchItem>>() {});
    }
}
