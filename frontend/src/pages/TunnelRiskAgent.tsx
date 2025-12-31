import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Shield,
  AlertTriangle,
  Wind,
  Anchor,
  Eye,
  Truck,
  HardHat,
  Thermometer,
  Droplets,
  Box,
  Radio,
  Terminal,
  GitBranch,
  PlayCircle,
  CheckCircle2,
  Cpu,
  Bot,
  MessageSquare,
  X,
  Send,
  Loader2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { connectSSE } from '../utils/sse';

const callGemini = async (prompt: string, systemInstruction = ''): Promise<string> => {
  try {
    const resp = await fetch(`/api/ai/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction })
    });
    if (resp.ok) {
      const data = await resp.json();
      const t = data?.text;
      if (t && typeof t === 'string') return t;
    }
  } catch {}
  const key = (import.meta as any).env?.VITE_PUBLIC_GEMINI_KEY;
  if (!key) return '连接大模型服务失败，请检查网络或配额。';
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
        })
      }
    );
    if (!r.ok) throw new Error('API Call Failed');
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || '智能体响应异常，请稍后重试。';
  } catch {
    return '连接大模型服务失败，请检查网络或配额。';
  }
};

const Card: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  action?: React.ReactNode;
  alertLevel?: 'normal' | 'warning' | 'critical';
}> = ({ title, children, className = '', icon: Icon, action, alertLevel = 'normal' }) => {
  const borderColor =
    alertLevel === 'critical'
      ? 'border-red-600/60'
      : alertLevel === 'warning'
      ? 'border-yellow-500/60'
      : 'border-blue-800/50';
  const glowColor =
    alertLevel === 'critical'
      ? 'shadow-[0_0_20px_rgba(220,38,38,0.2)]'
      : alertLevel === 'warning'
      ? 'shadow-[0_0_20px_rgba(234,179,8,0.2)]'
      : '';

  return (
    <div
      className={`bg-slate-900/80 border ${borderColor} ${glowColor} rounded-lg flex flex-col relative overflow-hidden backdrop-blur-md transition-all duration-500 ${className}`}
    >
      <div
        className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${
          alertLevel === 'critical' ? 'border-red-500' : 'border-cyan-400/80'
        }`}
      ></div>
      <div
        className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${
          alertLevel === 'critical' ? 'border-red-500' : 'border-cyan-400/80'
        }`}
      ></div>
      <div
        className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${
          alertLevel === 'critical' ? 'border-red-500' : 'border-cyan-400/80'
        }`}
      ></div>
      <div
        className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${
          alertLevel === 'critical' ? 'border-red-500' : 'border-cyan-400/80'
        }`}
      ></div>

      <div
        className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between bg-gradient-to-r ${
          alertLevel === 'critical' ? 'from-red-900/20' : 'from-blue-900/20'
        } to-transparent`}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className={alertLevel === 'critical' ? 'text-red-400' : 'text-cyan-400'} />}
          <h3
            className={`font-bold tracking-wider text-sm uppercase ${
              alertLevel === 'critical' ? 'text-red-100' : 'text-cyan-100'
            }`}
          >
            {title}
          </h3>
        </div>
        {action}
      </div>
      <div className="flex-1 p-4 overflow-auto relative scrollbar-hide">{children}</div>
    </div>
  );
};

const generateSensorData = (length: number, base: number, variance: number) => {
  return Array.from({ length }, (_, i) => ({
    time: `10:${i < 10 ? '0' + i : i}`,
    value: base + Math.random() * variance - variance / 2,
    threshold: base + variance
  }));
};

