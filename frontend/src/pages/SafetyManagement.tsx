import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';
import { connectSSE } from '../utils/sse';

const SafetyManagement: React.FC = () => {
  const [risks, setRisks] = useState<any[]>([]);
  const [settlement, setSettlement] = useState<any>(null);
  const [score, setScore] = useState<number>(0);
  const [alarmTrend, setAlarmTrend] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [riskRes, setRes, scoreRes, alarmRes] = await Promise.all([
          axios.get('/api/safety/risks'),
          axios.get('/api/safety/settlement'),
          axios.get('/api/safety/score'),
          axios.get('/api/safety/alarmTrend')
        ]);
        setRisks(riskRes.data);
        setSettlement(setRes.data);
        setScore(scoreRes.data.score);
        setAlarmTrend(alarmRes.data);
      } catch (error) {
        console.error("Error fetching safety data", error);
      }
    };
    fetchData();
    const dispose = connectSSE('/api/stream/safety', {
      'safety.settlement.actual': (p: any) => {
        setSettlement((prev: any) => {
          const actual = prev?.actual ? [...prev.actual, p] : [p];
          if (actual.length > 300) actual.shift();
          return { ...(prev || { predict: [] }), actual };
        });
      },
      'safety.settlement.predict': (p: any) => {
        setSettlement((prev: any) => {
          const predict = prev?.predict ? [...prev.predict, p] : [p];
          if (predict.length > 300) predict.shift();
          return { ...(prev || { actual: [] }), predict };
        });
      },
      'safety.alarmTrend': (p: any) => {
        setAlarmTrend(prev => {
          const arr = [...prev, p];
          if (arr.length > 300) arr.shift();
          return arr;
        });
      }
    });
    return () => dispose();
  }, []);

  const lineOption = settlement ? {
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#fff' } },
    xAxis: { type: 'time', axisLabel: { color: '#ccc' } },
    yAxis: { type: 'value', axisLabel: { color: '#ccc' }, splitLine: { lineStyle: { color: '#333', type: 'dashed' } } },
    series: [
      { name: '实际沉降', type: 'line', data: settlement.actual.map((p:any)=>[p.ts,p.value]), smooth: true, itemStyle: { color: '#00f0ff' } },
      { name: 'AI预测', type: 'line', data: settlement.predict.map((p:any)=>[p.ts,p.value]), smooth: true, lineStyle: { type: 'dashed' }, itemStyle: { color: '#00ff00' } },
      { 
          name: '报警阈值', 
          type: 'line', 
          markLine: { 
              data: [{ yAxis: 25 }], 
              lineStyle: { color: 'red' },
              label: { formatter: '报警阈值 (+30mm)' }
          } 
      }
    ]
  } : {};

  const pieOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#fff' } },
    series: [
      {
        name: '风险等级',
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['40%', '50%'],
        itemStyle: { borderRadius: 5, borderColor: '#0b1120', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: 1048, name: '正常', itemStyle: { color: '#22c55e' } },
          { value: 735, name: '关注', itemStyle: { color: '#3b82f6' } },
          { value: 580, name: '预警', itemStyle: { color: '#eab308' } },
          { value: 484, name: '报警', itemStyle: { color: '#ef4444' } }
        ]
      }
    ]
  };

  const barOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'time', axisLabel: { color: '#ccc' } },
    yAxis: { type: 'value', axisLabel: { color: '#ccc' }, splitLine: { show: false } },
    series: [{
      data: alarmTrend.map(i => [i.ts, i.value]),
      type: 'bar',
      itemStyle: { color: '#eab308', borderRadius: [4, 4, 0, 0] },
      barWidth: '40%'
    }]
  };

  const gaugeOption = {
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
        itemStyle: { color: '#22c55e' }
      },
      axisLine: { lineStyle: { width: 20, color: [[1, '#333']] } },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      data: [{
        value: score,
        name: '安全评分',
        title: { offsetCenter: ['0%', '-20%'], color: '#fff' },
        detail: { valueAnimation: true, offsetCenter: ['0%', '20%'], color: '#22c55e', fontSize: 40 }
      }]
    }]
  };

  return (
    <div className="grid grid-cols-12 grid-rows-2 gap-4 h-full p-2">
      {/* Top Left: Settlement */}
      <div className="col-span-8 row-span-1 tech-card">
         <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2">地表沉降智能预测 (LightGBM模型)</h3>
         <ReactECharts option={lineOption} style={{ height: 'calc(100% - 30px)' }} />
      </div>

      {/* Top Right: Risk List */}
      <div className="col-span-4 row-span-1 tech-card overflow-auto">
         <h3 className="text-lg font-bold text-tech-blue mb-4 border-l-4 border-tech-blue pl-2">当前风险源管理</h3>
         <div className="flex flex-col gap-4">
             {risks.map((risk, idx) => (
                 <div key={idx} className="bg-red-900/20 border border-red-900/50 p-4 rounded relative overflow-hidden">
                     <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded-bl">{risk.status}</div>
                     <div className="text-red-400 font-bold mb-1">{risk.level}: {risk.name}</div>
                     <div className="text-gray-400 text-xs mb-2">环号: {risk.code || 'N/A'}</div>
                     <div className="text-gray-300 text-sm">{risk.desc}</div>
                 </div>
             ))}
             {/* Static placeholder for more content if needed */}
             <div className="bg-yellow-900/20 border border-yellow-900/50 p-4 rounded relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-yellow-600 text-white text-xs px-2 py-1 rounded-bl">待进入</div>
                  <div className="text-yellow-400 font-bold mb-1">二级风险: 侧穿桥桩</div>
                  <div className="text-gray-300 text-sm">预计 3 天后到达桥梁保护区范围。</div>
             </div>
         </div>
      </div>

      {/* Bottom Left: Risk Level */}
      <div className="col-span-4 row-span-1 tech-card">
         <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2">风险等级分布</h3>
         <ReactECharts option={pieOption} style={{ height: 'calc(100% - 30px)' }} />
      </div>

      {/* Bottom Center: Alarm Trend */}
      <div className="col-span-4 row-span-1 tech-card">
         <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2">累计报警趋势</h3>
         <ReactECharts option={barOption} style={{ height: 'calc(100% - 30px)' }} />
      </div>

      {/* Bottom Right: Score */}
      <div className="col-span-4 row-span-1 tech-card">
         <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2">本月安全评分</h3>
         <ReactECharts option={gaugeOption} style={{ height: 'calc(100% - 30px)' }} />
      </div>
    </div>
  );
};

export default SafetyManagement;
