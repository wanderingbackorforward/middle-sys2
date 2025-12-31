# 隧道风险管控智能体集成说明

## 环境变量
- `GEMINI_API_KEY`: 用于后端代理调用 Google Generative Language API。
- 可选：`USE_SUPABASE=1` 与 `SUPABASE_URL`、`SUPABASE_SERVICE_KEY` 以启用真实数据读取。

## 后端运行
- 目录：`backend-flask`
- 命令：`python app.py`
- 端口：`8081`
- 新增接口：
  - `POST /api/ai/gemini`：AI代理，入参 `{prompt, systemInstruction?}`。
  - `GET /api/stream/<topic>`：SSE订阅，主题包括 `tunnel-risk` 与 `sensors`。
  - `POST /api/dev/push-risk`：开发演示推送风险事件到 `tunnel-risk`。
  - `POST /api/dev/push-sensors`：开发演示推送传感器数据到 `sensors`。

## 前端运行
- 目录：`frontend`
- 安装依赖：`npm install`
- 启动开发：`npm run dev`
- 页面入口：
  - `/tunnel-agent` 风险智能体
  - 顶部导航已新增“风险智能体”入口

## 联调演示
- 推送风险事件示例：
  - `POST http://localhost:8081/api/dev/push-risk`，Body: `{"type":"gas"}`
- 推送传感器示例：
  - `POST http://localhost:8081/api/dev/push-sensors`，Body: `{"gas":0.9,"pressure":2.8}`

## 说明
- 前端已将 AI 调用统一走后端代理，避免密钥暴露。
- SSE在线时前端优先使用实时事件；无数据时可用页面内“模拟风险场景”进行演示。
