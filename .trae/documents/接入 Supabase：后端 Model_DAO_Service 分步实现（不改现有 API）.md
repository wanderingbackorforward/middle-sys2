## 前提与边界
- 不改 Controller/SSE 与网页行为，先接入数据库读取层；等验证正确后再切换数据源。
- 不提交任何密钥；通过环境变量注入：`SUPABASE_URL`、`SUPABASE_SERVICE_KEY`。
- 数据源：Supabase PostgREST（默认 `public` schema），已创建的表包括：`settlement_actual/predict/alarm_trend/risks` 等。

## 配置与客户端
- 配置类 `SupabaseProperties`：读取 `SUPABASE_URL`、`SUPABASE_SERVICE_KEY`（Spring `@ConfigurationProperties` 或直接 `@Value`）。
- HTTP 客户端 `SupabaseClient`（基于 Spring WebClient，阻塞模式即可）：
  - 基础路径：`<SUPABASE_URL>/rest/v1/`
  - Header：`apikey: <serviceKey>`、`Authorization: Bearer <serviceKey>`、`Accept: application/json`
  - 通用查询构造：`GET <table>?select=*&order=ts.desc&limit=<N>`；区间查询：`ts=gte.<from>&ts=lt.<to>`

## Model（实体映射）
- `SettlementPoint{ Instant ts, double value }`
- `AlarmPoint{ Instant ts, int value }`
- `RiskEvent{ Instant ts, String level, String name, String status, String description, String code }`
- 其余模块（dashboard/personnel/progress）实体同现有 API 字段：
  - `AdvanceSpeedPoint{ ts, value }`, `SlurryPressurePoint{ ts, value }`, `GasConcentrationPoint{ ts, value }`
  - `DashboardSummary{ ringToday, ringCumulative, muckToday, slurryPressureAvg, cameraOnline, cameraTotal }`
  - `AttendancePoint{ ts, value }`, `PersonnelStats{ totalOnSite, attendanceRate, violations, managers }`
  - `ProgressDailyRing{ ts, value }`, `ProgressStats{ totalRings, totalGoal, dailyRings, remainingDays, value }`

## DAO（每模块独立）
- `SafetyDao`
  - `List<SettlementPoint> fetchSettlementActualRecent(int limit)` → `settlement_actual`
  - `List<SettlementPoint> fetchSettlementPredictRecent(int limit)` → `settlement_predict`
  - `List<AlarmPoint> fetchAlarmTrendRecent(int limit)` → `alarm_trend`
  - `List<RiskEvent> fetchRisksRecent(int limit)` → `risks`
- `DashboardDao`
  - `List<AdvanceSpeedPoint> fetchAdvanceSpeedRecent(int limit)` → `advance_speed`
  - `List<SlurryPressurePoint> fetchSlurryPressureRecent(int limit)` → `slurry_pressure`
  - `List<GasConcentrationPoint> fetchGasConcentrationRecent(int limit)` → `gas_concentration`
  - `Optional<DashboardSummary> fetchLatestSummary()` → `summary?order=ts.desc&limit=1`
- `PersonnelDao`
  - `List<AttendancePoint> fetchAttendanceTrendRecent(int limit)` → `attendance_trend`
  - `Optional<PersonnelStats> fetchLatestStats()` → `stats?order=ts.desc&limit=1`
- `ProgressDao`
  - `List<ProgressDailyRing> fetchDailyRingsRecent(int limit)` → `daily_rings`
  - `Optional<ProgressStats> fetchLatestStats()` → `stats_progress?order=ts.desc&limit=1`

## Service（业务层）
- 对应模块 Service 简单封装 DAO：提供“最近N点”和“最新汇总”的读方法，供后续 Controller/SSE 调用。
- 暂时保留现有随机数据生成；完成验证后，将 SSE Scheduler 改为调用 Service 返回数据。

## 验证
- 编写最简单的集成验证（或在启动日志里打印）从 Supabase 读取：
  - `settlement_actual` 返回至少 1 条（你已插入 `10.3`）。
  - `risks` 返回刚插入的 `一级风险` 事件。
- `curl`/PostgREST 验证（便于独立测试）：
  - `GET <SUPABASE_URL>/rest/v1/settlement_actual?select=*&order=ts.desc&limit=10`

## 切换数据源（下一步）
- 在确认所有 DAO/Service 返回正确后，逐步把 SSE Scheduler 的随机推送改为 Service 读库的推送；保持对外 JSON 结构与字段一致，前端无需改动。

## 安全与迁移
- 密钥只放环境变量；代码不读取 publishable key。
- 表结构已按通用时序设计，迁移到 Timescale/ClickHouse 时仅需替换 DAO 实现。

确认后，我将按此结构创建后端的配置、客户端、实体、DAO 与 Service，并完成基础验证（不动 Controller/SSE）。