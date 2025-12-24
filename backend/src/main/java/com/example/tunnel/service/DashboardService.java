package com.example.tunnel.service;

import com.example.tunnel.dao.DashboardDao;
import com.example.tunnel.model.AdvanceSpeedPoint;
import com.example.tunnel.model.SlurryPressurePoint;
import com.example.tunnel.model.GasConcentrationPoint;
import com.example.tunnel.model.DashboardSummary;
import com.example.tunnel.model.NotificationItem;
import com.example.tunnel.model.SupplyItem;
import com.example.tunnel.model.DispatchItem;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DashboardService {
    private final DashboardDao dao;
    public DashboardService(DashboardDao dao) { this.dao = dao; }
    public List<AdvanceSpeedPoint> getAdvanceSpeedRecent(int limit) { return dao.fetchAdvanceSpeedRecent(limit); }
    public List<SlurryPressurePoint> getSlurryPressureRecent(int limit) { return dao.fetchSlurryPressureRecent(limit); }
    public List<GasConcentrationPoint> getGasConcentrationRecent(int limit) { return dao.fetchGasConcentrationRecent(limit); }
    public DashboardSummary getLatestSummary() {
        var list = dao.fetchSummaryLatest();
        return list.isEmpty() ? null : list.get(0);
    }
    public List<NotificationItem> getNotificationsRecent(int limit) { return dao.fetchNotificationsRecent(limit); }
    public List<SupplyItem> getSuppliesAll() { return dao.fetchSuppliesAll(); }
    public List<DispatchItem> getDispatchRecent(int limit) { return dao.fetchDispatchRecent(limit); }
}
