## 根因定位
- 前端 `vite` 代理到 `http://localhost:8080`（`vite.config.ts` 的 `/api` 代理）。
- 浏览器/控制台报错 `http proxy error ECONNREFUSED`，说明 8080 没有服务在监听。
- 结论：后端 Spring Boot 未启动，导致前端看不到数据。

## 安装 JDK 17 与 Maven（Windows）
- 使用 `winget` 安装：
  - 安装 JDK 17：`winget install EclipseAdoptium.Temurin.17.JDK`
  - 安装 Maven 3.9：`winget install Apache.Maven`
- 验证安装：
  - `java -version` 应显示 `17`
  - `mvn -v` 应显示 Maven 版本与 JDK 17。
- 如无 `winget`，可用 `choco` 备选：
  - `choco install temurin17`
  - `choco install maven`

## 启动后端（Spring Boot）
- 进入后端目录：`cd backend`
- 启动开发服务：`mvn -q -DskipTests spring-boot:run`
- 或打包运行：
  - `mvn -q -DskipTests package`
  - `java -jar target\tunnel-monitor-0.0.1-SNAPSHOT.jar`

## 运行验证
- 访问以下接口确认返回数据：
  - `http://localhost:8080/api/dashboard/summary`
  - `http://localhost:8080/api/personnel/stats`
  - `http://localhost:8080/api/safety/risks`
  - `http://localhost:8080/api/video/list`
  - `http://localhost:8080/api/progress/stats`
- 前端保持运行在 `http://localhost:5174/`；刷新后各图表与表格应自动展示来自后端的 Mock 数据。

## 可选增强（便于后续开发）
- 添加 Maven Wrapper：`mvn -N wrapper -Dmaven=3.9.9`，后续可用 `./mvnw.cmd spring-boot:run` 无需全局 Maven。

请确认，我将立即在本机安装并启动后端，完成验证。