import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import SafetyDashboard from './pages/SafetyDashboard';
import PersonnelManagement from './pages/PersonnelManagement';
import SafetyManagement from './pages/SafetyManagement';
import VideoMonitoring from './pages/VideoMonitoring';
import ProgressManagement from './pages/ProgressManagement';
import MapLanding from './pages/MapLanding';
import DigitalShield from './pages/DigitalShield';
import GroutingPage from './pages/GroutingPage';
import TunnelingPage from './pages/TunnelingPage';
import TunnelRiskAgent from './pages/TunnelRiskAgent';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<MapLanding />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/landing" replace />} />
          <Route path="dashboard" element={<SafetyDashboard />} />
          <Route path="personnel" element={<PersonnelManagement />} />
          <Route path="safety" element={<SafetyManagement />} />
          <Route path="video" element={<VideoMonitoring />} />
          <Route path="progress" element={<ProgressManagement />} />
          <Route path="digital-shield" element={<DigitalShield />} />
          <Route path="grouting" element={<GroutingPage />} />
          <Route path="tunneling" element={<TunnelingPage />} />
          <Route path="tunnel-agent" element={<TunnelRiskAgent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
