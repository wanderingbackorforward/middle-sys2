## 总览
- 目标：仅替换后端为 Flask，保留前端与交互完全一致（HTTP 与 SSE）。
- 兼容性：端口继续使用 `8081`，所有路由前缀与响应结构保持与现有 Spring Boot 一致。
- 数据源：镜像当前 Supabase REST 访问方式与表结构；在不可用时提供演示数据回退，保证页面渲染与 SSE 更新一致。

## 端口与路由兼容
- 服务端口：Flask 运行在 `http://localhost:8081`（沿用 `application.properties` 中 `server.port=8081`）。
- 路由前缀：统一使用 `/api/*`。
- 路由映射：完全对齐现有控制器。
  - `/api/dashboard/summary`、`/api/dashboard/notifications`、`/api/dashboard/supplies`、`/api/dashboard/dispatch`、`/api/dashboard/timeseries`
  - `/api/personnel/stats`、`/api/personnel/distribution`、`/api/personnel/list`、`/api/personnel/attendanceTrend`
  - `/api/progress/stats`、`/api/progress/gantt`、`/api/progress/dailyRings`
  - `/api/safety/risks`、`/api/safety/settlement`、`/api/safety/score`、`/api/safety/alarmTrend`、`/api/safety/verify`
  - `/api/video/list`
  - SSE：`/api/stream/dashboard`、`/api/stream/personnel`、`/api/stream/safety`、`/api/stream/progress`

## 依赖与环境
- Python 依赖：`Flask`、`flask-cors`、`requests`、`APScheduler`（定时任务）、`python-dotenv`（可选）。
- 环境变量：`SUPABASE_URL`、`SUPABASE_SERVICE_KEY`（仅服务端使用，走 `apikey` 与 `Authorization: Bearer`）。
- 安全：不在日志或响应中暴露密钥；仅服务器调用 Supabase。

## 项目结构
- `backend-flask/`
  - `app.py`（入口、路由注册、CORS、SSE 初始化、调度器启动）
  - `supabase_client.py`（REST 封装：通用 `get_list(table, select, order, limit)` 等）
  - `services/`（`dashboard.py`、`personnel.py`、`progress.py`、`safety.py`、`video.py`）
  - `stream/`（SSE 管理：订阅注册、广播、心跳；`scheduler.py` 定时拉取最新数据并发布）
  - `schemas/`（统一结构适配与字段对齐，保证 JSON 形态与前端使用一致）

## Supabase 适配
- 访问方式：`GET ${SUPABASE_URL}/rest/v1/{table}?select=*&order=ts.desc&limit={N}`，头部：`apikey` 与 `Authorization: Bearer {SERVICE_KEY}`。
- 表与字段：镜像当前工程使用的所有表（时序、统计、列表）。
- 时间字段：返回 `ISO-8601` 字符串或毫秒时间戳，统一在服务层格式化为前端消费的形态。

## REST 接口对齐
- 响应结构与字段名保持一致，示例：
  - `/api/dashboard/notifications` → `[{ time, type, content }]`（对应：`backend/src/main/java/com/example/tunnel/controller/DashboardController.java:37`）。
  - `/api/dashboard/summary` → `{ projectName, lat, lng, cameraOnline, cameraTotal, ringToday, ringCumulative, muckToday, slurryPressureAvg, gasAlerts }`。
  - 其他接口严格按照前端当前期望（已全面梳理）。
- 静态演示数据的接口（如 `gantt`、部分 `list`）在 Flask 中直接返回等价的固定数据结构。

## SSE 实时流对齐
- 事件格式：
  - 初次连接立即发送 `event: heartbeat`，`data: "ok"`。
  - 后续业务消息发送 `event: message`，`data` 为 JSON：`{ channel: string, payload: any }`。
- 频道命名与负载：
  - `dashboard.advanceSpeed`、`dashboard.slurryPressure`、`dashboard.gasConcentration`、`dashboard.summary`
  - `personnel.attendanceTrend`、`personnel.stats`
  - `progress.dailyRings`、`progress.stats`
  - `safety.settlement.actual`、`safety.settlement.predict`、`safety.alarmTrend`
- 客户端管理：为每个主题维护订阅集合；心跳与断线清理；指数退避由前端现有逻辑负责。

## 调度与推送
- 使用 `APScheduler` 按固定频率拉取各表最新一条记录并广播到对应频道。
- 频率对齐现有行为（1–4 秒范围），确保前端图表与列表增量更新一致。
- 数据不可用时采用平滑回退（跳过推送或推送演示值），避免前端闪断。

## CORS 与代理
- 启用 `flask-cors`，允许 `GET` 与 `text/event-stream`。
- 保持前端 `vite` 代理配置不变：`/api` → `http://localhost:8081`。

## 启动与运行
- 安装依赖并运行：`python app.py`（开发模式可启用 `debug=False`，端口 `8081`）。
- 生产部署可用 `gunicorn --workers 1 --threads 8 --bind 0.0.0.0:8081 app:app`。

## 验证方案
- REST：`curl http://localhost:8081/api/dashboard/summary` 等检查关键字段。
- SSE：`curl -N http://localhost:8081/api/stream/dashboard`，确认收到 `heartbeat` 与 `message`，`channel` 与 `payload` 正确。
- 前端联调：保持 `npm run dev`，访问所有页面，核对图表、表格与实时流更新与现状一致。

## 迁移步骤
1. 新建 Flask 后端目录与基础代码，配置端口与 CORS。
2. 实现 Supabase 客户端与服务层，完成 REST 接口响应对齐。
3. 实现 SSE 管理与调度器，完成频道与事件格式对齐。
4. 本地联调与自动化验证（REST + SSE）。
5. 替换启动方式（停止 Spring Boot，启动 Flask），前端无需修改。

## 风险与注意事项
- Supabase 性能与限流：建议为拉取最新数据设置 `limit=1` 与必要索引；调度频率避免过高。
- 时间字段统一：确保 `ts` 一致（毫秒/ISO），避免前端解析差异。
- 资源清理：SSE 客户端断开后的资源释放，防止内存泄漏。
- 密钥安全：仅服务端使用 `SERVICE_KEY`；避免任何客户端暴露。