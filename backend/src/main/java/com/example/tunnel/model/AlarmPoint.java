package com.example.tunnel.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class AlarmPoint {
    @JsonProperty("ts")
    private Instant ts;
    @JsonProperty("value")
    private int value;

    public Instant getTs() { return ts; }
    public void setTs(Instant ts) { this.ts = ts; }
    public int getValue() { return value; }
    public void setValue(int value) { this.value = value; }
}
