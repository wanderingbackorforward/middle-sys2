package com.example.tunnel.dao;

import com.example.tunnel.config.SupabaseClient;
import com.example.tunnel.model.ProgressDailyRing;
import com.example.tunnel.model.ProgressStats;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class ProgressDao {
    private final SupabaseClient client;
    public ProgressDao(SupabaseClient client) { this.client = client; }
    public List<ProgressDailyRing> fetchDailyRingsRecent(int limit) {
        return client.fetchList("daily_rings", Map.of("select","*","order","ts.desc","limit",String.valueOf(limit)),
                new TypeReference<List<ProgressDailyRing>>() {});
    }
    public List<ProgressStats> fetchLatestStats() {
        return client.fetchList("stats_progress", Map.of("select","*","order","ts.desc","limit","1"),
                new TypeReference<List<ProgressStats>>() {});
    }
}
