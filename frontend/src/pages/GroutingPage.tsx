import ReactECharts from 'echarts-for-react';

// --- Sub-Components ---

// 1. Grouting Simulation (Left Top)
const GroutingSimulation = () => {
  // Mock data for 8 holes
  const holes = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    volume: (Math.random() * 5 + 1).toFixed(2),
    volA: (Math.random() * 2 + 0.5).toFixed(2),
    volB: (Math.random() * 2 + 0.5).toFixed(2),
    pressure: (Math.random() * 5 + 5).toFixed(1),
    flow: (Math.random() * 50 + 50).toFixed(0),
  }));

  return (
    <div className="flex-1 tech-card relative p-4 flex flex-col">
      <h3 className="text-lg font-bold text-tech-blue mb-4 border-l-4 border-tech-blue pl-2 tracking-wider">注浆模拟</h3>
      
      <div className="flex-1 relative flex items-center justify-center">
        {/* Central Ring */}
        <div className="relative w-64 h-64 flex items-center justify-center z-10">
           {/* Outer Glow Ring */}
           <div className="absolute inset-0 rounded-full border-[8px] border-gray-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]"></div>
           {/* Progress Ring (Mock) */}
           <div className="absolute inset-0 rounded-full border-[8px] border-cyan-500/30 border-t-cyan-500 rotate-45"></div>
           
           {/* Inner Content */}
           <div className="flex flex-col items-center justify-center text-center z-20">
              <span className="text-gray-400 text-sm">注浆总量累积(m³)</span>
              <span className="text-4xl font-bold text-white mt-1 drop-shadow-[0_0_10px_#06b6d4]">20.00</span>
              <div className="mt-2 flex gap-4 text-xs">
                 <div className="flex flex-col">
                    <span className="text-cyan-400">A液注浆量(m³)</span>
                    <span className="text-white font-bold text-lg">18.80</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-yellow-400">B液注浆量(m³)</span>
                    <span className="text-white font-bold text-lg">1.20</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Surrounding Cards */}
        {/* We position them absolutely around the center. 
            For simplicity in this responsive layout, we can use a grid around the center or fixed positions.
            Given the complexity, let's use a 3-column grid where the center takes the middle.
        */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-4 pointer-events-none">
           {/* Top Row */}
           <div className="col-start-1 row-start-1 flex justify-center items-end p-2"><HoleCard data={holes[7]} /></div> {/* 8号 */}
           <div className="col-start-2 row-start-1 flex justify-center items-start pt-2"><HoleCard data={holes[0]} /></div>  {/* 1号 */}
           <div className="col-start-3 row-start-1 flex justify-center items-end p-2"><HoleCard data={holes[1]} /></div> {/* 2号 */}
           
           {/* Middle Row */}
           <div className="col-start-1 row-start-2 flex justify-start items-center pl-2"><HoleCard data={holes[6]} /></div> {/* 7号 */}
           {/* Center is empty for the ring */}
           <div className="col-start-3 row-start-2 flex justify-end items-center pr-2"><HoleCard data={holes[2]} /></div>   {/* 3号 */}

           {/* Bottom Row */}
           <div className="col-start-1 row-start-3 flex justify-center items-start p-2"><HoleCard data={holes[5]} /></div> {/* 6号 */}
           <div className="col-start-2 row-start-3 flex justify-center items-end pb-2"><HoleCard data={holes[4]} /></div>  {/* 5号 */}
           <div className="col-start-3 row-start-3 flex justify-center items-start p-2"><HoleCard data={holes[3]} /></div> {/* 4号 */}
        </div>
      </div>
    </div>
  );
};

const HoleCard = ({ data }: { data: any }) => (
  <div className="pointer-events-auto bg-[#0b1525]/90 border border-blue-800/50 p-2 rounded shadow-[0_0_10px_rgba(6,182,212,0.1)] w-40 text-[10px] transform scale-90 hover:scale-100 transition-transform z-20 backdrop-blur-sm">
     <div className="flex justify-between items-center mb-1 border-b border-blue-900 pb-1">
        <span className="font-bold text-cyan-400">{data.id}号注浆量(m³) {data.volume}</span>
     </div>
     <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        <span className="text-gray-400">A液: <span className="text-white">{data.volA}</span></span>
        <span className="text-gray-400">B液: <span className="text-white">{data.volB}</span></span>
        <span className="text-gray-400">压力: <span className="text-white">{data.pressure}</span></span>
        <span className="text-gray-400">流量: <span className="text-white">{data.flow}</span></span>
     </div>
  </div>
);

