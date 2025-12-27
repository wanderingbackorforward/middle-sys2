# Vercel 一键部署（Flask 后端 + 前端静态）
## 分支与结构
- 分支：`vercel-flask`
- 前端：`frontend`（Vite 构建，输出 `dist`）
- 后端：`api/index.py`（Flask WSGI），依赖 `backend-flask/**`

## 环境变量
- `SUPABASE_URL`：你的 Supabase 项目 URL
- `SUPABASE_SERVICE_KEY`：Service Key
- `USE_SUPABASE`：`1` 读取真实数据；`0` 使用演示数据
- 可选（前端）：`VITE_DISABLE_SSE=1` 禁用 SSE，改为轮询

## Vercel 配置
- 文件：`vercel.json`
- 构建：
  - 前端：`@vercel/static-build`，源 `frontend/package.json`，`distDir: dist`
  - 后端：`@vercel/python`，源 `api/index.py`，`includeFiles: backend-flask/**`
- 路由：
  - `/api/(.*)` → `api/index.py`
  - `/(.*)` → `frontend/dist/$1`

## 本地说明
- 主分支：Docker/Spring 不变
- `flask-backend`：保留本地 Flask 运行
- `vercel-flask`：用于云端 Serverless，不要求本地复刻

## 注意
- SSE 在 Serverless 下连接可能被回收；可使用轮询
- 不使用后台定时任务；所有数据通过 REST 获取