const VisionSimView: React.FC<{ zone: string; risk: any }> = ({ zone, risk }) => {
  const isRisky =
    risk && ((risk.type === 'personnel' && zone === 'segment') || (risk.type === 'vehicle' && zone === 'logistics'));

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden border border-slate-700 group">
      <div
        className={`absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-500 ${
          isRisky ? 'grayscale-0' : 'grayscale'
        }`}
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1590247813693-5541d1c609fd?q=80&w=2000&auto=format&fit=crop')`
        }}
      ></div>
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.1)_50%)] bg-[size:100%_4px] pointer-events-none"></div>
      {isRisky && <div className="absolute inset-0 bg-red-900/20 animate-pulse pointer-events-none"></div>}

      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-mono text-red-500 font-bold">REC ●</span>
          <span className="text-xs font-mono text-slate-300">CAM-0{zone === 'segment' ? '2' : '4'} | {zone.toUpperCase()}</span>
        </div>
      </div>

      {isRisky ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.6)] flex flex-col items-center justify-end pb-2 animate-bounce-slow">
          <div className="absolute -top-6 left-0 bg-red-600 text-white text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
            {risk.type === 'personnel' ? 'DETECTED: HUMAN' : 'DETECTED: VEHICLE'}
          </div>
          <div className="text-red-500 font-mono text-xs bg-black/70 px-2 py-1">
            {risk.type === 'personnel' ? '未穿戴反光衣 / 距离过近' : '车辆超速 / 路径入侵'}
          </div>
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-red-500"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-red-500"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-red-500"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-red-500"></div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border border-cyan-500/30 w-64 h-48 rounded flex items-center justify-center">
            <span className="text-cyan-500/50 text-xs font-mono">Scanning Area...</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 p-2 flex justify-between border-t border-slate-700">
        <div className="flex gap-4 text-xs font-mono text-slate-400">
          <span>FPS: 24</span>
          <span>LATENCY: 12ms</span>
          <span>AI MODEL: YOLO-v8-TUNNEL</span>
        </div>
        {isRisky && <span className="text-xs font-bold text-red-500 blink">RISK IDENTIFIED</span>}
      </div>
    </div>
  );
};

