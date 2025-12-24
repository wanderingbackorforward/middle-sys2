import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';
import { connectSSE } from '../utils/sse';

interface DashboardSummary {
  projectName: string;
  lat: number;
  lng: number;
  cameraOnline: number;
  cameraTotal: number;
  ringToday: number;
  ringCumulative: number;
  muckToday: number;
  slurryPressureAvg: number;
  gasAlerts: number;
}

const SafetyDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [supplies, setSupplies] = useState<any>(null);
  const [dispatch, setDispatch] = useState<any[]>([]);
  const [ts, setTs] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, notifRes, supRes, dispRes, tsRes] = await Promise.all([
          axios.get('/api/dashboard/summary'),
          axios.get('/api/dashboard/notifications'),
          axios.get('/api/dashboard/supplies'),
          axios.get('/api/dashboard/dispatch'),
          axios.get('/api/dashboard/timeseries')
        ]);
        setSummary(sumRes.data);
        setNotifications(notifRes.data);
        setSupplies(supRes.data);
        setDispatch(dispRes.data);
        setTs(tsRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };
    fetchData();
    const dispose = connectSSE('/api/stream/dashboard', {
      'dashboard.advanceSpeed': (p: any) => {
        setTs((prev: any) => {
          const arr = [...(prev.advanceSpeed || []), p];
          if (arr.length > 300) arr.shift();
          return { ...prev, advanceSpeed: arr };
        });
      },
      'dashboard.slurryPressure': (p: any) => {
        setTs((prev: any) => {
          const arr = [...(prev.slurryPressure || []), p];
          if (arr.length > 300) arr.shift();
          return { ...prev, slurryPressure: arr };
        });
      },
      'dashboard.gasConcentration': (p: any) => {
        setTs((prev: any) => {
          const arr = [...(prev.gasConcentration || []), p];
          if (arr.length > 300) arr.shift();
          return { ...prev, gasConcentration: arr };
        });
      },
      'dashboard.summary': (p: any) => {
        setSummary((prev) => prev ? { ...prev, ...p } : prev);
      }
    });
    return () => dispose();
  }, []);

  const gaugeOption = summary ? {
    series: [{
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      pointer: { show: false },
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: { borderWidth: 1, borderColor: '#464646' }
      },
      axisLine: { lineStyle: { width: 40 } },
      splitLine: { show: false, distance: 0, length: 10 },
      axisTick: { show: false },
      axisLabel: { show: false, distance: 50 },
      data: [{
        value: Math.round((summary.cameraOnline / summary.cameraTotal) * 100),
        name: '监控覆盖率',
        title: { offsetCenter: ['0%', '-20%'] },
        detail: { valueAnimation: true, offsetCenter: ['0%', '20%'] }
      }],
      title: { fontSize: 14, color: '#fff' },
      detail: { width: 50, height: 14, fontSize: 30, color: '#00f0ff', formatter: '{value}%' }
    }]
  } : {};

  const barOption = supplies ? {
    grid: { top: 20, bottom: 20, left: 40, right: 10 },
    xAxis: {
      type: 'category',
      data: Object.keys(supplies),
      axisLabel: { color: '#fff' },
      axisLine: { lineStyle: { color: '#333' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#fff' },
      splitLine: { lineStyle: { color: '#333', type: 'dashed' } }
    },
    series: [{
      data: Object.values(supplies),
      type: 'bar',
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: '#00f0ff' }, { offset: 1, color: '#0066ff' }]
        },
        borderRadius: [5, 5, 0, 0]
      }
    }]
  } : {};

  const advanceOption = ts.advanceSpeed ? {
    grid: { top: 20, bottom: 20, left: 40, right: 20 },
    xAxis: { type: 'time', axisLabel: { color: '#bbb' } },
    yAxis: { type: 'value', axisLabel: { color: '#bbb' } },
    series: [{ type: 'line', smooth: true, data: ts.advanceSpeed.map((p: any) => [p.ts, p.value]), itemStyle: { color: '#00f0ff' } }]
  } : {};

  const slurryOption = ts.slurryPressure ? {
    grid: { top: 20, bottom: 20, left: 40, right: 20 },
    xAxis: { type: 'time', axisLabel: { color: '#bbb' } },
    yAxis: { type: 'value', axisLabel: { color: '#bbb' } },
    series: [{ type: 'line', smooth: true, data: ts.slurryPressure.map((p: any) => [p.ts, p.value]), itemStyle: { color: '#22c55e' } }]
  } : {};

  return (
    <div className="grid grid-cols-12 gap-4 h-full p-2">
      {/* Left Column */}
      <div className="col-span-3 flex flex-col gap-4">
        {/* Tunnel KPIs */}
        <div className="tech-card flex-1">
          <h3 className="text-lg font-bold text-tech-blue mb-4 border-l-4 border-tech-blue pl-2">施工数据</h3>
          <div className="flex gap-4">
            <div className="flex-1 bg-blue-900/30 p-4 rounded border border-blue-800">
              <div className="text-gray-400 text-sm mb-1">今日掘进环数</div>
              <div className="text-2xl font-bold text-cyan-400">{summary?.ringToday || 0} <span className="text-xs text-gray-500">环</span></div>
            </div>
            <div className="flex-1 bg-blue-900/30 p-4 rounded border border-blue-800">
              <div className="text-gray-400 text-sm mb-1">累计掘进环数</div>
              <div className="text-2xl font-bold text-green-400">{summary?.ringCumulative || 0}</div>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex-1 bg-blue-900/30 p-4 rounded border border-blue-800">
              <div className="text-gray-400 text-sm mb-1">今日渣土量</div>
              <div className="text-2xl font-bold text-yellow-400">{summary?.muckToday || 0} <span className="text-xs text-gray-500">m³</span></div>
            </div>
            <div className="flex-1 bg-blue-900/30 p-4 rounded border border-blue-800">
              <div className="text-gray-400 text-sm mb-1">平均注浆压力</div>
              <div className="text-2xl font-bold text-blue-400">{summary?.slurryPressureAvg || 0} <span className="text-xs text-gray-500">MPa</span></div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="tech-card flex-[1.5] overflow-hidden">
          <h3 className="text-lg font-bold text-tech-blue mb-4 border-l-4 border-tech-blue pl-2">实时通告 REAL-TIME</h3>
          <div className="flex flex-col gap-2">
            {notifications.map((item, idx) => (
              <div key={idx} className="flex items-center text-sm p-2 hover:bg-white/5 transition-colors border-b border-gray-800">
                <span className="text-gray-500 w-12 font-mono">{item.time}</span>
                <span className={`px-1 text-xs rounded mr-2 border ${
                  item.type === '交通' ? 'border-blue-500 text-blue-400' :
                  item.type === '消防' ? 'border-red-500 text-red-400' :
                  'border-yellow-500 text-yellow-400'
                }`}>{item.type}</span>
                <span className="text-gray-300 truncate flex-1">{item.content}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Column */}
      <div className="col-span-6 flex flex-col gap-4">
        <div className="tech-card flex-1 relative overflow-hidden p-0 group">
          {/* Map Placeholder - In real app use React-Leaflet or Amap */}
          <div className="absolute inset-0 bg-blue-900/20 z-0">
             <img src="https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/119.4070,32.3942,13,0/800x600?access_token=YOUR_TOKEN" 
                  alt="Map" 
                  className="w-full h-full object-cover opacity-60 grayscale"
                  onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png';
                      (e.target as HTMLImageElement).style.filter = 'invert(1) hue-rotate(180deg) brightness(0.5)';
                  }}
             />
          </div>
          
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur border border-cyan-500 p-4 rounded z-10">
            <div className="text-xs text-gray-400">项目名称</div>
            <div className="text-xl font-bold text-white">{summary?.projectName || '加载中...'}</div>
          </div>

          {/* Event Detail Popup */}
          <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur border border-blue-500/50 p-4 rounded z-10 flex gap-4">
             <div className="w-1/3">
                 <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop" className="w-full h-24 object-cover rounded border border-gray-600" />
             </div>
             <div className="flex-1">
                 <div className="flex justify-between items-start mb-2">
                     <div className="text-cyan-400 font-bold">事件详情</div>
                     <div className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">类别: 交通</div>
                 </div>
                 <div className="text-gray-300 text-sm leading-relaxed">
                     2022-06-02 19:27 上海路与长宁路交叉口发生车辆剐蹭，导致道路拥堵，共占据3车道造成拥堵。已派遣交通警察第三大队前往处理。
                 </div>
                 <div className="flex gap-2 mt-2">
                     <button className="bg-cyan-600/50 hover:bg-cyan-600 text-cyan-100 text-xs px-3 py-1 rounded border border-cyan-500 transition-colors">查看监控</button>
                     <button className="bg-blue-600/50 hover:bg-blue-600 text-blue-100 text-xs px-3 py-1 rounded border border-blue-500 transition-colors">生成工单</button>
                 </div>
             </div>
          </div>
        </div>
        <div className="tech-card h-48">
          <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2">掘进速度（环/小时）</h3>
          <ReactECharts option={advanceOption} style={{ height: '160px' }} />
        </div>
        <div className="tech-card h-48">
          <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2">注浆压力（MPa）</h3>
          <ReactECharts option={slurryOption} style={{ height: '160px' }} />
        </div>
      </div>

      {/* Right Column */}
      <div className="col-span-3 flex flex-col gap-4">
        {/* Monitoring Coverage */}
        <div className="tech-card h-48">
          <div className="flex justify-between items-center mb-2">
             <h3 className="text-lg font-bold text-tech-blue border-l-4 border-tech-blue pl-2">监控覆盖率</h3>
             <div className="text-right">
                 <div className="text-xs text-green-400">● 摄像头在线: {summary?.cameraOnline}</div>
                 <div className="text-xs text-gray-400">● 摄像头总数: {summary?.cameraTotal}</div>
             </div>
          </div>
          <ReactECharts option={gaugeOption} style={{ height: '140px' }} />
        </div>

        {/* Emergency Supplies */}
        <div className="tech-card flex-1">
          <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2">应急物资管理</h3>
          <ReactECharts option={barOption} style={{ height: '200px' }} />
        </div>

        {/* Real-time Dispatch */}
        <div className="tech-card flex-1">
          <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2">实时应急调度</h3>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700">
                <th className="py-2">时间</th>
                <th>类别</th>
                <th>单位</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {dispatch.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-800/50 hover:bg-white/5">
                  <td className="py-2 text-gray-300">{item.time}</td>
                  <td className="text-gray-300">{item.type}</td>
                  <td className="text-gray-300">{item.unit}</td>
                  <td className={
                    item.status === '处理中' ? 'text-blue-400' :
                    item.status === '待处理' ? 'text-red-400' : 'text-green-400'
                  }>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SafetyDashboard;
