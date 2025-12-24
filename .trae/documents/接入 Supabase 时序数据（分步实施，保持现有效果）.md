## 总体目标
- 将所有数据源改为来自云端时序数据库（Supabase / PostgREST），保持现有前后端效果一致（API/页面无感）。
- 采用分层改造：Model → DAO → Service → 最后替换 Controller/API；在替换 API 前，网页不变化。
- 严格不提交敏感信息；通过环境变量管理 Supabase URL 与 Service Key。

## 步骤 0：Git 提交当前状态（不改代码）
- 提交现有工作成果，作为改造前基线。
- 不包含任何密钥或配置变更。

## 步骤 1：云端数据库建模（Supabase SQL）
在 Supabase SQL Editor 创建以下表与索引（面向时序场景，字段统一 `ts TIMESTAMPTZ`，`value` 数值）：
- dashboard
  - advance_speed(ts TIMESTAMPTZ NOT NULL, value DOUBLE PRECISION NOT NULL)
  - slurry_pressure(ts TIMESTAMPTZ NOT NULL, value DOUBLE PRECISION NOT NULL)
  - gas_concentration(ts TIMESTAMPTZ NOT NULL, value DOUBLE PRECISION NOT NULL)
  - summary(ts TIMESTAMPTZ NOT NULL, ring_today INT, ring_cumulative INT, muck_today DOUBLE PRECISION, slurry_pressure_avg DOUBLE PRECISION, camera_online INT, camera_total INT)
  - 索引：`CREATE INDEX ON advance_speed(ts);` 等
- personnel
  - attendance_trend(ts TIMESTAMPTZ NOT NULL, value INT NOT NULL)
  - stats(ts TIMESTAMPTZ NOT NULL, total_on_site INT, attendance_rate TEXT, violations INT, managers INT)
  - 分页/时间查询索引
- safety
  - settlement_actual(ts TIMESTAMPTZ NOT NULL, value DOUBLE PRECISION NOT NULL)
  - settlement_predict(ts TIMESTAMPTZ NOT NULL, value DOUBLE PRECISION NOT NULL)
  - alarm_trend(ts TIMESTAMPTZ NOT NULL, value INT NOT NULL)
  - risks(ts TIMESTAMPTZ NOT NULL, level TEXT, name TEXT, status TEXT, desc TEXT, code TEXT)
- progress
  - daily_rings(ts TIMESTAMPTZ NOT NULL, value INT NOT NULL)
  - stats(ts TIMESTAMPTZ NOT NULL, total_rings INT, total_goal INT, daily_rings INT, remaining_days INT, value INT)
- 备注：如需更强时序能力，可后续迁移到带分区/压缩的方案（例如 Timescale/ClickHouse）；表设计已保持通用性以便迁移。

## 步骤 2：安全配置（不提交密钥）
- 在后端配置环境变量（不写入代码）：
  - `SUPABASE_URL=https://komlrqbghyirkykmibrx.supabase.co`
  - `SUPABASE_SERVICE_KEY=<服务端密钥>`（仅后端使用，绝不暴露给前端）
- 后端采用 Supabase PostgREST 接口访问：`{SUPABASE_URL}/rest/v1/<table>`，Headers：
  - `apikey: SUPABASE_SERVICE_KEY`
  - `Authorization: Bearer SUPABASE_SERVICE_KEY`

## 步骤 3：后端分层改造（不改 Controller）
- Model（Java）
  - 建立对应实体：`AdvanceSpeedPoint{ts, value}`、`SlurryPressurePoint{ts, value}`、`DashboardSummary{...}` 等
- DAO（基于 WebClient/RestTemplate + PostgREST）
  - 通用查询：最近 N 点：`GET /rest/v1/<table>?select=*&order=ts.desc&limit=N`
  - 区间查询：`GET ...&ts=gte.<from>&ts=lt.<to>`
  - 扩展：插入数据（后续可用），现阶段仅读
- Service
  - 提供方法供现有 SSE Scheduler 或 Controller 调用：
    - `getAdvanceSpeedRecent(int limit)`、`getSlurryPressureRecent(...)`、`getDashboardSummaryLatest()` 等
  - 暂时在 SSE Scheduler 中用 Service 拉取最新数据替代随机生成（先只拉取，不改变对外 API）。

## 步骤 4：验证 Service/DAO（不影响网页）
- 本地通过日志打印/单元测试验证 DAO 查询返回与 Model 映射正确。
- 确保 Supabase 表有初始数据（可在 SQL Editor 插入样例），Service 能正确返回。

## 步骤 5（关键一跃）：替换 API 与 SSE 数据源
- 在确保查询正确后，逐一替换 Controller/SSE Scheduler 所调用的随机数据为 Service 返回数据。
- 保持现有 JSON 结构与字段名一致（遵从一致性原则），前端无需改动。

## 迁移与扩展
- 将来如需迁移到其他时序库（Timescale/ClickHouse），保持 Service/DAO 接口不变，仅更换实现。

## 注意事项
- 切勿把 `Publishable key` 或 `Secret keys` 写入仓库文件；仅通过环境变量注入。
- 前端保持现状，直到后端 API 数据源替换完成。

请确认上述分步方案。确认后我将：先提交当前代码→在 Supabase 云端创建表→实现 Model/DAO/Service→验证→最后替换 API 数据源（网页保持不变直至替换）。