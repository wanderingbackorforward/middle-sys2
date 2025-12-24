package com.example.tunnel.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class RiskEvent {
    @JsonProperty("ts")
    private Instant ts;
    @JsonProperty("level")
    private String level;
    @JsonProperty("name")
    private String name;
    @JsonProperty("status")
    private String status;
    @JsonProperty("description")
    private String description;
    @JsonProperty("code")
    private String code;

    public Instant getTs() { return ts; }
    public void setTs(Instant ts) { this.ts = ts; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
