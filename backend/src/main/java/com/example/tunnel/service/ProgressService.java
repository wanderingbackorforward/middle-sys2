package com.example.tunnel.service;

import com.example.tunnel.dao.ProgressDao;
import com.example.tunnel.model.ProgressDailyRing;
import com.example.tunnel.model.ProgressStats;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProgressService {
    private final ProgressDao dao;
    public ProgressService(ProgressDao dao) { this.dao = dao; }
    public List<ProgressDailyRing> getDailyRingsRecent(int limit) { return dao.fetchDailyRingsRecent(limit); }
    public ProgressStats getLatestStats() {
        var list = dao.fetchLatestStats();
        return list.isEmpty() ? null : list.get(0);
    }
}
