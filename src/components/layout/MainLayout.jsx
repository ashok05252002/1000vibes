import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // Changed min-h-screen to h-screen and added overflow-hidden to fix the sidebar
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        {/* Main content area scrolls independently */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto scroll-smooth">
          <div className="max-w-7xl mx-auto pb-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
