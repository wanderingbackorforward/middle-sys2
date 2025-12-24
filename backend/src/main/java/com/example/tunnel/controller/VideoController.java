package com.example.tunnel.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
@RequestMapping("/api/video")
public class VideoController {

    @GetMapping("/list")
    public List<Map<String, String>> getVideoList() {
        return List.of(
            Map.of("id", "1", "name", "盾构机内部", "status", "LIVE", "img", "tunnel-internal"),
            Map.of("id", "2", "name", "渣土输送皮带", "status", "LIVE", "img", "belt"),
            Map.of("id", "3", "name", "盾尾注浆区", "status", "LIVE", "img", "grouting"),
            Map.of("id", "4", "name", "隧道入口监控", "status", "LIVE", "img", "entrance"),
            Map.of("id", "5", "name", "材料堆放场", "status", "LIVE", "img", "material")
        );
    }
}
