I will build a pixel-perfect data visualization platform with a React frontend and Spring Boot backend, focusing on the visual replication and API integration as requested.

### **Project Structure**
- **Root Directory**: `middle-sys2/`
  - `frontend/`: React (Vite) + TypeScript + Tailwind CSS
  - `backend/`: Spring Boot (Java 17+)

### **Phase 1: Project Initialization & Setup**
1.  **Backend (Spring Boot)**:
    -   Initialize a Spring Boot project.
    -   Dependencies: `spring-boot-starter-web`, `lombok`.
    -   Configure application properties (server port 8080).
2.  **Frontend (React)**:
    -   Initialize with Vite (`npm create vite@latest`).
    -   Install dependencies: `axios`, `react-router-dom`, `echarts`, `echarts-for-react`, `antd` (for complex tables), `tailwindcss` (for styling).
    -   Configure Tailwind CSS for the "Dark/Cyberpunk" theme (custom colors: neon blue, dark bg).

### **Phase 2: Backend Implementation (API Layer)**
Create REST Controllers to provide mock data for all screens (skipping Service/DAO as requested):
1.  **`DashboardController`**: APIs for "Safety Dashboard" (duty stats, security data, notifications, map data).
2.  **`PersonnelController`**: APIs for "Personnel Management" (attendance stats, team distribution, entry logs).
3.  **`SafetyController`**: APIs for "Safety Management" (settlement data, risk sources, alarm trends).
4.  **`VideoController`**: APIs for "Video Monitoring" (camera list, stream URLs/images).
5.  **`ProgressController`**: APIs for "Progress Management" (KPIs, Gantt chart data).

### **Phase 3: Frontend Implementation (Pixel-Perfect UI)**
1.  **Global Layout**:
    -   Implement the "Head-up Display" (HUD) style header with Title, Weather, Time, and Navigation Tabs.
    -   Apply a global dark background image/gradient consistent with the provided screenshots.
2.  **Page 1: Safety Dashboard (安全大屏)**
    -   Left: Statistics cards, Real-time notification list.
    -   Center: Map component (using image/canvas for visual match), Event detail popup.
    -   Right: Monitoring gauge, Bar charts, Dispatch table.
3.  **Page 2: Personnel Management (人员管理)**
    -   Top: 4 KPI Cards.
    -   Left: Donut chart (Team distribution).
    -   Right: Styled Table (Entry/Exit records).
4.  **Page 3: Safety Management (安全管理)**
    -   Charts: Line chart (Settlement), Pie chart (Risk levels), Bar chart (Alarms).
    -   Lists: Risk source management cards.
5.  **Page 4: Video Monitoring (视频监控)**
    -   Grid layout (3x2) with camera feeds (mocked with static images/placeholders).
6.  **Page 5: Progress Management (进度管理)**
    -   Top: Progress KPI cards.
    -   Bottom: Custom Gantt chart visualization (using CSS/divs or a chart library).

### **Phase 4: Integration & Verification**
1.  **API Connection**: Configure Vite proxy to forward `/api` requests to `localhost:8080`.
2.  **Data Binding**: Replace static frontend constants with `axios` calls to the Spring Boot backend.
3.  **Verification**: Ensure all charts load data from the backend and the UI matches the screenshots.

### **Tech Stack**
-   **Frontend**: React 18, TypeScript, Tailwind CSS, ECharts, Ant Design.
-   **Backend**: Java, Spring Boot 3.x.
