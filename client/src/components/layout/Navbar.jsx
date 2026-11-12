import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Activity, Calendar, Menu } from 'lucide-react';

export default function Navbar({ onToggleMenu }) {
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 17
      ? 'Good afternoon'
      : 'Good evening';

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs min-h-16 py-3 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        {/* Left Section: Mobile Hamburger */}
        <div className="flex items-center gap-3">
          {/* Hamburger button for small screens */}
          <button
            type="button"
            onClick={onToggleMenu}
            aria-label="Open Navigation Menu"
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Brand */}
          <div className="flex md:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#4338ca] text-white flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              Sweety Tracker
            </span>
          </div>

          {/* Desktop Greeting */}
          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              {greeting}, {user?.name || 'User'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Here's your blood glucose overview for today.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-2 justify-end">
          <div className="flex items-center gap-2 border border-slate-200/80 bg-white px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{todayFormatted}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
