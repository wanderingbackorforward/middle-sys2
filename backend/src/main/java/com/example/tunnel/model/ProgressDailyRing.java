package com.example.tunnel.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class ProgressDailyRing {
    @JsonProperty("ts")
    private Instant ts;
    @JsonProperty("value")
    private Integer value;
    public Instant getTs() { return ts; }
    public Integer getValue() { return value; }
}
