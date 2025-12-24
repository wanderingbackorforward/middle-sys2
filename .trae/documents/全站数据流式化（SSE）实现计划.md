## 总体方案
- 技术路线：后端使用 Server-Sent Events (SSE) 推送实时数据；前端使用 `EventSource` 接收并增量更新各图表与指标。
- 保留现有 REST 接口用于初始快照加载；新增 `/api/stream/*` 流式接口用于持续更新。
- 统一时序数据结构：`{ ts: string, value: number }`，必要时附加字段（如 `{ ts, value, ring }`）。

## 后端实现
- 新增 `StreamingController`（或分模块 `DashboardStreamController` 等）：
  - `GET /api/stream/dashboard`：推送 `advanceSpeed`, `slurryPressure`, `gasConcentration`, 以及 `summary` 中的 KPI 变化（`ringToday`, `muckToday`, `slurryPressureAvg`, `cameraOnline`）。
  - `GET /api/stream/personnel`：推送 `attendanceTrend` 增量点，偶发推送 `stats` 更新。
  - `GET /api/stream/safety`：推送 `settlement.actual` 增量与 `predict` 更新、`alarmTrend` 日增量、`risks` 事件变更。
  - `GET /api/stream/progress`：推送 `dailyRings` 增量、`stats` 变化（`totalRings`, `dailyRings`）。
- 推送方式：Spring Boot 3 使用 MVC `SseEmitter` 或 WebFlux `Flux`（`MediaType.TEXT_EVENT_STREAM`）。推荐 MVC + `SseEmitter` 以便最小改动。
- 定时任务：`@Scheduled(fixedRate=1000~3000ms)` 驱动生成模拟数据并广播到 emitter 注册表；按模块维护 `Set<SseEmitter>` 并在完成或异常时清理。
- 事件封装：统一 `ServerEvent { channel: string, payload: any }`，SSE `id/event/data` 三字段；心跳 `channel: "heartbeat"`。
- CORS/代理：允许前端来源；当前 Vite 代理已指向 `8081`，无需变更。

## 前端集成
- 新增通用流式工具：`src/utils/sse.ts`
  - `connectSSE(url: string, handlers: Record<string, (payload)=>void>)`
  - 自动重连（指数退避），心跳监测，组件卸载时关闭。
- 页面改造（保持现状 UI）：
  - 安全大屏：初始通过 REST 加载快照；随后订阅 `/api/stream/dashboard`，将到来的各 `channel` 追加到对应 ECharts 系列，KPI 用最新值覆盖。
  - 人员管理：订阅 `/api/stream/personnel` 更新出勤折线与 `stats`；表格可保留静态或偶发刷新。
  - 安全管理：订阅 `/api/stream/safety` 增量追加沉降/预测曲线与报警趋势；风险列表收到事件时替换或插入。
  - 进度管理：订阅 `/api/stream/progress` 追加每日环数、更新顶部统计。
- 图表缓冲：统一保留最近 N 点（例如 300 点）；到达上限时移除最旧点。
- 交互与状态：在 Header 显示 `SYNC: ONLINE/RECONNECTING`；每页显示流连通状态（可选）。

## 数据通道与示例
- `dashboard.advanceSpeed` → `[{ts,value}]`
- `dashboard.slurryPressure` → `[{ts,value}]`
- `dashboard.summary` → `{ ringToday, muckToday, slurryPressureAvg, cameraOnline }`
- `personnel.attendanceTrend` → `[{ts,value}]`, `personnel.stats` → `{ totalOnSite, violations ... }`
- `safety.settlement.actual/predict` → `[{ts,value}]`, `safety.alarmTrend` → `[{ts,value}]`, `safety.risks` → `[{ts, level, name, status, ...}]`
- `progress.dailyRings` → `[{ts,value}]`, `progress.stats` → `{ totalRings, dailyRings, remainingDays, value }`

## 可靠性与性能
- 后端：
  - emitter 超时与断开清理；限制最大连接数；心跳每 10s；推送频率控制（KPI 2s，曲线 1s）。
  - 使用线程安全集合维护订阅；异常保护避免任务中断。
- 前端：
  - 自动重连策略（1s, 2s, 5s, 10s 上限）；去抖与节流（UI 每 200ms 刷新）；避免内存泄露。

## 验证与回归
- 启动后端与前端，打开各页面观察曲线实时滚动与 KPI 变化。
- 断网/后端重启时，前端显示 RECONNECTING 并自动恢复。
- 加入简单端到端测试（可选）：在控制台打印每通道收到的点数，以验证持续性。

## 交付内容
- 新控制器与服务类（SSE 广播与定时任务）。
- 前端通用 SSE 客户端工具与每页订阅集成。
- 文档：通道列表与数据格式说明、频率与心跳策略、重连说明。

请确认，我将按此计划实现后端 SSE 推流与前端订阅集成，并完成全站流式化验证。