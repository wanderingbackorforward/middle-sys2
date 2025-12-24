### 目标
- 将所有后端数据改为 **盾构隧道场景（扬州）**，去除交通/上海内容。
- 将主要指标与图表改为 **时序数据**（包含时间戳），前端统一按时间轴展示并以最新值驱动卡片/仪表。

### 后端改造
- 统一返回时间戳格式：`ISO-8601`（示例：`2025-12-24T16:00:00Z`）。
- 统一时序点结构：`{ ts: string, value: number }`，必要时扩展字段（如 `{ ts, ring, pressure }`）。
- **安全大屏 `/api/dashboard`**
  1. `GET /api/dashboard/summary`
     - 字段：`projectName: "江苏扬州地铁盾构隧道工程"`, `lat: 32.3942`, `lng: 119.4070`, `cameraOnline`, `cameraTotal`, `ringToday`, `ringCumulative`, `muckToday(m3)`, `slurryPressureAvg(MPa)`, `gasAlerts`
  2. `GET /api/dashboard/timeseries`
     - `advanceSpeed`: `[{ts,value}]`（环/小时）
     - `slurryPressure`: `[{ts,value}]`（MPa）
     - `gasConcentration`: `[{ts,value}]`（ppm）
  3. `GET /api/dashboard/notifications`
     - 扩展为隧道事件（类别：`掘进/设备/注浆/监测/安全`），地点文本指向扬州区间。
  4. `GET /api/dashboard/supplies` 保留但更贴近工地（`注浆料/水泥/防护用品/应急照明/其他`）。

- **人员管理 `/api/personnel`**
  1. `GET /api/personnel/stats` 保留字段（在场人数、出勤率、违规、管理人员）。
  2. 新增 `GET /api/personnel/attendanceTrend`：`[{ts,value}]`（每小时在场人数）。
  3. `GET /api/personnel/distribution` 保留。
  4. `GET /api/personnel/list` 保留（地点改为扬州区间里程）。

- **安全管理 `/api/safety`**
  1. `GET /api/safety/settlement`：`actual: [{ts,value}]`、`predict: [{ts,value}]`，单位 mm。
  2. `GET /api/safety/alarmTrend`：`[{ts,value}]`（每日预警数）。
  3. `GET /api/safety/risks`：风险卡片改为扬州区间事件，并附上 `ts`（发生或进入风险窗口时间）。
  4. `GET /api/safety/score`：评分维持，但也提供 `scoreTrend: [{ts,value}]`。

- **视频 `/api/video/list`** 保持不变（仅文案与标题改为扬州场景）。

- **进度管理 `/api/progress`**
  1. `GET /api/progress/stats` 保留。
  2. 新增 `GET /api/progress/dailyRings`：`[{ts,value}]`（按天环数）。
  3. `GET /api/progress/gantt` 保留（文本换为扬州工序）。

### 前端改造
- ECharts 全部改为 `xAxis.type = 'time'`。
- **安全大屏**：
  - 左侧卡片：从时序最新值驱动（`ringToday`, `muckToday`, `slurryPressureAvg`）。
  - 右侧仪表：用最新覆盖率；新增折线区块（`advanceSpeed` / `slurryPressure`）。
  - 通知列表：显示扬州区间、事件类别。
  - 地图定位到扬州经纬度。
- **人员管理**：在左侧新增出勤折线（`attendanceTrend`），表格地点改为扬州里程。
- **安全管理**：沉降与预测使用时间轴；报警趋势按天时间序；评分可加微型趋势图。
- **进度管理**：顶部卡片不变，新增每日环数柱状图（时间轴）。

### 校验
- 更新前端请求到新接口；调试各页数据加载与图表渲染。
- 保持现有端口：后端 `8081`、前端代理已指向 `8081`。

### 交付
- 修改所有 Controller 返回结构与内容为扬州盾构场景并时序化。
- 更新所有页面图表与卡片的数据绑定与时间轴配置。
- 完成端到端验证（接口返回、前端渲染、交互无报错）。