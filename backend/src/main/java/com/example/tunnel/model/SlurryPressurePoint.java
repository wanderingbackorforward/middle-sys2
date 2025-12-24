package com.example.tunnel.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class SlurryPressurePoint {
    @JsonProperty("ts")
    private Instant ts;
    @JsonProperty("value")
    private double value;
    public Instant getTs() { return ts; }
    public void setTs(Instant ts) { this.ts = ts; }
    public double getValue() { return value; }
    public void setValue(double value) { this.value = value; }
}
