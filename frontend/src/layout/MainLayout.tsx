 
import { Outlet } from 'react-router-dom';
import Header from './Header';

const MainLayout = () => {
  return (
    <div className="min-h-screen w-full h-screen flex flex-col bg-[#0b1120] overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(11,17,32,0.9),rgba(11,17,32,0.9)),url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center z-0"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <Header />
        <main className="flex-1 p-4 overflow-hidden">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
