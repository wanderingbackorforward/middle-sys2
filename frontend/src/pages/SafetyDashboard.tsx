import { useEffect, useState } from 'react';
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

const SafetyDashboard = () => {
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
        const sum = sumRes.data || {
          projectName: '江苏扬州地铁盾构隧道工程',
          lat: 32.3942,
          lng: 119.407,
          cameraOnline: 12,
          cameraTotal: 16,
          ringToday: 12,
          ringCumulative: 1978,
          muckToday: 252.9,
          slurryPressureAvg: 0.43,
          gasAlerts: 0
        };
        const notif = Array.isArray(notifRes.data) && notifRes.data.length > 0 ? notifRes.data : [
          { time: '19:27', type: '交通', content: '上海路与长宁路交叉口发生车辆剐蹭，造成拥堵，已派员处理' },
          { time: '19:35', type: '消防', content: '管片拼装区进行安全巡检，未发现异常' },
          { time: '19:45', type: '通知', content: '注浆站完成例检，设备状态良好' }
        ];
        const sup = supRes.data && Object.keys(supRes.data || {}).length > 0 ? supRes.data : {
          水泥: 120, 砂石: 200, 钢筋: 80, 燃料: 60
        };
        const disp = Array.isArray(dispRes.data) && dispRes.data.length > 0 ? dispRes.data : [
          { time: '19:27', type: '人员', unit: '注浆班', status: '到岗' },
          { time: '19:45', type: '车辆', unit: '物资运输', status: '出发' },
          { time: '20:05', type: '人员', unit: '巡检队', status: '处理中' }
        ];
        const series = tsRes.data || {
          advanceSpeed: Array.from({ length: 24 }, (_, i) => ({ ts: new Date(Date.now() - (23 - i) * 3600000).toISOString(), value: 6 + (i % 5) })),
          slurryPressure: Array.from({ length: 24 }, (_, i) => ({ ts: new Date(Date.now() - (23 - i) * 3600000).toISOString(), value: 0.3 + (i % 4) * 0.03 })),
          gasConcentration: Array.from({ length: 24 }, (_, i) => ({ ts: new Date(Date.now() - (23 - i) * 3600000).toISOString(), value: 0.1 + (i % 3) * 0.02 }))
        };
        setSummary(sum);
        setNotifications(notif);
        setSupplies(sup);
        setDispatch(disp);
        setTs(series);
      } catch (error) {
        const sum = {
          projectName: '江苏扬州地铁盾构隧道工程',
          lat: 32.3942,
          lng: 119.407,
          cameraOnline: 12,
          cameraTotal: 16,
          ringToday: 12,
          ringCumulative: 1978,
          muckToday: 252.9,
          slurryPressureAvg: 0.43,
          gasAlerts: 0
        };
        const notif = [
          { time: '19:27', type: '交通', content: '上海路与长宁路交叉口发生车辆剐蹭，造成拥堵，已派员处理' },
          { time: '19:35', type: '消防', content: '管片拼装区进行安全巡检，未发现异常' },
          { time: '19:45', type: '通知', content: '注浆站完成例检，设备状态良好' }
        ];
        const sup = { 水泥: 120, 砂石: 200, 钢筋: 80, 燃料: 60 };
        const disp = [
          { time: '19:27', type: '人员', unit: '注浆班', status: '到岗' },
          { time: '19:45', type: '车辆', unit: '物资运输', status: '出发' },
          { time: '20:05', type: '人员', unit: '巡检队', status: '处理中' }
        ];
        const series = {
          advanceSpeed: Array.from({ length: 24 }, (_, i) => ({ ts: new Date(Date.now() - (23 - i) * 3600000).toISOString(), value: 6 + (i % 5) })),
          slurryPressure: Array.from({ length: 24 }, (_, i) => ({ ts: new Date(Date.now() - (23 - i) * 3600000).toISOString(), value: 0.3 + (i % 4) * 0.03 })),
          gasConcentration: Array.from({ length: 24 }, (_, i) => ({ ts: new Date(Date.now() - (23 - i) * 3600000).toISOString(), value: 0.1 + (i % 3) * 0.02 }))
        };
        setSummary(sum);
        setNotifications(notif);
        setSupplies(sup);
        setDispatch(disp);
        setTs(series);
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
          <iframe
            src="/yangzhou-railway-command-center.html"
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none' }}
            title="扬州铁路指挥中心"
          />
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
