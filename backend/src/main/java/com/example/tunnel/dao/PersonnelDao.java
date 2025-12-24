package com.example.tunnel.dao;

import com.example.tunnel.config.SupabaseClient;
import com.example.tunnel.model.AttendancePoint;
import com.example.tunnel.model.PersonnelStats;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class PersonnelDao {
    private final SupabaseClient client;
    public PersonnelDao(SupabaseClient client) { this.client = client; }
    public List<AttendancePoint> fetchAttendanceTrendRecent(int limit) {
        return client.fetchList("attendance_trend", Map.of("select","*","order","ts.desc","limit",String.valueOf(limit)),
                new TypeReference<List<AttendancePoint>>() {});
    }
    public List<PersonnelStats> fetchLatestStats() {
        return client.fetchList("stats", Map.of("select","*","order","ts.desc","limit","1"),
                new TypeReference<List<PersonnelStats>>() {});
    }
}
