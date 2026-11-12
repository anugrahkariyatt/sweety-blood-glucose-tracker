import React, { useEffect } from 'react';
import { Activity, X } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

export default function MobileDrawer({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col justify-between p-5 animate-in slide-in-from-left duration-200">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#4338ca] text-white flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              Sweety Tracker
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Navigation"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto">
          <Sidebar onItemClick={onClose} isMobile={true} />
        </div>
      </div>
    </div>
  );
}
