import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

  // Placeholder images mapping
  const getPlaceholder = (id: string) => {
      // Return different random images
      const images = [
          'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?q=80&w=2000&auto=format&fit=crop', // Tunnel
          'https://images.unsplash.com/photo-1594340573934-2e23b7b32630?q=80&w=2000&auto=format&fit=crop', // Construction
          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2000&auto=format&fit=crop', // Traffic
          'https://images.unsplash.com/photo-1581094794329-cdac82a6cc88?q=80&w=2000&auto=format&fit=crop', // Workers
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop', // Excavator
          'https://plus.unsplash.com/premium_photo-1661962692059-55d5a4319814?q=80&w=2000&auto=format&fit=crop' // Factory
      ];
      return images[parseInt(id) % images.length];
  };

  return (
    <div className="h-full p-2">
      <div className="grid grid-cols-3 gap-4 h-full">
        {videos.map((video) => (
          <div key={video.id} className="tech-card p-0 overflow-hidden relative group">
             <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded z-10 animate-pulse">
                {video.status}
             </div>
             <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 z-10">
                 <div className="text-white font-bold">{video.name}</div>
             </div>
             <img 
                src={getPlaceholder(video.id)} 
                alt={video.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
             />
             <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-500 transition-colors pointer-events-none"></div>
          </div>
        ))}
        
        {/* Add one empty slot for "Add Monitor" */}
        <div className="tech-card flex flex-col justify-center items-center cursor-pointer hover:bg-white/5 transition-colors group">
            <div className="w-16 h-16 rounded-full border-2 border-gray-600 flex justify-center items-center text-gray-400 group-hover:border-cyan-500 group-hover:text-cyan-500 transition-all">
                <span className="text-4xl">+</span>
            </div>
            <div className="mt-4 text-gray-500 group-hover:text-cyan-500">添加监控画面</div>
        </div>
      </div>
    </div>
  );
};

export default VideoMonitoring;
