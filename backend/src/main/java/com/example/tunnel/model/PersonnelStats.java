package com.example.tunnel.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class PersonnelStats {
    @JsonProperty("ts")
    private Instant ts;
    @JsonProperty("total_on_site")
    private Integer totalOnSite;
    @JsonProperty("attendance_rate")
    private String attendanceRate;
    @JsonProperty("violations")
    private Integer violations;
    @JsonProperty("managers")
    private Integer managers;
    public Instant getTs() { return ts; }
    public Integer getTotalOnSite() { return totalOnSite; }
    public String getAttendanceRate() { return attendanceRate; }
    public Integer getViolations() { return violations; }
    public Integer getManagers() { return managers; }
}