const TunnelRiskAgent: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<'normal' | 'warning' | 'critical'>('normal');
  const [activeZone, setActiveZone] = useState<'cutter' | 'segment' | 'logistics'>('segment');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [agentState, setAgentState] = useState<'idle' | 'detecting' | 'thinking' | 'deciding' | 'executing'>('idle');
  const [agentLogs, setAgentLogs] = useState<Array<{ id: number; message: string; type: 'info' | 'warning' | 'critical' | 'success' }>>([]);
  const [decisionPlan, setDecisionPlan] = useState<Array<{ step: number; action: string; auto: boolean }>>([]);

  const [gasData, setGasData] = useState(generateSensorData(20, 0.05, 0.02));
  const [pressureData, setPressureData] = useState(generateSensorData(20, 2.5, 0.3));

  const [activeRisk, setActiveRisk] = useState<any>(null);

  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: '系统已就绪。全域传感器在线，视觉识别模组运行中。' }
  ]);
  const [isChatThinking, setIsChatThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, showChat]);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentLogs]);

  useEffect(() => {
    const disconnectRisk = connectSSE('/api/stream/tunnel-risk', {
      risk: (payload: any) => {
        const t = payload?.type as 'personnel' | 'gas' | 'vehicle' | undefined;
        if (t) triggerRiskScenario(t);
      }
    });
    const disconnectSensors = connectSSE('/api/stream/sensors', {
      sensor: (payload: any) => {
        const g = Number(payload?.gas);
        const p = Number(payload?.pressure);
        if (!Number.isNaN(g)) {
          setGasData(prev => [
            ...prev.slice(1),
            { time: new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }), value: g, threshold: 0.5 }
          ]);
        }
        if (!Number.isNaN(p)) {
          setPressureData(prev => [
            ...prev.slice(1),
            { time: new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }), value: p, threshold: 3.5 }
          ]);
        }
      }
    });
    return () => {
      disconnectRisk();
      disconnectSensors();
    };
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setGasData(prev => {
        const newVal = activeRisk?.type === 'gas' ? 0.8 + Math.random() * 0.2 : 0.05 + Math.random() * 0.02;
        return [
          ...prev.slice(1),
          { time: new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }), value: newVal, threshold: 0.5 }
        ];
      });
      setPressureData(prev => [
        ...prev.slice(1),
        { time: new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }), value: 2.5 + Math.random() * 0.3, threshold: 3.5 }
      ]);
    }, 2000);
    return () => clearInterval(interval);
  }, [activeRisk]);

  const addAgentLog = (message: string, type: 'info' | 'warning' | 'critical' | 'success' = 'info') => {
    setAgentLogs(prev => [...prev, { id: Date.now(), message, type }]);
  };

  const triggerRiskScenario = (type: 'personnel' | 'gas' | 'vehicle') => {
    setSystemStatus('critical');
    setAiAnalysis(null);
    setAgentLogs([]);
    setDecisionPlan([]);
    setAgentState('detecting');

    let riskDetails: any = {};
    let mockPlan: Array<{ step: number; action: string; auto: boolean }> = [];

    if (type === 'personnel') {
      riskDetails = {
        id: `RISK-${Date.now()}`,
        type: 'personnel',
        title: '人员入侵危险区域',
        location: '管片拼装区 B2段',
        level: '高危 (I级)',
        detectedBy: 'AI视觉识别相机 #04',
        timestamp: new Date().toLocaleTimeString(),
        metrics: { distance: '0.8m (阈值 2.0m)', confidence: '98.5%' }
      };
      setActiveZone('segment');
      mockPlan = [
        { step: 1, action: '立即停止拼装机动作 (Emergency Stop)', auto: true },
        { step: 2, action: '区域声光报警开启', auto: true },
        { step: 3, action: '推送实时画面至监控大屏', auto: true },
        { step: 4, action: '通知班组长现场确认', auto: false }
      ];
    } else if (type === 'gas') {
      riskDetails = {
        id: `RISK-${Date.now()}`,
        type: 'gas',
        title: '瓦斯浓度异常超限',
        location: '回风管路 A1段',
        level: '危急 (特级)',
        detectedBy: '多气体传感器组 G-12',
        timestamp: new Date().toLocaleTimeString(),
        metrics: { ch4: '0.92% (阈值 0.5%)', trend: '极速上升' }
      };
      setActiveZone('cutter');
      mockPlan = [
        { step: 1, action: '切断刀盘与螺旋机电源', auto: true },
        { step: 2, action: '启动隧道主风机强排模式 (100%)', auto: true },
        { step: 3, action: '撤离TBM全线人员至安全区', auto: false },
        { step: 4, action: '持续监测气体消散速率', auto: true }
      ];
    } else if (type === 'vehicle') {
      riskDetails = {
        id: `RISK-${Date.now()}`,
        type: 'vehicle',
        title: '车辆防撞预警',
        location: '后配套物流通道',
        level: '中警 (II级)',
        detectedBy: 'UWB定位 + 视觉融合',
        timestamp: new Date().toLocaleTimeString(),
        metrics: { speed: '15km/h', proximity: '3.5m' }
      };
      setActiveZone('logistics');
      mockPlan = [
        { step: 1, action: '发送减速指令至车辆终端', auto: true },
        { step: 2, action: '激活防撞预警雷达', auto: true },
        { step: 3, action: '锁定道岔系统', auto: true }
      ];
    }

    setActiveRisk(riskDetails);
    addAgentLog(`[感知层] 接收到 ${riskDetails.detectedBy} 异常信号`, 'warning');
    addAgentLog(`[数据层] 聚合相关传感器数据... 完成`, 'info');

    setTimeout(() => {
      setAgentState('thinking');
      addAgentLog(`[认知层] 正在分析风险特征: ${JSON.stringify(riskDetails.metrics)}`, 'info');
      addAgentLog(`[知识库] 检索《盾构施工安全规范》及历史案例库...`, 'info');
    }, 1000);

    setTimeout(() => {
      setAgentState('deciding');
      addAgentLog(`[决策层] 判定风险等级为: ${riskDetails.level}`, 'critical');
      addAgentLog(`[策略层] 匹配到最佳处置预案 SOP-${type.toUpperCase()}-001`, 'success');
    }, 2500);

    setTimeout(() => {
      setAgentState('executing');
      setDecisionPlan(mockPlan);
      addAgentLog(`[执行层] 已生成 ${mockPlan.length} 条管控指令，准备执行`, 'success');
      generateRiskReport(riskDetails, '风险已触发，请基于当前状态生成简报');
    }, 3500);
  };

  const resetSystem = () => {
    setSystemStatus('normal');
    setActiveRisk(null);
    setAiAnalysis(null);
    setAgentLogs([]);
    setDecisionPlan([]);
    setAgentState('idle');
  };

  const generateRiskReport = async (risk = activeRisk, contextOverride = '') => {
    if (!risk) return;
    setIsAnalyzing(true);
    const context = contextOverride || `
      当前系统状态：${systemStatus}
      风险事件：${risk.title}
      监测位置：${risk.location}
      关键指标：${JSON.stringify(risk.metrics)}
      
      作为盾构施工安全专家，请生成一份简短的应急处置与原因分析报告。
      格式要求：
      1. 风险成因研判
      2. 立即管控措施 (3条)
      3. 后续检查建议
    `;
    const result = await callGemini('生成风险研判报告', context);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      <header className="h-16 border-b border-blue-900/30 bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-6 shadow-lg z-50 relative">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 to-blue-300">
              隧道风险管控智能体
            </h1>
            <p className="text-[10px] text-cyan-600 font-mono tracking-[0.2em] uppercase">Tunnel Risk Analysis & Control Agent</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-800/50 p-1.5 rounded-lg border border-slate-700">
          <span className="text-xs text-slate-400 px-2 font-bold uppercase">模拟风险场景:</span>
          <select
            className="bg-slate-900 border border-slate-600 text-xs text-slate-200 rounded px-2 py-1 focus:border-cyan-500 outline-none"
            onChange={e => {
              if (e.target.value) triggerRiskScenario(e.target.value as 'personnel' | 'gas' | 'vehicle');
              else resetSystem();
            }}
            value={activeRisk?.type || ''}
          >
            <option value="">-- 系统正常运行 --</option>
            <option value="personnel">⚠️ 人员入侵 (管片区)</option>
            <option value="gas">☠️ 瓦斯超限 (刀盘区)</option>
            <option value="vehicle">🚜 车辆碰撞 (物流区)</option>
          </select>
        </div>
        <div className="flex items-center gap-6">
          <div
            className={`px-3 py-1 rounded-full border flex items-center gap-2 text-xs font-bold transition-all duration-300 ${
              systemStatus === 'normal'
                ? 'bg-green-900/20 border-green-500/50 text-green-400'
                : 'bg-red-900/20 border-red-500/50 text-red-500 animate-pulse'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${systemStatus === 'normal' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {systemStatus === 'normal' ? 'SYSTEM SECURE' : 'RISK DETECTED'}
          </div>
        </div>
      </header>

      <main className="p-4 grid grid-cols-12 gap-4 h-[calc(100vh-64px)] relative z-10">
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
          <Card title="多源数据实时聚合" icon={Activity} className="h-1/3">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Wind size={12} /> CH4 浓度 (刀盘)
                  </span>
                  <span className={`font-mono font-bold ${activeRisk?.type === 'gas' ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {gasData[gasData.length - 1].value.toFixed(2)}%
                  </span>
                </div>
                <div className="h-12 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={gasData}>
                      <Line type="monotone" dataKey="value" stroke={activeRisk?.type === 'gas' ? '#ef4444' : '#22c55e'} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="threshold" stroke="#94a3b8" strokeDasharray="3 3" dot={false} strokeWidth={1} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Anchor size={12} /> 土仓压力 (bar)
                  </span>
                  <span className="font-mono text-cyan-400">{pressureData[pressureData.length - 1].value.toFixed(2)}</span>
                </div>
                <div className="h-12 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pressureData}>
                      <defs>
                        <linearGradient id="colorPress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#06b6d4" fillOpacity={1} fill="url(#colorPress)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>
          <Card title="地质与变形监测" icon={Eye} className="flex-1">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                <div className="text-[10px] text-slate-500 mb-1">地表沉降 (mm)</div>
                <div className="text-xl font-mono text-white">-12.4</div>
                <div className="text-[10px] text-yellow-500">⚠ 接近预警值</div>
              </div>
              <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                <div className="text-[10px] text-slate-500 mb-1">地下水位 (m)</div>
                <div className="text-xl font-mono text-white">8.5</div>
                <div className="text-[10px] text-green-500">正常范围</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-bold text-cyan-500 border-b border-cyan-900/30 pb-1">重点风险源扫描</div>
              {[
                { label: '房屋桩基群', status: 'safe', dist: '15m' },
                { label: '燃气管线 Φ500', status: 'warning', dist: '3.2m' },
                { label: '废弃人防空洞', status: 'safe', dist: '45m' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-800/30 p-2 rounded text-xs">
                  <span className="text-slate-300">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono">{item.dist}</span>
                    {item.status === 'safe' ? (
                      <span className="text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded">安全</span>
                    ) : (
                      <span className="text-yellow-400 bg-yellow-900/30 px-1.5 py-0.5 rounded animate-pulse">关注</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
          <Card title="盾构施工数字孪生场景" icon={Eye} className="flex-1 relative p-0 overflow-hidden" alertLevel={systemStatus === 'critical' ? 'critical' : 'normal'}>
            <div className="absolute top-4 left-0 right-0 z-20 flex justify-center gap-2">
              {[
                { id: 'cutter', label: '刀盘/掘进区', icon: Radio },
                { id: 'segment', label: '管片拼装区', icon: HardHat },
                { id: 'logistics', label: '后配套物流', icon: Truck }
              ].map(zone => (
                <button
                  key={zone.id}
                  onClick={() => setActiveZone(zone.id as 'cutter' | 'segment' | 'logistics')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all backdrop-blur-md border ${
                    activeZone === zone.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900/60 border-slate-600 text-slate-400 hover:border-slate-400'
                  }`}
                >
                  <zone.icon size={12} />
                  {zone.label}
                  {activeRisk && activeRisk.location.includes(zone.label.substring(0, 2)) && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  )}
                </button>
              ))}
            </div>
            <div className="absolute inset-0 pt-14 pb-4 px-4 bg-slate-950">
              <div className="h-full w-full grid grid-rows-3 gap-2">
                <div className="row-span-2 relative">
                  <VisionSimView zone={activeZone} risk={activeRisk} />
                  {activeRisk &&
                    activeZone === (activeRisk.type === 'gas' ? 'cutter' : activeRisk.type === 'personnel' ? 'segment' : 'logistics') && (
                      <div className="absolute bottom-4 right-4 bg-red-950/90 border border-red-500 p-3 rounded shadow-xl max-w-xs animate-in slide-in-from-right">
                        <div className="flex items-center gap-2 mb-1 text-red-400 font-bold text-sm">
                          <AlertTriangle size={14} />
                          <span>智能研判：风险触发</span>
                        </div>
                        <p className="text-xs text-red-100 mb-2">{activeRisk.title}</p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                          <div className="bg-black/30 p-1 rounded">置信度: 99.2%</div>
                          <div className="bg-black/30 p-1 rounded">响应时间: 0.4s</div>
                        </div>
                      </div>
                    )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-900 border border-slate-700 rounded p-2 flex flex-col justify-center items-center">
                    <Thermometer className="text-cyan-500 mb-1" size={16} />
                    <span className="text-[10px] text-slate-500">环境温度</span>
                    <span className="text-sm font-mono text-white">28.4°C</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-700 rounded p-2 flex flex-col justify-center items-center">
                    <Droplets className="text-blue-500 mb-1" size={16} />
                    <span className="text-[10px] text-slate-500">湿度</span>
                    <span className="text-sm font-mono text-white">76%</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-700 rounded p-2 flex flex-col justify-center items-center">
                    <Box className="text-purple-500 mb-1" size={16} />
                    <span className="text-[10px] text-slate-500">本环进度</span>
                    <span className="text-sm font-mono text-white">85%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          <Card title="智能风险管控中心" icon={AlertTriangle} className="h-full flex flex-col" alertLevel={activeRisk ? 'critical' : 'normal'}>
            {agentState !== 'idle' ? (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-black/40 border border-slate-700 rounded p-3 mb-4 h-1/3 flex flex-col font-mono overflow-hidden">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-2">
                    <Terminal size={10} />
                    AGENT_LOGS
                    {agentState === 'thinking' && <span className="animate-pulse text-cyan-400">● PROCESSING</span>}
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-hide">
                    {agentLogs.map((log, idx) => (
                      <div key={log.id} className={`text-[10px] flex gap-2 animate-in fade-in slide-in-from-left-2`}>
                        <span className="text-slate-600">[{new Date(log.id).toLocaleTimeString([], { hour12: false })}]</span>
                        <span
                          className={`${
                            log.type === 'warning'
                              ? 'text-yellow-400'
                              : log.type === 'critical'
                              ? 'text-red-400'
                              : log.type === 'success'
                              ? 'text-green-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {idx === agentLogs.length - 1 && agentState !== 'executing' ? '> ' : ''}
                          {log.message}
                        </span>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto mb-2 relative">
                  {decisionPlan.length > 0 ? (
                    <div className="space-y-3 animate-in zoom-in-95 duration-500">
                      <div className="flex justify-between items-center">
                        <h5 className="text-cyan-400 text-xs font-bold uppercase flex items-center gap-1">
                          <GitBranch size={12} /> 自动生成管控策略
                        </h5>
                        <span className="text-[9px] bg-cyan-900/50 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-700">SOP匹配度 99%</span>
                      </div>
                      {decisionPlan.map((plan, idx) => (
                        <div
                          key={idx}
                          className="flex gap-3 items-start bg-slate-800/60 p-3 rounded border-l-2 border-cyan-500 shadow-lg transform transition-all duration-500"
                          style={{ animationDelay: `${idx * 200}ms` }}
                        >
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)]">
                            {plan.step}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-100">{plan.action}</p>
                            <div className="flex gap-2 mt-1">
                              {plan.auto && (
                                <span className="text-[9px] text-cyan-400 flex items-center gap-0.5">
                                  <Cpu size={8} /> 自动执行
                                </span>
                              )}
                              {!plan.auto && (
                                <span className="text-[9px] text-yellow-400 flex items-center gap-0.5">
                                  <PlayCircle size={8} /> 等待人工确认
                                </span>
                              )}
                            </div>
                          </div>
                          {plan.auto && <CheckCircle2 size={14} className="text-green-500 ml-auto animate-in fade-in duration-500" />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-cyan-500/30 animate-pulse">
                      <Cpu size={48} className="opacity-20" />
                      <span className="absolute mt-16 text-xs">正在计算最优决策...</span>
                    </div>
                  )}
                </div>
                <div className="mt-auto">
                  {aiAnalysis && (
                    <div className="bg-indigo-950/30 border border-indigo-500/30 rounded p-3 max-h-40 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-5">
                      <div className="flex items-center gap-2 mb-2 sticky top-0 bg-slate-900/0 backdrop-blur-sm pb-1">
                        <Bot size={14} className="text-indigo-400" />
                        <span className="text-xs font-bold text-indigo-300">智能体深度简报</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap">{aiAnalysis}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                <Shield size={48} className="mb-2" />
                <p className="text-xs">当前无风险事件</p>
                <p className="text-[10px]">智能体正在全域巡检中...</p>
              </div>
            )}
          </Card>
        </div>
      </main>

      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${showChat ? 'w-80 h-96' : 'w-12 h-12'}`}>
        {!showChat ? (
          <button
            onClick={() => setShowChat(true)}
            className="w-12 h-12 bg-cyan-600 rounded-full shadow-[0_0_20px_rgba(8,145,178,0.5)] flex items-center justify-center hover:scale-110 transition-transform text-white group"
          >
            <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
          </button>
        ) : (
          <div className="w-full h-full bg-slate-900 border border-cyan-800 rounded-lg shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl">
            <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">智能安全助手</span>
              </div>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-2 rounded-lg text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-cyan-700 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-300 rounded-bl-none border border-slate-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-2 rounded-lg rounded-bl-none border border-slate-700">
                    <Loader2 className="animate-spin text-slate-500" size={14} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form
              onSubmit={async e => {
                e.preventDefault();
                if (!chatInput.trim() || isChatThinking) return;
                const msg = chatInput;
                setChatInput('');
                setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
                setIsChatThinking(true);
                const prompt = `用户提问: \"${msg}\"。当前系统处于${systemStatus}状态。${
                  activeRisk ? `正在处理${activeRisk.title}风险。` : ''
                } 请简短回答。`;
                const response = await callGemini(prompt);
                setChatHistory(prev => [...prev, { role: 'model', text: response }]);
                setIsChatThinking(false);
              }}
              className="p-2 bg-slate-900 border-t border-slate-800 flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="询问安全规范..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" className="p-1.5 bg-cyan-600 text-white rounded hover:bg-cyan-500">
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TunnelRiskAgent;