// 2. Diagrams (Left Bottom)
const DiagramSection = () => {
    return (
        <div className="h-64 grid grid-cols-2 gap-4">
            {/* Real-time Dual Liquid Status */}
            <div className="tech-card p-2 flex flex-col">
                <h3 className="text-sm font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2">实时双液状态</h3>
                <div className="flex-1 relative bg-black/20 rounded flex items-center justify-center overflow-hidden">
                    {/* Simplified SVG Schematic */}
                    <svg viewBox="0 0 300 150" className="w-full h-full">
                        {/* Pipes */}
                        <path d="M20 40 L100 40 L120 60 L200 60" fill="none" stroke="#06b6d4" strokeWidth="6" />
                        <path d="M20 110 L100 110 L120 90 L200 90" fill="none" stroke="#eab308" strokeWidth="6" />
                        {/* Mixer */}
                        <rect x="200" y="50" width="60" height="50" fill="#334155" stroke="#94a3b8" />
                        {/* Output */}
                        <path d="M260 75 L290 75" fill="none" stroke="#22c55e" strokeWidth="8" />
                        {/* Labels */}
                        <text x="30" y="30" fill="#06b6d4" fontSize="12">A液</text>
                        <text x="30" y="130" fill="#eab308" fontSize="12">B液</text>
                        <text x="210" y="80" fill="white" fontSize="10">混合器</text>
                    </svg>
                    <div className="absolute bottom-2 left-2 flex gap-2">
                         <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">双液</span>
                    </div>
                </div>
            </div>

            {/* Tail Grouting */}
            <div className="tech-card p-2 flex flex-col">
                <h3 className="text-sm font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2">盾尾土</h3>
                 <div className="flex-1 relative bg-black/20 rounded flex items-center justify-center">
                    {/* Simple Schematic */}
                    <svg viewBox="0 0 300 150" className="w-full h-full">
                         {/* Ground */}
                         <rect x="0" y="0" width="300" height="150" fill="#1e293b" opacity="0.3" />
                         {/* Shield Tail */}
                         <path d="M50 20 L50 130 L150 130 L150 20 Z" fill="#334155" />
                         {/* Grout Injection */}
                         <path d="M150 40 L250 40 Q280 40 280 75 Q280 110 250 110 L150 110" fill="#06b6d4" opacity="0.5" />
                         {/* Pipes */}
                         <line x1="100" y1="50" x2="180" y2="50" stroke="#06b6d4" strokeWidth="4" />
                         <line x1="100" y1="100" x2="180" y2="100" stroke="#06b6d4" strokeWidth="4" />
                    </svg>
                    {/* Data Overlays */}
                    <div className="absolute top-4 right-4 bg-blue-900/80 p-1 rounded text-[10px] border border-blue-700">
                        <div>1#压力: 6 bar</div>
                        <div>流量: 0 L/min</div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

// 3. Right Panel (Monitor & Stats)
const RightPanel = () => {
    // Stats Chart Option
    const getStatsOption = () => {
        return {
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            legend: { data: ['A液', 'B液'], textStyle: { color: '#ccc', fontSize: 10 }, top: 0 },
            grid: { top: '15%', bottom: '15%', left: '12%', right: '5%' },
            xAxis: { 
                type: 'category', 
                data: ['4208', '4209', '4210', '4211', '4212'],
                axisLine: { lineStyle: { color: '#1e3a8a' } },
                axisLabel: { color: '#94a3b8', fontSize: 10 }
            },
            yAxis: { 
                type: 'value', 
                name: '注浆(m³)',
                nameTextStyle: { color: '#94a3b8', padding: [0, 20, 0, 0] },
                splitLine: { show: false },
                axisLine: { show: true, lineStyle: { color: '#1e3a8a' } },
                axisLabel: { color: '#94a3b8', fontSize: 10 }
            },
            series: [
                { name: 'A液', type: 'bar', stack: 'total', data: [27.7, 27.0, 27.2, 27.7, 26.6], itemStyle: { color: '#06b6d4' }, barWidth: '30%' },
                { name: 'B液', type: 'bar', stack: 'total', data: [1.69, 1.65, 1.67, 1.69, 1.62], itemStyle: { color: '#eab308' }, barWidth: '30%' }
            ]
        };
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Monitor Section */}
            <div className="tech-card p-3 flex flex-col gap-2">
                <h3 className="text-sm font-bold text-tech-blue border-l-4 border-tech-blue pl-2">注浆实施监测情况</h3>
                
                {/* Progress */}
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>当前推进</span>
                        <span className="text-white">57.50%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 w-[57.5%]"></div>
                    </div>
                </div>

                {/* Grid Data */}
                <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                    <div className="bg-black/20 p-1 rounded border border-blue-900/30">
                        <div className="text-gray-500">本环实际推进进度</div>
                        <div className="text-white font-mono">2172.00mm</div>
                    </div>
                    <div className="bg-black/20 p-1 rounded border border-blue-900/30">
                        <div className="text-gray-500">总注浆量</div>
                        <div className="text-white font-mono">20.00m³</div>
                    </div>
                    <div className="bg-black/20 p-1 rounded border border-blue-900/30 col-span-2 flex justify-between px-2">
                        <span className="text-gray-500">注浆控制标准值</span>
                        <span className="text-white font-mono">26.05 -- 33.81m³</span>
                    </div>
                </div>
            </div>

            {/* Control Values */}
            <div className="tech-card p-3">
                 <h3 className="text-sm font-bold text-tech-blue border-l-4 border-tech-blue pl-2 mb-2">理论控制值</h3>
                 <table className="w-full text-xs text-left">
                     <thead>
                         <tr className="text-gray-500 border-b border-gray-700">
                             <th className="pb-1">参数</th>
                             <th className="pb-1 text-right">当前</th>
                             <th className="pb-1 text-right">理论</th>
                         </tr>
                     </thead>
                     <tbody className="text-gray-300">
                         <tr className="border-b border-gray-800/50">
                             <td className="py-1">砂浆注入率 (%)</td>
                             <td className="text-right text-cyan-300">120</td>
                             <td className="text-right">≤130</td>
                         </tr>
                         <tr className="border-b border-gray-800/50">
                             <td className="py-1">A液与B液比例</td>
                             <td className="text-right text-cyan-300">15.11</td>
                             <td className="text-right">14~16:1</td>
                         </tr>
                         <tr className="border-b border-gray-800/50">
                             <td className="py-1">盾尾注浆体积(m³)</td>
                             <td className="text-right text-cyan-300">18.80</td>
                             <td className="text-right">15.00-20.00</td>
                         </tr>
                         <tr>
                             <td className="py-1">填充系数 (mm)</td>
                             <td className="text-right text-cyan-300">1.3</td>
                             <td className="text-right">1.15-1.45</td>
                         </tr>
                     </tbody>
                 </table>
            </div>

            {/* Statistics */}
            <div className="tech-card flex-1 min-h-0 flex flex-col p-2">
                <h3 className="text-sm font-bold text-tech-blue border-l-4 border-tech-blue pl-2 mb-1">注浆统计</h3>
                <div className="flex-1 min-h-0">
                    <ReactECharts option={getStatsOption()} style={{ height: '100%', width: '100%' }} />
                </div>
            </div>

            {/* Alerts */}
            <div className="h-24 tech-card p-2 flex flex-col">
                <h3 className="text-sm font-bold text-tech-blue border-l-4 border-tech-blue pl-2 mb-1">报警信息</h3>
                <div className="flex-1 flex items-center justify-center text-gray-500 text-xs bg-black/20 rounded border border-dashed border-gray-700">
                    暂无报警...
                </div>
            </div>
        </div>
    );
};

// --- Main Page ---

const GroutingPage = () => {
  return (
    <div className="flex flex-col h-full gap-4 p-2 relative overflow-hidden">
        {/* Mock Top Status Bar (reuse from DigitalShield or simplified) */}
        <div className="flex items-center justify-between bg-[#0f172a]/80 border border-blue-900/50 p-2 rounded px-6 shrink-0">
             <div className="flex gap-4 text-sm text-gray-300">
                <span>导向监测 - 注浆系统</span>
                <span className="text-cyan-400">当前环: 4213</span>
             </div>
             <div className="text-xs text-green-400 border border-green-500/30 px-2 rounded">在线</div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
            {/* Left Column */}
            <div className="col-span-8 flex flex-col gap-4 min-h-0">
                <GroutingSimulation />
                <DiagramSection />
            </div>

            {/* Right Column */}
            <div className="col-span-4 min-h-0">
                <RightPanel />
            </div>
        </div>
    </div>
  );
};

export default GroutingPage;
