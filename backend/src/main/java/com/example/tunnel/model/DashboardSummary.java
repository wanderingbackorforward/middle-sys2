package com.example.tunnel.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class DashboardSummary {
    @JsonProperty("ts")
    private Instant ts;
    @JsonProperty("ring_today")
    private Integer ringToday;
    @JsonProperty("ring_cumulative")
    private Integer ringCumulative;
    @JsonProperty("muck_today")
    private Double muckToday;
    @JsonProperty("slurry_pressure_avg")
    private Double slurryPressureAvg;
    @JsonProperty("camera_online")
    private Integer cameraOnline;
    @JsonProperty("camera_total")
    private Integer cameraTotal;
    public Instant getTs() { return ts; }
    public void setTs(Instant ts) { this.ts = ts; }
    public Integer getRingToday() { return ringToday; }
    public Integer getRingCumulative() { return ringCumulative; }
    public Double getMuckToday() { return muckToday; }
    public Double getSlurryPressureAvg() { return slurryPressureAvg; }
    public Integer getCameraOnline() { return cameraOnline; }
    public Integer getCameraTotal() { return cameraTotal; }
}
