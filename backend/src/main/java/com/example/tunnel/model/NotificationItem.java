package com.example.tunnel.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class NotificationItem {
    @JsonProperty("ts")
    private Instant ts;
    @JsonProperty("type")
    private String type;
    @JsonProperty("content")
    private String content;
    public Instant getTs() { return ts; }
    public String getType() { return type; }
    public String getContent() { return content; }
}
