import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-md text-center max-w-md w-full">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-inner">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h2 className="text-xl font-bold text-slate-800">Welcome, {user?.name}!</h2>
        <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
        <div className="mt-3">
          <span className="text-xs text-emerald-700 font-semibold   py-1 px-3 rounded-full">
            Logged In Successfully
          </span>
        </div>

        <button
          onClick={logout}
          className="mt-6 w-full py-2.5 px-4 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}