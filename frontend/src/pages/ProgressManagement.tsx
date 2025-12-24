import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { connectSSE } from '../utils/sse';
import ReactECharts from 'echarts-for-react';

const ProgressManagement: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [gantt, setGantt] = useState<any[]>([]);
  const [dailyRings, setDailyRings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ganttRes, ringsRes] = await Promise.all([
            axios.get('/api/progress/stats'),
            axios.get('/api/progress/gantt'),
            axios.get('/api/progress/dailyRings')
        ]);
        setStats(statsRes.data);
        setGantt(ganttRes.data);
        setDailyRings(ringsRes.data);
      } catch (error) {
        console.error("Error fetching progress data", error);
      }
    };
    fetchData();
    const dispose = connectSSE('/api/stream/progress', {
      'progress.dailyRings': (p: any) => {
        setDailyRings(prev => {
          const arr = [...prev, p];
          if (arr.length > 300) arr.shift();
          return arr;
        });
      },
      'progress.stats': (p: any) => {
        setStats(prev => prev ? { ...prev, ...p } : p);
      }
    });
    return () => dispose();
  }, []);
  

  return (
    <div className="flex flex-col h-full gap-4 p-2">
      {/* Top Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="tech-card">
           <div className="text-gray-400 text-sm mb-1">累计掘进环数</div>
           <div className="flex items-baseline gap-2">
               <span className="text-3xl font-bold text-white">{stats?.totalRings}</span>
               <span className="text-gray-500 text-sm">/ {stats?.totalGoal}</span>
           </div>
           <div className="w-full bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
               <div className="bg-tech-blue h-full rounded-full" style={{ width: `${(stats?.totalRings / stats?.totalGoal) * 100}%` }}></div>
           </div>
        </div>
        <div className="tech-card">
           <div className="text-gray-400 text-sm mb-1">今日掘进环数</div>
           <div className="text-3xl font-bold text-green-400">{stats?.dailyRings} <span className="text-sm text-gray-500">环</span></div>
        </div>
        <div className="tech-card">
           <div className="text-gray-400 text-sm mb-1">剩余工期预测</div>
           <div className="text-3xl font-bold text-yellow-400">{stats?.remainingDays} <span className="text-sm text-gray-500">天</span></div>
        </div>
        <div className="tech-card">
           <div className="text-gray-400 text-sm mb-1">产值统计 (万元)</div>
           <div className="text-3xl font-bold text-blue-400">{stats?.value?.toLocaleString()}</div>
        </div>
      </div>

      {/* Gantt Chart Area */}
      <div className="flex-1 tech-card flex flex-col">
         <h3 className="text-lg font-bold text-tech-blue mb-6 border-l-4 border-tech-blue pl-2">工程进度甘特图 (Gantt)</h3>
         
         <div className="flex-1 overflow-auto relative">
             {/* Header */}
             <div className="flex border-b border-gray-700 pb-2 mb-4 text-gray-400 text-sm sticky top-0 bg-[#0f172a] z-10">
                 <div className="w-48 pl-4">任务名称</div>
                 <div className="flex-1 grid grid-cols-5 text-center">
                     <div>10月</div>
                     <div>11月</div>
                     <div>12月</div>
                     <div>1月</div>
                     <div>2月</div>
                 </div>
             </div>

             {/* Rows */}
             <div className="flex flex-col gap-6">
                 {gantt.map((task, idx) => {
                     // Calculate mock position/width based on dates or just index for demo
                     // In real app, calculate diff between start/end and map to pixels
                     // Here I'll use fixed percentages for visual demo based on the screenshots
                     const getStyle = (idx: number) => {
                         switch(idx) {
                             case 0: return { left: '0%', width: '20%', color: 'bg-green-500' };
                             case 1: return { left: '25%', width: '15%', color: 'bg-green-500' };
                             case 2: return { left: '25%', width: '60%', color: 'bg-blue-600' };
                             case 3: return { left: '40%', width: '50%', color: 'bg-cyan-500' };
                             case 4: return { left: '60%', width: '20%', color: 'bg-gray-600' };
                             default: return { left: '0%', width: '10%', color: 'bg-gray-500' };
                         }
                     };
                     const style = getStyle(idx);

                     return (
                         <div key={idx} className="flex items-center hover:bg-white/5 py-2 transition-colors">
                             <div className="w-48 pl-4 text-gray-300 font-medium">{task.name}</div>
                             <div className="flex-1 relative h-8 bg-gray-800/50 rounded-sm mx-4">
                                 <div 
                                    className={`absolute top-1 bottom-1 rounded ${style.color} flex items-center justify-center text-xs text-white font-bold shadow-lg`}
                                    style={{ left: style.left, width: style.width }}
                                 >
                                     {task.progress === 100 ? '完成 100%' : 
                                      task.progress === 0 ? '未开始' : 
                                      `进行中 ${task.progress}%`}
                                 </div>
                             </div>
                         </div>
                     );
                 })}
             </div>
         </div>
      </div>
      <div className="tech-card">
         <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2">每日掘进环数</h3>
         <div>
           <ReactECharts option={{
             grid: { top: 20, bottom: 20, left: 40, right: 20 },
             xAxis: { type: 'time', axisLabel: { color: '#bbb' } },
             yAxis: { type: 'value', axisLabel: { color: '#bbb' } },
             series: [{ type: 'bar', data: dailyRings.map(p => [p.ts, p.value]), itemStyle: { color: '#3b82f6', borderRadius: [4,4,0,0] }, barWidth: '50%' }]
           }} style={{ height: '220px' }} />
         </div>
      </div>
    </div>
  );
};

export default ProgressManagement;
