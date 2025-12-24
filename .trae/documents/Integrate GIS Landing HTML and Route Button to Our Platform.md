## 意图理解
- 以 `gis-platform.html` 为“进入平台的第一屏”（地图落地页）。
- 地图页中的“监控平台”按钮，原来跳外部地址；改为跳转到我们当前项目的首页（React 平台）。

## 集成方案
- 将地图 HTML 放在 `frontend/public/` 下，以便通过 Vite 直接静态访问：
  - `frontend/public/gis-platform.html`
  - 若有第二个文件（例如 `yangzhou-railway-command-center.html`），同样放入 `public/`。
- 新增 React 路由页 `MapLanding.tsx`，用全屏 `iframe` 嵌入地图 HTML：
  - `src/pages/MapLanding.tsx`：`<iframe src="/gis-platform.html" ... />` 全屏，无边框。
- 修改 `App.tsx` 路由，使默认入口进入地图：
  - `Route index` 改为指向 `<MapLanding />`（或 `Navigate to="/landing"`），新增路由 `path="/landing"`。
  - 保留原业务路由（`/`, `/personnel`, `/safety`, `/video`, `/progress`）。

## 按钮跳转逻辑
- 修改地图 HTML 中按钮点击逻辑：
  - 将 `openMonitorPlatform()` 的跳转地址从外链改为本项目首页：`window.location.href = '/'`。
  - 如需在新标签打开，改为 `window.open('/', '_blank', 'noopener,noreferrer')`；默认建议同标签进入首页。
- 若地图页中存在 `visitProjectWebsite()` 指向另一个大屏 HTML（例如演示页），可以保留；若也希望进入 React 首页，同样改为 `window.location.href = '/'`。

## 细节与兼容
- 开发环境：`http://localhost:5174/`，`'/'` 即首页；生产部署同样保持相对路径。
- 如果未来部署在子路径（如 `/app/`），可将跳转改用 `window.location.origin + basePath` 或从 `window.__APP_BASE__` 读取。

## 验证步骤
- 启动前端后访问 `http://localhost:5174/`：默认显示地图页（iframe 内的 `gis-platform.html`）。
- 点击地图中的“监控平台”按钮：浏览器同标签跳转到 React 首页（原平台主界面）。
- 其他业务页面路由正常可达。

## 代码改动点（说明）
- 新增：`src/pages/MapLanding.tsx`
- 修改：`src/App.tsx` 默认路由
- 修改：`public/gis-platform.html` 中 `openMonitorPlatform()`（和必要的另一个按钮函数）跳转地址改为 `'/'`

请确认，我将按上述步骤落地实现，并在本地验证点击行为与入口路由无误。