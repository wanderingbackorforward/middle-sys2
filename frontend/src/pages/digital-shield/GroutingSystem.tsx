import React from 'react';
import ReactECharts from 'echarts-for-react';

const GroutingSystem: React.FC = () => {
  // Common chart options base
  const commonGrid = {
    top: '15%',
    bottom: '10%',
    left: '10%',
    right: '5%',
    containLabel: true
  };

  const commonAxis = {
    axisLine: { lineStyle: { color: '#1e3a8a' } },
    axisLabel: { color: '#94a3b8', fontSize: 10 },
    splitLine: { lineStyle: { color: '#1e3a8a', type: 'dashed' as const, opacity: 0.3 } }
  };

  // 1. Segment Floating Chart Option
  const getFloatingOption = () => {
    const rings = Array.from({ length: 11 }, (_, i) => 4194 + i);
    const values = [15, 15, 14.5, 13.4, 11.2, 8.7, 6.2, 2.6, 3.3, 2.6, 2.0];
    
    return {
      tooltip: { trigger: 'axis' },
      grid: { ...commonGrid, top: '20%', bottom: '5%' },
      xAxis: {
        type: 'category',
        data: rings,
        ...commonAxis,
        axisLabel: { ...commonAxis.axisLabel, interval: 0, rotate: 0 }
      },
      yAxis: {
        type: 'value',
        name: '上浮量(mm)',
        min: -200,
        max: 200,
        ...commonAxis,
        splitLine: { show: true, lineStyle: { color: '#1e3a8a', opacity: 0.2 } }
      },
      series: [
        {
          data: values,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#06b6d4' },
          lineStyle: { width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(6,182,212,0.3)' },
                { offset: 1, color: 'rgba(6,182,212,0.01)' }
              ]
            }
          },
          markPoint: {
            data: values.map((v, i) => ({
                coord: [i, v],
                value: v + 'mm',
                label: { position: 'top', color: '#fff', fontSize: 10 }
            })),
            symbol: 'circle',
            symbolSize: 1
          }
        }
      ]
    };
  };

  // 2. Grouting Chart Option (Bottom Left)
  const getGroutingOption = () => {
    return {
      title: { text: '同步注浆压力', textStyle: { color: '#fff', fontSize: 12 }, left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['实际', '设定'], textStyle: { color: '#ccc', fontSize: 10 }, top: 20 },
      grid: { ...commonGrid, top: '35%', bottom: '5%' },
      xAxis: { type: 'category', data: ['4205','4206','4207','4208','4209','4210','4211','4212','4213'], show: false },
      yAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false } }, // Minimal style
      series: [
        { name: '实际', type: 'line', smooth: true, data: [12, 14, 11, 15, 18, 16, 20, 18, 15], itemStyle: { color: '#06b6d4' } },
        { name: '设定', type: 'line', smooth: true, data: [10, 10, 10, 10, 10, 10, 10, 10, 10], itemStyle: { color: '#84cc16' }, lineStyle: { type: 'dashed' } }
      ]
    };
  };

  // 3. Settlement Chart Option (Bottom Right)
  const getSettlementOption = () => {
    return {
      title: { text: '地面沉降监测', textStyle: { color: '#fff', fontSize: 12 }, left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['实际', '设定'], textStyle: { color: '#ccc', fontSize: 10 }, top: 20 },
      grid: { ...commonGrid, top: '35%', bottom: '5%' },
      xAxis: { type: 'category', data: ['4205','4206','4207','4208','4209','4210','4211','4212','4213'], show: false },
      yAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false } },
      series: [
        { name: '实际', type: 'line', smooth: true, data: [-2, -5, -3, -8, -4, -2, -5, -3, -2], itemStyle: { color: '#06b6d4' } },
        { name: '设定', type: 'line', smooth: true, data: [-10, -10, -10, -10, -10, -10, -10, -10, -10], itemStyle: { color: '#84cc16' }, lineStyle: { type: 'dashed' } }
      ]
    };
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top: Segment Floating */}
      <div className="flex-1 tech-card flex flex-col p-2">
         <h3 className="text-lg font-bold text-tech-blue mb-1 border-l-4 border-tech-blue pl-2 tracking-wider">管片上浮</h3>
         <div className="flex-1 min-h-0">
             <ReactECharts option={getFloatingOption()} style={{ height: '100%', width: '100%' }} />
         </div>
      </div>

      {/* Bottom: Grouting & Settlement */}
      <div className="flex-1 tech-card flex flex-col p-2">
         <h3 className="text-lg font-bold text-tech-blue mb-1 border-l-4 border-tech-blue pl-2 tracking-wider">注浆/沉降记录</h3>
         <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
             <div className="bg-black/20 rounded p-1 relative">
                <ReactECharts option={getGroutingOption()} style={{ height: '100%', width: '100%' }} />
                {/* Axis Labels Overlay (Simulated for aesthetics) */}
                <div className="absolute bottom-1 left-2 text-[10px] text-gray-500 font-mono">302/10 4205...</div>
             </div>
             <div className="bg-black/20 rounded p-1 relative">
                <ReactECharts option={getSettlementOption()} style={{ height: '100%', width: '100%' }} />
                <div className="absolute bottom-1 left-2 text-[10px] text-gray-500 font-mono">302/14 4205...</div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default GroutingSystem;
