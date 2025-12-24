package com.example.tunnel.controller;

import com.example.tunnel.service.StreamService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/stream")
public class StreamController {
    private final StreamService streamService;
    public StreamController(StreamService streamService) {
        this.streamService = streamService;
    }

    @GetMapping("/dashboard")
    public SseEmitter dashboard() {
        return streamService.subscribe("dashboard");
    }

    @GetMapping("/personnel")
    public SseEmitter personnel() {
        return streamService.subscribe("personnel");
    }

    @GetMapping("/safety")
    public SseEmitter safety() {
        return streamService.subscribe("safety");
    }

    @GetMapping("/progress")
    public SseEmitter progress() {
        return streamService.subscribe("progress");
    }
}
