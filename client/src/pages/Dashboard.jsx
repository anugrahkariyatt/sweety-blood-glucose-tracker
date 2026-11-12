import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout.jsx';
import ReadingModal from '../components/readings/ReadingModal.jsx';
import reportService from '../services/reportService.js';
import readingService from '../services/readingService.js';
import {
  SLOT_ORDER,
  SLOT_LABELS,
  SLOT_SHORT_NAMES,
  getSlotItemStyle,
} from '../utils/constants.jsx';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart2,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';

export default function Dashboard() {
  const [dailyData, setDailyData] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Reading Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [dailyRes, allRes] = await Promise.all([
        reportService.getDailyReport(todayStr).catch(() => null),
        readingService.getReadings().catch(() => null),
      ]);

      if (dailyRes?.success && dailyRes?.data) {
        setDailyData(dailyRes.data);
      }

      if (allRes?.success && Array.isArray(allRes?.data)) {
        setRecentReadings(allRes.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleModalSubmit = async (formData) => {
    setActionLoading(true);
    try {
      await readingService.createReading(formData);
      await loadDashboardData();
    } finally {
      setActionLoading(false);
    }
  };

  // Map today's readings into the 4 fixed slots for the list & chart
  const todayReadingsMap = {};
  if (dailyData?.readings) {
    dailyData.readings.forEach((r) => {
      todayReadingsMap[r.slot] = r;
    });
  }

  // Prepare chart data for today's trend
  const chartData =
    dailyData?.readings && dailyData.readings.length > 0
      ? SLOT_ORDER.map((slotKey) => {
          const item = todayReadingsMap[slotKey];
          return {
            name: SLOT_SHORT_NAMES[slotKey] || slotKey,
            value: item ? item.value : null,
          };
        }).filter((d) => d.value !== null)
      : [];

  const count = dailyData?.count || 0;
  const highest =
    dailyData?.highest !== null && dailyData?.highest !== undefined
      ? dailyData.highest
      : '--';
  const lowest =
    dailyData?.lowest !== null && dailyData?.lowest !== undefined
      ? dailyData.lowest
      : '--';
  const average =
    dailyData?.average !== null && dailyData?.average !== undefined
      ? dailyData.average
      : '--';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 1. Hero Banner Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-white border border-purple-100/70 rounded-3xl p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              Track your blood glucose,
              <br />
              stay in control.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Add your daily readings, view reports, and monitor your progress over time.
            </p>
          </div>

          {/* Banner Vector Illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <svg
              viewBox="0 0 160 140"
              className="w-36 h-28 select-none"
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
              <path
                d="M80 47 C 80 47, 72 58, 72 65 C 72 70, 75.5 73, 80 73 C 84.5 73, 88 70, 88 65 C 88 58, 80 47, 80 47 Z"
                fill="#ef4444"
              />
              <circle cx="77" cy="63" r="1.5" fill="#fca5a5" />
              <circle cx="80" cy="96" r="6" fill="#312e81" />
            </svg>
          </div>

          {/* Action button: Opens the Add New Reading Modal */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#5b50e5] hover:bg-[#4a3fe0] text-white px-5 py-3 rounded-2xl font-semibold text-sm shadow-md shadow-indigo-500/20 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Reading</span>
          </button>
        </div>

        {/* 2. Four Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today's Readings */}
          <div className="bg-[#f6f5ff] border border-indigo-100/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Today's Readings
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold text-slate-900">{count}</span>
                <span className="text-xs font-medium text-slate-400">/ 4 slots</span>
              </div>
            </div>
          </div>

          {/* Card 2: Highest */}
          <div className="bg-[#f0fbf4] border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <ArrowUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Highest
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold text-slate-900">{highest}</span>
                {highest !== '--' && (
                  <span className="text-xs font-medium text-slate-400">mg/dl</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Lowest */}
          <div className="bg-[#f0f8ff] border border-sky-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <ArrowDown className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Lowest
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold text-slate-900">{lowest}</span>
                {lowest !== '--' && (
                  <span className="text-xs font-medium text-slate-400">mg/dl</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: Average */}
          <div className="bg-[#fffbf0] border border-amber-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Average
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold text-slate-900">{average}</span>
                {average !== '--' && (
                  <span className="text-xs font-medium text-slate-400">mg/dl</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Row: Today's Readings, Today's Trend, and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Today's Readings List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-1">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Today's Readings</span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-100 pb-2">
              <span>Time Slot</span>
              <span>Glucose Level</span>
            </div>

            <div className="space-y-2.5">
              {SLOT_ORDER.map((slotKey) => {
                const item = todayReadingsMap[slotKey];
                const style = getSlotItemStyle(slotKey);

                return (
                  <div
                    key={slotKey}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/70 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${style.bg}`}
                      >
                        {style.icon}
                      </div>
                      <span className="text-xs font-semibold text-slate-800">
                        {style.label}
                      </span>
                    </div>

                    <div className="text-right">
                      {item ? (
                        <span className="text-sm font-bold text-slate-900">
                          {item.value}{' '}
                          <span className="text-xs font-normal text-slate-400">
                            mg/dl
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          Not recorded
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Today's Trend Chart */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-1">
              <Activity className="w-4 h-4 text-slate-500" />
              <span>Today's Trend</span>
            </div>

            {chartData.length > 0 ? (
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5b50e5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#5b50e5" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={['dataMin - 15', 'dataMax + 15']}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val) => [`${val} mg/dl`, 'Glucose']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#5b50e5"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#trendGradient)"
                      dot={{ r: 4, fill: '#ffffff', stroke: '#5b50e5', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center p-4">
                <Activity className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-500">
                  No readings recorded today
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Record today's readings to see your hourly trend chart.
                </p>
              </div>
            )}
          </div>

          {/* Column 3: Recent Activity */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-1">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Recent Activity</span>
            </div>

            {recentReadings.length > 0 ? (
              <div className="space-y-3">
                {recentReadings.map((r) => {
                  const dateStr = r.date
                    ? new Date(r.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : 'Today';

                  return (
                    <div
                      key={r.id}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50/70 transition"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800">
                          Added reading – {SLOT_LABELS[r.slot] || r.slot}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          <span className="font-medium text-slate-600">
                            {r.value} mg/dl
                          </span>{' '}
                          · {dateStr}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-500">
                  No recent activity
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Your recorded readings activity will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add New Reading Modal Dialog */}
      <ReadingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleModalSubmit}
        loading={actionLoading}
      />
    </AppLayout>
  );
}
