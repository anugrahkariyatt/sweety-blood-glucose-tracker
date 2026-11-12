import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Activity,
  BarChart2,
  Home,
  List,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

export default function Sidebar({ onItemClick, isMobile = false }) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-full h-full flex flex-col justify-between">
      {/*Brand + Navigation */}
      <div className="space-y-6">
        {!isMobile && (
          <div className="flex items-center gap-3 px-2 pt-1 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-full bg-[#4338ca] text-white flex items-center justify-center shadow-xs shrink-0">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Sweety Tracker
            </span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          <NavLink
            to="/"
            end
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#5b50e5] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/readings"
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#5b50e5] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <List className="w-4 h-4 shrink-0" />
            <span>Readings</span>
          </NavLink>

          <NavLink
            to="/reports"
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#5b50e5] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <BarChart2 className="w-4 h-4 shrink-0" />
            <span>Reports</span>
          </NavLink>
        </nav>
      </div>

      {/* Bottom  */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        {/* Glucose Meter Illustration */}
        <div className="flex flex-col items-center justify-center select-none py-1">
          <svg
            viewBox="0 0 160 140"
            className="w-32 h-26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 120 C 15 90, 45 85, 55 105 C 45 115, 30 125, 20 120 Z"
              fill="#a7f3d0"
              opacity="0.85"
            />
            <path
              d="M32 125 C 25 105, 50 100, 60 115 C 50 125, 40 130, 32 125 Z"
              fill="#6ee7b7"
              opacity="0.9"
            />
            <path
              d="M140 120 C 145 90, 115 85, 105 105 C 115 115, 130 125, 140 120 Z"
              fill="#a7f3d0"
              opacity="0.85"
            />
            <path
              d="M128 125 C 135 105, 110 100, 100 115 C 110 125, 120 130, 128 125 Z"
              fill="#6ee7b7"
              opacity="0.9"
            />

            <rect x="75" y="115" width="10" height="20" rx="3" fill="#cbd5e1" />
            <rect x="77" y="125" width="6" height="8" rx="1" fill="#94a3b8" />

            <rect x="48" y="25" width="64" height="90" rx="32" fill="#4338ca" />
            <rect x="52" y="29" width="56" height="82" rx="28" fill="#4f46e5" />

            <rect x="58" y="38" width="44" height="46" rx="14" fill="#ffffff" />

            {/* Blood Drop */}
            <path
              d="M80 47 C 80 47, 72 58, 72 65 C 72 70, 75.5 73, 80 73 C 84.5 73, 88 70, 88 65 C 88 58, 80 47, 80 47 Z"
              fill="#ef4444"
            />
            <circle cx="77" cy="63" r="1.5" fill="#fca5a5" />

            {/* Meter Button */}
            <circle cx="80" cy="96" r="6" fill="#312e81" />
          </svg>

          {/* Slogan from mockup */}
          <span className="text-[11px] font-medium text-slate-400 mt-1 tracking-wide">
            Track • Monitor • Stay Healthy
          </span>
        </div>

        {/* User Profile Info Card */}
        <div className="p-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#4338ca] flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onItemClick) onItemClick();
              logout();
            }}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
