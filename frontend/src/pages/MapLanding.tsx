import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MapLanding = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'NAVIGATE' && typeof data.path === 'string') {
        navigate(data.path);
      }
    };
    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
    };
  }, [navigate]);
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000' }}>
      <iframe
        src="/gis-platform.html"
        title="GIS Platform"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
};

export default MapLanding;
