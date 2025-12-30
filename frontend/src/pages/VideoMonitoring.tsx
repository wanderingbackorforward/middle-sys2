import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VideoTile from '../components/VideoTile';

const VideoMonitoring: React.FC = () => {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/video/list');
        setVideos(res.data);
      } catch (error) {
        console.error("Error fetching video data", error);
      }
    };
    fetchData();
  }, []);

  const fallbackStreams = [
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    'https://test-streams.mux.dev/tears_of_steel/playlist.m3u8',
    'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
  ];
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newStatus, setNewStatus] = useState('在线');
  const addCamera = async () => {
    try {
      const res = await axios.post('/api/video/add', { name: newName, streamUrl: newUrl, status: newStatus });
      setVideos(prev => [...prev, res.data.item]);
      setShowAdd(false);
      setNewName('');
      setNewUrl('');
      setNewStatus('在线');
    } catch (e) {}
  };

  return (
    <div className="h-full p-2">
      <div className="grid grid-cols-3 gap-4 h-full">
        {videos.map((video, idx) => (
          <VideoTile
            key={video.id || idx}
            title={video.name || `摄像头${idx + 1}`}
            url={video.streamUrl || fallbackStreams[idx % fallbackStreams.length]}
            status={video.status || '在线'}
          />
        ))}
        
        {/* Add one empty slot for "Add Monitor" */}
        <div onClick={() => setShowAdd(true)} className="tech-card flex flex-col justify-center items-center cursor-pointer hover:bg-white/5 transition-colors group">
            <div className="w-16 h-16 rounded-full border-2 border-gray-600 flex justify-center items-center text-gray-400 group-hover:border-cyan-500 group-hover:text-cyan-500 transition-all">
                <span className="text-4xl">+</span>
            </div>
            <div className="mt-4 text-gray-500 group-hover:text-cyan-500">添加监控画面</div>
        </div>
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-cyan-500 p-6 rounded w-[420px]">
            <div className="text-white font-bold mb-4">新增监控画面</div>
            <div className="space-y-3">
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="名称" className="w-full p-2 rounded bg-black/40 border border-gray-700 text-white" />
              <input value={newUrl} onChange={e=>setNewUrl(e.target.value)} placeholder="HLS 地址（.m3u8）" className="w-full p-2 rounded bg-black/40 border border-gray-700 text-white" />
              <select value={newStatus} onChange={e=>setNewStatus(e.target.value)} className="w-full p-2 rounded bg-black/40 border border-gray-700 text-white">
                <option value="在线">在线</option>
                <option value="离线">离线</option>
              </select>
              <div className="flex gap-2 mt-2">
                <button onClick={addCamera} className="px-4 py-2 bg-cyan-600 rounded text-white">添加</button>
                <button onClick={()=>setShowAdd(false)} className="px-4 py-2 bg-gray-700 rounded text-white">取消</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoMonitoring;
