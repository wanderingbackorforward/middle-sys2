package com.example.tunnel.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class ProgressStats {
    @JsonProperty("ts")
    private Instant ts;
    @JsonProperty("total_rings")
    private Integer totalRings;
    @JsonProperty("total_goal")
    private Integer totalGoal;
    @JsonProperty("daily_rings")
    private Integer dailyRings;
    @JsonProperty("remaining_days")
    private Integer remainingDays;
    @JsonProperty("value")
    private Integer value;
    public Instant getTs() { return ts; }
    public Integer getTotalRings() { return totalRings; }
    public Integer getTotalGoal() { return totalGoal; }
    public Integer getDailyRings() { return dailyRings; }
    public Integer getRemainingDays() { return remainingDays; }
    public Integer getValue() { return value; }
}
