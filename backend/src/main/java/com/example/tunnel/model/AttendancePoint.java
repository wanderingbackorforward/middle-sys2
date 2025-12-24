package com.example.tunnel.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class AttendancePoint {
    @JsonProperty("ts")
    private Instant ts;
    @JsonProperty("value")
    private Integer value;
    public Instant getTs() { return ts; }
    public void setTs(Instant ts) { this.ts = ts; }
    public Integer getValue() { return value; }
    public void setValue(Integer value) { this.value = value; }
}
