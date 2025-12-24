package com.example.tunnel.service;

import com.example.tunnel.dao.SafetyDao;
import com.example.tunnel.model.AlarmPoint;
import com.example.tunnel.model.RiskEvent;
import com.example.tunnel.model.SettlementPoint;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SafetyService {
    private final SafetyDao safetyDao;
    public SafetyService(SafetyDao safetyDao) {
        this.safetyDao = safetyDao;
    }

    public List<SettlementPoint> getSettlementActualRecent(int limit) {
        return safetyDao.fetchSettlementActualRecent(limit);
    }

    public List<SettlementPoint> getSettlementPredictRecent(int limit) {
        return safetyDao.fetchSettlementPredictRecent(limit);
    }

    public List<AlarmPoint> getAlarmTrendRecent(int limit) {
        return safetyDao.fetchAlarmTrendRecent(limit);
    }

    public List<RiskEvent> getRisksRecent(int limit) {
        return safetyDao.fetchRisksRecent(limit);
    }
}
