import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';
import { connectSSE } from '../utils/sse';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface PersonnelStats {
  totalOnSite: number;
  attendanceRate: string;
  violations: number;
  managers: number;
}

const PersonnelManagement: React.FC = () => {
  const [stats, setStats] = useState<PersonnelStats | null>(null);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [list, setList] = useState<any[]>([]);
  const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, distRes, listRes, trendRes] = await Promise.all([
          axios.get('/api/personnel/stats'),
          axios.get('/api/personnel/distribution'),
          axios.get('/api/personnel/list'),
          axios.get('/api/personnel/attendanceTrend')
        ]);
        setStats(statsRes.data);
        setDistribution(distRes.data);
        setList(listRes.data);
        setAttendanceTrend(trendRes.data);
      } catch (error) {
        console.error("Error fetching personnel data", error);
      }
    };
    fetchData();
    const dispose = connectSSE('/api/stream/personnel', {
      'personnel.attendanceTrend': (p: any) => {
        setAttendanceTrend(prev => {
          const arr = [...prev, p];
          if (arr.length > 300) arr.shift();
          return arr;
        });
      },
      'personnel.stats': (p: any) => {
        setStats(prev => prev ? { ...prev, ...p } : p);
      }
    });
    return () => dispose();
  }, []);

  const donutOption = {
    tooltip: { trigger: 'item' },
    legend: { top: '5%', left: 'center', textStyle: { color: '#fff' } },
    series: [
      {
        name: '班组分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#0b1120',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold', color: '#fff' }
        },
        labelLine: { show: false },
        data: distribution
      }
    ]
  };

  const columns: ColumnsType<any> = [
    { title: '工号', dataIndex: 'id', key: 'id', render: (text) => <span className="text-gray-300">{text}</span> },
    { title: '姓名', dataIndex: 'name', key: 'name', render: (text) => <span className="text-white font-bold">{text}</span> },
    { title: '班组', dataIndex: 'team', key: 'team', render: (text) => <span className="text-cyan-300">{text}</span> },
    { title: '位置', dataIndex: 'location', key: 'location', render: (text) => <span className="text-blue-300">{text}</span> },
    { title: '进入时间', dataIndex: 'time', key: 'time', render: (text) => <span className="font-mono text-gray-400">{text}</span> },
    { title: '体温', dataIndex: 'temp', key: 'temp', render: (text) => <span className="text-green-400">{text}</span> },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (text) => <span className="bg-green-900/50 text-green-300 px-2 py-0.5 rounded border border-green-700 text-xs">{text}</span>
    },
  ];

  return (
    <div className="flex flex-col h-full gap-4 p-2">
      {/* Top Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="tech-card flex items-center gap-4">
           <div className="p-4 bg-blue-600/20 rounded-full text-blue-400 text-2xl">👥</div>
           <div>
              <div className="text-gray-400 text-sm">在场总人数</div>
              <div className="text-3xl font-bold text-white">{stats?.totalOnSite}</div>
           </div>
        </div>
        <div className="tech-card flex items-center gap-4">
           <div className="p-4 bg-green-600/20 rounded-full text-green-400 text-2xl">📊</div>
           <div>
              <div className="text-gray-400 text-sm">今日出勤率</div>
              <div className="text-3xl font-bold text-white">{stats?.attendanceRate}</div>
           </div>
        </div>
        <div className="tech-card flex items-center gap-4">
           <div className="p-4 bg-yellow-600/20 rounded-full text-yellow-400 text-2xl">⚠️</div>
           <div>
              <div className="text-gray-400 text-sm">违规行为</div>
              <div className="text-3xl font-bold text-white">{stats?.violations}</div>
           </div>
        </div>
        <div className="tech-card flex items-center gap-4">
           <div className="p-4 bg-purple-600/20 rounded-full text-purple-400 text-2xl">👔</div>
           <div>
              <div className="text-gray-400 text-sm">管理人员</div>
              <div className="text-3xl font-bold text-white">{stats?.managers}</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Left Chart */}
        <div className="col-span-4 tech-card">
           <h3 className="text-lg font-bold text-tech-blue mb-4 border-l-4 border-tech-blue pl-2">班组分布</h3>
           <ReactECharts option={donutOption} style={{ height: '100%' }} />
        </div>

        {/* Right Table */}
        <div className="col-span-8 tech-card overflow-hidden flex flex-col">
           <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-tech-blue border-l-4 border-tech-blue pl-2">实时进出记录</h3>
               <input type="text" placeholder="搜索人员..." className="bg-black/30 border border-blue-800 text白 px-3 py-1 rounded text-sm focus:outline-none focus:border-cyan-500" />
           </div>
           <div className="flex-1 overflow-auto custom-table">
               <Table 
                 dataSource={list} 
                 columns={columns} 
                 pagination={false} 
                 rowKey="id"
                 rowClassName={() => "bg-transparent hover:bg-white/5 border-b border-gray-800"}
                 className="ant-table-dark"
               />
           </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 tech-card">
          <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2">在场人数（小时级）</h3>
          <ReactECharts option={{
            grid: { top: 20, bottom: 20, left: 40, right: 20 },
            xAxis: { type: 'time', axisLabel: { color: '#bbb' } },
            yAxis: { type: 'value', axisLabel: { color: '#bbb' } },
            series: [{ type: 'line', smooth: true, data: attendanceTrend.map(p => [p.ts, p.value]), itemStyle: { color: '#00f0ff' } }]
          }} style={{ height: '220px' }} />
        </div>
      </div>
    </div>
  );
};

export default PersonnelManagement;
