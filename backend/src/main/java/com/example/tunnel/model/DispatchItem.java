package com.example.tunnel.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class DispatchItem {
    @JsonProperty("ts")
    private Instant ts;
    @JsonProperty("type")
    private String type;
    @JsonProperty("unit")
    private String unit;
    @JsonProperty("status")
    private String status;
    public Instant getTs() { return ts; }
    public String getType() { return type; }
    public String getUnit() { return unit; }
    public String getStatus() { return status; }
}
