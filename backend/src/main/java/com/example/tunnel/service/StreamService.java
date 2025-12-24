package com.example.tunnel.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Service
public class StreamService {
    private final Map<String, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String topic) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);
        emitters.computeIfAbsent(topic, k -> new CopyOnWriteArraySet<>()).add(emitter);
        emitter.onCompletion(() -> remove(topic, emitter));
        emitter.onTimeout(() -> remove(topic, emitter));
        emitter.onError(e -> remove(topic, emitter));
        try {
            emitter.send(SseEmitter.event().name("heartbeat").data("ok"));
        } catch (IOException ignored) {}
        return emitter;
    }

    public void broadcast(String topic, Object event) {
        Set<SseEmitter> set = emitters.get(topic);
        if (set == null || set.isEmpty()) return;
        for (SseEmitter emitter : set) {
            try {
                emitter.send(SseEmitter.event().name("message").data(event));
            } catch (IOException e) {
                remove(topic, emitter);
            }
        }
    }

    private void remove(String topic, SseEmitter emitter) {
        Set<SseEmitter> set = emitters.get(topic);
        if (set != null) {
            set.remove(emitter);
            if (set.isEmpty()) {
                emitters.remove(topic);
            }
        }
    }
}
