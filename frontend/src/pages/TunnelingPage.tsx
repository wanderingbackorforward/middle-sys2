import React from 'react';

const TunnelingPage: React.FC = () => {
  return (
    <div className="flex flex-col h-full gap-4 p-2 relative">
      {/* Mock Top Status Bar (reuse from others or simplified) */}
      <div className="flex items-center justify-between bg-[#0f172a]/80 border border-blue-900/50 p-2 rounded px-6 shrink-0">
         <div className="flex gap-4 text-sm text-gray-300">
            <span>导向监测 - 掘进监测</span>
            <span className="text-cyan-400">当前环: 4219</span>
         </div>
         <div className="text-xs text-green-400 border border-green-500/30 px-2 rounded">在线</div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left: Excavation Monitor (Cutterhead) */}
        <div className="col-span-7 h-full min-h-0">
           <ExcavationMonitor />
        </div>

        {/* Right: Geological Info & Support Pressure */}
        <div className="col-span-5 h-full min-h-0">
           <TunnelingRightPanel />
        </div>
      </div>
    </div>
  );
};

// --- Left Component: Excavation Monitor ---
const ExcavationMonitor = () => {
  return (
    <div className="flex flex-col h-full gap-4">
       {/* Top: Cutterhead Visualization */}
       <div className="flex-[3] tech-card relative flex flex-col p-2">
           <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2 tracking-wider">掘进检测</h3>
           <div className="flex-1 relative bg-black/20 rounded flex items-center justify-center overflow-hidden">
               {/* Cutterhead Graphic (SVG) */}
               <div className="relative w-[450px] h-[450px]">
                   {/* Rotating Part */}
                   <svg viewBox="0 0 500 500" className="w-full h-full animate-[spin_20s_linear_infinite]">
                       {/* Main Ring */}
                       <circle cx="250" cy="250" r="240" fill="#202020" stroke="#555" strokeWidth="10" />
                       <circle cx="250" cy="250" r="200" fill="#1a1a1a" stroke="#06b6d4" strokeWidth="2" strokeDasharray="10 5" />
                       
                       {/* Spokes */}
                       {[0, 60, 120, 180, 240, 300].map(deg => (
                           <g key={deg} transform={`rotate(${deg} 250 250)`}>
                               <rect x="230" y="10" width="40" height="200" fill="#333" stroke="#444" />
                               <circle cx="250" cy="30" r="8" fill="#ccc" />
                           </g>
                       ))}
                       
                       {/* Inner Blue Zone */}
                       <circle cx="250" cy="250" r="140" fill="rgba(6,182,212,0.1)" stroke="#06b6d4" strokeWidth="1" />
                   </svg>
                   
                   {/* Static Data Overlays (Absolute Positioning) */}
                   {/* Center Data */}
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                       <div className="text-cyan-400 font-bold text-sm">推力</div>
                       <div className="text-white text-xl font-mono mb-2">140300 KN</div>
                       
                       <div className="text-gray-400 text-xs">贯入度 <span className="text-white font-bold text-sm">30.5 mm/r</span></div>
                       <div className="text-gray-400 text-xs">推进速度 <span className="text-white font-bold text-sm">41 mm/min</span></div>
                       <div className="text-gray-400 text-xs">刀盘转速 <span className="text-white font-bold text-sm">1.34 rpm</span></div>
                       <div className="text-gray-400 text-xs">刀盘扭矩 <span className="text-white font-bold text-sm">7250 kNm</span></div>
                   </div>

                   {/* Surrounding Groups (A/B/C/D) */}
                   {/* Group A (Top) */}
                   <div className="absolute top-[10%] left-1/2 -translate-x-1/2 bg-black/60 border border-blue-800/60 p-1 rounded text-[10px] w-24 backdrop-blur-sm">
                       <div className="text-cyan-400 border-b border-gray-700 mb-1">A组(1#2#)</div>
                       <div className="flex justify-between"><span className="text-gray-400">压力</span> <span className="text-white">166 Bar</span></div>
                       <div className="flex justify-between"><span className="text-gray-400">行程</span> <span className="text-white">2236 mm</span></div>
                   </div>
                   {/* Group B (Right) */}
                   <div className="absolute top-1/2 right-[5%] -translate-y-1/2 bg-black/60 border border-blue-800/60 p-1 rounded text-[10px] w-24 backdrop-blur-sm">
                       <div className="text-cyan-400 border-b border-gray-700 mb-1">B组(3#4#)</div>
                       <div className="flex justify-between"><span className="text-gray-400">压力</span> <span className="text-white">163 Bar</span></div>
                       <div className="flex justify-between"><span className="text-gray-400">行程</span> <span className="text-white">2236 mm</span></div>
                   </div>
                   {/* Group C (Bottom) */}
                   <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 bg-black/60 border border-blue-800/60 p-1 rounded text-[10px] w-24 backdrop-blur-sm">
                       <div className="text-cyan-400 border-b border-gray-700 mb-1">C组(5#6#)</div>
                       <div className="flex justify-between"><span className="text-gray-400">压力</span> <span className="text-white">163 Bar</span></div>
                       <div className="flex justify-between"><span className="text-gray-400">行程</span> <span className="text-white">2238 mm</span></div>
                   </div>
                   {/* Group D (Left) */}
                   <div className="absolute top-1/2 left-[5%] -translate-y-1/2 bg-black/60 border border-blue-800/60 p-1 rounded text-[10px] w-24 backdrop-blur-sm">
                       <div className="text-cyan-400 border-b border-gray-700 mb-1">D组(7#8#)</div>
                       <div className="flex justify-between"><span className="text-gray-400">压力</span> <span className="text-white">165 Bar</span></div>
                       <div className="flex justify-between"><span className="text-gray-400">行程</span> <span className="text-white">2236 mm</span></div>
                   </div>
               </div>
           </div>
       </div>

       {/* Bottom: Alerts */}
       <div className="h-32 tech-card flex flex-col p-2">
           <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2 tracking-wider">报警信息</h3>
           <div className="flex-1 flex items-center justify-center text-gray-500 bg-black/20 rounded border border-dashed border-gray-700">
               暂无报警...
           </div>
       </div>
    </div>
  );
};

// --- Right Component: Info & Support Pressure ---
const TunnelingRightPanel = () => {
  const geoData = [
      { id: 4214, name: '3层砂', high: 5.84, low: 5.62 },
      { id: 4215, name: '3层砂', high: 5.77, low: 5.69 },
      { id: 4216, name: '3层砂', high: 5.90, low: 5.56 },
      { id: 4217, name: '3层砂', high: 5.74, low: 5.72 },
      { id: 4218, name: '3层砂', high: 5.79, low: 5.67 },
      { id: 4219, name: '3层砂', high: 5.74, low: 5.72, active: true },
      { id: 4220, name: '3层砂', high: 5.76, low: 5.68 },
      { id: 4221, name: '3层砂', high: 5.89, low: 5.57 },
      { id: 4222, name: '3层砂', high: 5.84, low: 5.62 },
      { id: 4223, name: '3层砂', high: 5.75, low: 5.71 },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
       {/* Geological Info Table */}
       <div className="flex-1 tech-card p-2 flex flex-col">
           <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2 tracking-wider">地层信息</h3>
           <div className="flex-1 overflow-auto">
               <table className="w-full text-xs text-center">
                   <thead className="text-cyan-400 bg-blue-900/30 sticky top-0">
                       <tr>
                           <th className="py-2">环号</th>
                           <th className="py-2">名称</th>
                           <th className="py-2">水土压力上限值</th>
                           <th className="py-2">水土压力下限值</th>
                       </tr>
                   </thead>
                   <tbody className="text-gray-300">
                       {geoData.map(row => (
                           <tr key={row.id} className={`border-b border-gray-800/50 hover:bg-blue-900/20 ${row.active ? 'bg-blue-600/20 text-white' : ''}`}>
                               <td className="py-2">{row.id}</td>
                               <td className="py-2">{row.name}</td>
                               <td className="py-2">{row.high}</td>
                               <td className="py-2">{row.low}</td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       </div>

       {/* Support Pressure */}
       <div className="h-64 tech-card p-2 flex flex-col">
           <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2 tracking-wider">支护压力</h3>
           <div className="flex-1 grid grid-cols-2 gap-4">
               {/* Excavation Chamber Pressure */}
               <div className="relative border border-blue-900/30 rounded-full flex items-center justify-center bg-black/20">
                   <div className="absolute inset-0 flex items-center justify-center text-center text-cyan-400 font-bold opacity-20 text-lg">开挖仓压力</div>
                   
                   {/* Values placed roughly in circle */}
                   <div className="absolute top-[15%] left-1/2 -translate-x-1/2 bg-blue-900/60 px-2 rounded text-xs text-white">1# 5.42 bar</div>
                   <div className="absolute top-[30%] right-[15%] bg-blue-900/60 px-2 rounded text-xs text-white">2# 0 bar</div>
                   <div className="absolute bottom-[30%] right-[15%] bg-blue-900/60 px-2 rounded text-xs text-white">4# 6.51 bar</div>
                   <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 bg-blue-900/60 px-2 rounded text-xs text-white">6# 6.94 bar</div>
                   <div className="absolute bottom-[30%] left-[15%] bg-blue-900/60 px-2 rounded text-xs text-white">5# 7.07 bar</div>
                   <div className="absolute top-[30%] left-[15%] bg-blue-900/60 px-2 rounded text-xs text-white">3# 6.5 bar</div>
               </div>

               {/* Working Chamber Pressure */}
               <div className="relative border border-blue-900/30 rounded-full flex items-center justify-center bg-black/20">
                   <div className="absolute inset-0 flex items-center justify-center text-center text-cyan-400 font-bold opacity-20 text-lg">工作仓压力</div>
                   <div className="absolute top-[30%] left-[20%] bg-blue-900/60 px-2 rounded text-xs text-white">1# 6.22 bar</div>
                   <div className="absolute top-[30%] right-[20%] bg-blue-900/60 px-2 rounded text-xs text-white">2# 6.26 bar</div>
               </div>
           </div>
       </div>
    </div>
  );
};

export default TunnelingPage;
