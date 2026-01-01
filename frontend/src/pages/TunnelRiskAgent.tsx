import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Shield,
  AlertTriangle,
  Wind,
  Anchor,
  Eye,
  Cpu,
  Bot,
  MessageSquare,
  X,
  Send,
  Loader2,
  Terminal,
  GitBranch,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { connectSSE } from '../utils/sse';
import { apiUrl } from '../utils/api';

const callGemini = async (prompt: string, systemInstruction = ''): Promise<string> => {
  try {
    console.log('[ai] request backend', apiUrl(`/api/ai/deepseek`));
    const resp = await fetch(apiUrl(`/api/ai/deepseek`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction })
    });
    if (resp.ok) {
      const data = await resp.json().catch(() => null);
      console.log('[ai] backend resp ok json=', data);
      const t = data?.text;
      if (t && typeof t === 'string') return t;
    }
    console.warn('[ai] backend resp not ok status=', resp.status);
  } catch { }
  const key = (import.meta as any).env?.VITE_PUBLIC_DEEPSEEK_KEY;
  if (!key) return '连接大模型服务失败，请检查网络或配额。';
  try {
    console.warn('[ai] fallback direct');
    const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt }
        ],
        stream: false
      })
    });
    if (!r.ok) throw new Error('API Call Failed');
    const data = await r.json();
    console.log('[ai] direct resp json=', data);
    const text = data?.choices?.[0]?.message?.content;
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
        className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${alertLevel === 'critical' ? 'border-red-500' : 'border-cyan-400/80'
          }`}
      ></div>
      <div
        className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${alertLevel === 'critical' ? 'border-red-500' : 'border-cyan-400/80'
          }`}
      ></div>
      <div
        className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${alertLevel === 'critical' ? 'border-red-500' : 'border-cyan-400/80'
          }`}
      ></div>
      <div
        className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${alertLevel === 'critical' ? 'border-red-500' : 'border-cyan-400/80'
          }`}
      ></div>

      <div
        className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between bg-gradient-to-r ${alertLevel === 'critical' ? 'from-red-900/20' : 'from-blue-900/20'
          } to-transparent`}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className={alertLevel === 'critical' ? 'text-red-400' : 'text-cyan-400'} />}
          <h3
            className={`font-bold tracking-wider text-sm uppercase ${alertLevel === 'critical' ? 'text-red-100' : 'text-cyan-100'
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



const TunnelRiskAgent: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<'normal' | 'warning' | 'critical'>('normal');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [agentState, setAgentState] = useState<'idle' | 'detecting' | 'thinking' | 'deciding' | 'executing'>('idle');
  const [agentLogs, setAgentLogs] = useState<Array<{ id: number; message: string; type: 'info' | 'warning' | 'critical' | 'success' }>>([]);
  const [decisionPlan, setDecisionPlan] = useState<Array<{ step: number; action: string; auto: boolean; reason: string }>>([]);

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
    const disconnectRisk = connectSSE(apiUrl('/api/stream/tunnel-risk'), {
      risk: (payload: any) => {
        const t = payload?.type as 'personnel' | 'gas' | 'vehicle' | undefined;
        if (t) triggerRiskScenario(t);
      }
    });

    // 监听智能体自主监控频道
    const disconnectAgent = connectSSE(apiUrl('/api/stream/agent'), {
      'agent-status': (payload: any) => {
        console.log('[SSE] agent-status recv:', payload);

        // 自动触发处理
        if (payload.auto_triggered && payload.state === 'completed') {
          const result = payload.result || {};
          const riskType = payload.risk_type;

          // 构造风险详情对象
          const newRisk = {
            id: `AUTO-${Date.now()}`,
            type: riskType,
            title: riskType === 'gas' ? '瓦斯浓度异常 (自动监测)' :
              riskType === 'personnel' ? '人员入侵告警 (自动监测)' : '车辆违规预警 (自动监测)',
            location: '监测区域 (AI识别)',
            level: payload.risk_level || '判定中',
            detectedBy: '智能体自主监控系统',
            timestamp: new Date().toLocaleTimeString(),
            metrics: { info: '后台自动触发' }
          };

          setActiveRisk(newRisk);
          setSystemStatus('critical');

          if (result.analysis) setAiAnalysis(result.analysis);

          // 解析决策方案
          const plan = result.decision_plan || [];
          setDecisionPlan(plan.map((p: any, idx: number) => ({
            step: p.step || idx + 1,
            action: p.action || '',
            auto: p.auto !== false,
            reason: p.reason || ''
          })));

          setAgentState('executing');
          addAgentLog(`[自主监控] 检测到风险，智能体已自动介入`, 'critical');
          addAgentLog(`[报告] ${newRisk.title} - 处置方案已生成`, 'success');
        }
      }
    });

    const disconnectSensors = connectSSE(apiUrl('/api/stream/sensors'), {
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
      disconnectAgent();
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

  const triggerRiskScenario = async (type: 'personnel' | 'gas' | 'vehicle') => {
    setSystemStatus('critical');
    setAiAnalysis(null);
    setAgentLogs([]);
    setDecisionPlan([]);
    setAgentState('detecting');

    // 初始化风险详情
    let riskDetails: any = {};
    let sensorData: any = {};

    if (type === 'personnel') {
      riskDetails = {
        id: `RISK-${Date.now()}`,
        type: 'personnel',
        title: '人员入侵危险区域',
        location: '管片拼装区 B2段',
        level: '',
        detectedBy: 'AI视觉识别相机 #04',
        timestamp: new Date().toLocaleTimeString(),
        metrics: { distance: '0.8m (阈值 2.0m)', confidence: '98.5%' }
      };
      sensorData = { distance: 0.8, threshold: 2.0, confidence: 98.5 };
      sensorData = { distance: 0.8, threshold: 2.0, confidence: 98.5 };
    } else if (type === 'gas') {
      riskDetails = {
        id: `RISK-${Date.now()}`,
        type: 'gas',
        title: '瓦斯浓度异常超限',
        location: '回风管路 A1段',
        level: '',
        detectedBy: '多气体传感器组 G-12',
        timestamp: new Date().toLocaleTimeString(),
        metrics: { ch4: '0.92% (阈值 0.5%)', trend: '极速上升' }
      };
      sensorData = { ch4: 0.92, threshold: 0.5, trend: 'rising' };
      sensorData = { ch4: 0.92, threshold: 0.5, trend: 'rising' };
    } else if (type === 'vehicle') {
      riskDetails = {
        id: `RISK-${Date.now()}`,
        type: 'vehicle',
        title: '车辆防撞预警',
        location: '后配套物流通道',
        level: '',
        detectedBy: 'UWB定位 + 视觉融合',
        timestamp: new Date().toLocaleTimeString(),
        metrics: { speed: '15km/h', proximity: '3.5m' }
      };
      sensorData = { speed: 15, proximity: 3.5 };
      sensorData = { speed: 15, proximity: 3.5 };
    }

    setActiveRisk(riskDetails);
    addAgentLog(`[感知层] 接收到 ${riskDetails.detectedBy} 异常信号`, 'warning');

    // 调用真实智能体 API
    setAgentState('thinking');
    addAgentLog(`[智能体] 正在调用 LangGraph 工作流...`, 'info');

    try {
      const response = await fetch(apiUrl('/api/agent/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          risk_type: type,
          sensor_data: sensorData,
          location: riskDetails.location
        })
      });

      if (!response.ok) {
        throw new Error(`API 响应错误: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '智能体分析失败');
      }

      // 更新风险等级
      riskDetails.level = result.risk_level || '未知';
      setActiveRisk({ ...riskDetails });

      // 显示真实的推理步骤
      const steps = result.reasoning_steps || [];
      for (const step of steps) {
        const logType = step.message?.includes('风险等级') ? 'critical'
          : step.message?.includes('生成') || step.message?.includes('完成') ? 'success'
            : step.message?.includes('警告') ? 'warning' : 'info';
        addAgentLog(step.message, logType as any);
      }

      // 设置智能体生成的决策方案
      setAgentState('deciding');
      const plan = result.decision_plan || [];

      // 显示 RAG 检索结果
      const docs = result.retrieved_docs || [];
      if (docs.length > 0) {
        addAgentLog(`[知识库] 检索到 ${docs.length} 条相关规范`, 'info');
      }

      setAgentState('executing');
      setDecisionPlan(plan.map((p: any, idx: number) => ({
        step: p.step || idx + 1,
        action: p.action || '',
        auto: p.auto !== false,
        reason: p.reason || ''
      })));
      addAgentLog(`[执行层] 已生成 ${plan.length} 条管控指令`, 'success');

      // 设置 AI 分析报告
      if (result.report) {
        setAiAnalysis(result.report);
      }

    } catch (error: any) {
      console.error('[Agent] Error:', error);
      addAgentLog(`[错误] ${error.message || '智能体调用失败'}`, 'critical');

      // 降级：使用旧的 AI 问答方式
      setAgentState('executing');
      addAgentLog(`[降级] 使用简化模式生成处置建议...`, 'warning');
      await generateRiskReport(riskDetails, '风险已触发，请基于当前状态生成简报');
    }
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
            className={`px-3 py-1 rounded-full border flex items-center gap-2 text-xs font-bold transition-all duration-300 ${systemStatus === 'normal'
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

        {/* 右侧区域放大为主体 (占9列) */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-4">
          <Card title="智能风险管控中心" icon={AlertTriangle} className="h-full flex flex-col" alertLevel={activeRisk ? 'critical' : 'normal'}>
            {agentState !== 'idle' ? (
              <div className="flex h-full gap-4 animate-in fade-in slide-in-from-right-4 duration-500">

                {/* 左半部分：日志与决策 (占40%) */}
                <div className="w-[40%] flex flex-col gap-4">
                  <div className="bg-black/40 border border-slate-700 rounded p-3 h-1/2 flex flex-col font-mono overflow-hidden">
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
                            className={`${log.type === 'warning'
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

                  <div className="flex-1 overflow-y-auto relative bg-slate-900/30 p-2 rounded border border-slate-800">
                    {decisionPlan.length > 0 ? (
                      <div className="space-y-3 animate-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-cyan-400 text-sm font-bold uppercase flex items-center gap-1">
                            <GitBranch size={14} /> 自动生成管控策略
                          </h5>
                        </div>
                        {decisionPlan.map((plan, idx) => (
                          <div
                            key={idx}
                            className="flex gap-3 items-start bg-slate-800/80 p-3 rounded border-l-4 border-cyan-500 shadow-lg transform transition-all duration-500 hover:bg-slate-800"
                            style={{ animationDelay: `${idx * 200}ms` }}
                          >
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)]">
                              {plan.step}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-100 mb-1">{plan.action}</p>
                              <p className="text-[10px] text-slate-400">{plan.reason}</p>
                            </div>
                            {plan.auto && <CheckCircle2 size={16} className="text-green-500 ml-auto animate-in fade-in duration-500" />}
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
                </div>

                {/* 右半部分：深度简报 (占60%，作为主角) */}
                <div className="flex-1 flex flex-col">
                  {isAnalyzing && !aiAnalysis && (
                    <div className="h-full flex items-center justify-center bg-indigo-950/20 border border-indigo-500/30 rounded">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-indigo-400" size={32} />
                        <span className="text-sm text-indigo-300 font-bold tracking-wider animate-pulse">智能体正在生成深度简报...</span>
                      </div>
                    </div>
                  )}
                  {aiAnalysis && (
                    <div className="h-full bg-indigo-950/20 border border-indigo-500/30 rounded p-6 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-5 shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]">
                      <div className="flex items-center gap-3 mb-6 border-b border-indigo-500/30 pb-3">
                        <div className="bg-indigo-500/20 p-2 rounded text-indigo-400">
                          <Bot size={24} />
                        </div>
                        <span className="text-xl font-black text-indigo-100 tracking-wider">智能体深度简报</span>
                        <span className="ml-auto text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">AI GENERATED</span>
                      </div>

                      <div className="prose prose-invert prose-lg max-w-none">
                        {/* 简单的 Markdown 渲染替代方案 */}
                        {aiAnalysis.split('\n').map((line, i) => {
                          if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-cyan-300 mt-4 mb-2">{line.replace('### ', '')}</h3>;
                          if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-blue-300 mt-6 mb-3 border-l-4 border-blue-500 pl-3">{line.replace('## ', '')}</h2>;
                          if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-black text-white mt-6 mb-4">{line.replace('# ', '')}</h1>;
                          if (line.startsWith('- ')) return <li key={i} className="text-slate-300 ml-4 list-disc marker:text-cyan-500 mb-1">{line.replace('- ', '')}</li>;
                          if (line.startsWith('1. ')) return <li key={i} className="text-slate-300 ml-4 list-decimal marker:text-cyan-500 mb-1">{line.replace(/^\d+\. /, '')}</li>;
                          if (line.trim() === '') return <br key={i} />;
                          // 粗体渲染 **text**
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <p key={i} className="text-base leading-relaxed text-slate-200 mb-2">
                              {parts.map((part, j) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={j} className="text-white font-bold bg-white/10 px-1 rounded mx-0.5">{part.slice(2, -2)}</strong>;
                                }
                                return part;
                              })}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 bg-slate-900/30 rounded border border-slate-800/50 border-dashed">
                <Shield size={64} className="mb-4 text-slate-700" />
                <p className="text-lg font-bold text-slate-500">当前无风险事件</p>
                <p className="text-sm font-mono mt-2">智能体正在全域巡检中...</p>
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
                    className={`max-w-[85%] p-2 rounded-lg text-xs leading-relaxed ${msg.role === 'user'
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

                try {
                  // 优先使用 RAG 增强的智能体对话 API
                  const resp = await fetch(apiUrl('/api/agent/chat'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      message: msg,
                      context: {
                        system_status: systemStatus,
                        active_risk: activeRisk?.title || null
                      }
                    })
                  });

                  if (resp.ok) {
                    const data = await resp.json();
                    if (data.success && data.response) {
                      setChatHistory(prev => [...prev, { role: 'model', text: data.response }]);
                      setIsChatThinking(false);
                      return;
                    }
                  }
                } catch (err) {
                  console.warn('[Chat] Agent API failed, falling back to direct LLM');
                }

                // 降级：使用直接 LLM 调用
                const prompt = `用户提问: \"${msg}\"。当前系统处于${systemStatus}状态。${activeRisk ? `正在处理${activeRisk.title}风险。` : ''} 请简短回答。`;
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
