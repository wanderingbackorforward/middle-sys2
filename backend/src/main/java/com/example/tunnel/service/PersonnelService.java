package com.example.tunnel.service;

import com.example.tunnel.dao.PersonnelDao;
import com.example.tunnel.model.AttendancePoint;
import com.example.tunnel.model.PersonnelStats;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PersonnelService {
    private final PersonnelDao dao;
    public PersonnelService(PersonnelDao dao) { this.dao = dao; }
    public List<AttendancePoint> getAttendanceTrendRecent(int limit) { return dao.fetchAttendanceTrendRecent(limit); }
    public PersonnelStats getLatestStats() {
        var list = dao.fetchLatestStats();
        return list.isEmpty() ? null : list.get(0);
    }
}
