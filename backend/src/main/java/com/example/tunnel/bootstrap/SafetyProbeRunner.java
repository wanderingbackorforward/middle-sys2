package com.example.tunnel.bootstrap;

import com.example.tunnel.service.SafetyService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class SafetyProbeRunner implements ApplicationRunner {
    private final SafetyService safetyService;
    public SafetyProbeRunner(SafetyService safetyService) {
        this.safetyService = safetyService;
    }
    @Override
    public void run(ApplicationArguments args) {
        try {
            var a = safetyService.getSettlementActualRecent(1);
            var r = safetyService.getRisksRecent(1);
            System.out.println("Supabase settlement_actual rows: " + a.size());
            System.out.println("Supabase risks rows: " + r.size());
        } catch (Exception e) {
            System.out.println("Supabase probe failed: " + e.getMessage());
        }
    }
}
