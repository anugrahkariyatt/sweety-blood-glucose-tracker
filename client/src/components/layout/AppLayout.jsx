import React, { useState } from 'react';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import MobileDrawer from './MobileDrawer.jsx';

export default function AppLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f3fa] flex text-slate-800">
      {/*Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-white border-r border-slate-200/80 shrink-0 sticky top-0 h-screen p-5 z-20">
        <Sidebar />
      </aside>

      {/*Mobile Drawer for small screens */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/*Main Content Section (Navbar + Page Content) */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleMenu={() => setMobileMenuOpen((prev) => !prev)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
