import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout.jsx';
import ReadingModal from '../components/readings/ReadingModal.jsx';
import reportService from '../services/reportService.js';
import readingService from '../services/readingService.js';
import {
  SLOT_ORDER,
  SLOT_SHORT_NAMES,
  getSlotItemStyle,
  getGlucoseStatus,
} from '../utils/constants.jsx';
import {
  Area,
  AreaChart,
  Line,
  LineChart,
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
  Clock,
  HeartPulse,
  Plus,
  TrendingUp,
} from 'lucide-react';

export default function Reports() {
  const todayStr = new Date().toISOString().split('T')[0];

  const [activeTab, setActiveTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedChartSlot, setSelectedChartSlot] = useState('ALL');

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      let res;
      if (activeTab === 'daily') {
        res = await reportService.getDailyReport(selectedDate);
      } else if (activeTab === 'month-to-date') {
        res = await reportService.getMonthToDateReport(selectedDate);
      } else {
        res = await reportService.getMonthlyReport(todayStr);
      }

      if (res?.success && res?.data) {
        setReportData(res.data);
      } else {
        setReportData(null);
      }
    } catch (err) {
      console.error('Failed to load report from backend:', err);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedDate, todayStr]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleModalSubmit = async (formData) => {
    setActionLoading(true);
    try {
      await readingService.createReading(formData);
      await fetchReport();
      setIsAddModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetQuickDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const count = reportData?.count || 0;
  const highest =
    reportData?.highest !== null && reportData?.highest !== undefined
      ? reportData.highest
      : '--';
  const lowest =
    reportData?.lowest !== null && reportData?.lowest !== undefined
      ? reportData.lowest
      : '--';
  const average =
    reportData?.average !== null && reportData?.average !== undefined
      ? reportData.average
      : '--';

  const readingsList = reportData?.readings || [];
  const dailyReadingsMap = {};
  if (activeTab === 'daily') {
    readingsList.forEach((r) => {
      dailyReadingsMap[r.slot] = r;
    });
  }

  const dailyChartData =
    activeTab === 'daily' && readingsList.length > 0
      ? SLOT_ORDER.map((slotKey) => {
          const item = dailyReadingsMap[slotKey];
          return {
            name: SLOT_SHORT_NAMES[slotKey] || slotKey,
            value: item ? item.value : null,
          };
        }).filter((d) => d.value !== null)
      : [];

  const monthChartData =
    activeTab !== 'daily' && readingsList.length > 0
      ? readingsList.map((r) => {
          const d = new Date(r.date);
          const dateLabel = d.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
          });
          const slotLabel = SLOT_SHORT_NAMES[r.slot] || r.slot;
          return {
            name: dateLabel,
            slot: slotLabel,
            rawSlot: r.slot,
            fullLabel: `${dateLabel} (${slotLabel})`,
            value: r.value,
          };
        })
      : [];

  const filteredMonthChartData =
    selectedChartSlot === 'ALL'
      ? monthChartData
      : monthChartData.filter((item) => item.rawSlot === selectedChartSlot);

  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString(
    'en-GB',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Glucose Reports & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track and analyze your daily, month-to-date, and monthly glucose trends.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
            <button
              type="button"
              onClick={() => setActiveTab('daily')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'daily'
                  ? 'bg-[#5b50e5] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Daily Report</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('month-to-date')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'month-to-date'
                  ? 'bg-[#5b50e5] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Month to Date</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('monthly')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition shrink-0 ${
                activeTab === 'monthly'
                  ? 'bg-[#5b50e5] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart2 className="w-4 h-4 shrink-0" />
              <span>
                <span className="hidden sm:inline">Monthly Report (Previous Month)</span>
                <span className="sm:hidden">Monthly Report</span>
              </span>
            </button>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-xs font-bold text-slate-700 shrink-0">
                {activeTab === 'daily'
                  ? 'Select Date:'
                  : activeTab === 'month-to-date'
                  ? 'As-of Date:'
                  : 'Auto Period:'}
              </label>

              {activeTab === 'monthly' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="date"
                    disabled
                    value={todayStr}
                    title="Date picker is disabled for previous month report"
                    className="w-full sm:w-auto bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-400 font-medium cursor-not-allowed shadow-2xs"
                  />
                  <span className="text-xs font-medium text-slate-400 italic">
                    (Locked to whole previous month)
                  </span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full sm:w-auto">
                  <input
                    type="date"
                    max={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#5b50e5]/20 focus:border-[#5b50e5] transition"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(0)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        selectedDate === todayStr
                          ? 'bg-[#eef2ff] text-[#4338ca] border-indigo-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(1)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition"
                    >
                      Yesterday
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs font-medium text-slate-600 flex flex-wrap items-center gap-2">
              {activeTab === 'daily' ? (
                <span>
                  Showing readings for <strong>{formattedSelectedDate}</strong>
                </span>
              ) : activeTab === 'month-to-date' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="font-semibold text-slate-700">Calculated Range:</span>
                  <span className="font-bold text-[#5b50e5] bg-[#eef2ff] px-2.5 py-1 rounded-lg border border-indigo-100 break-all">
                    {reportData?.startDate || 'Month Start'} to {reportData?.endDate || selectedDate}
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <span className="font-semibold text-slate-700">Previous Complete Month:</span>
                  <span className="font-bold text-[#5b50e5] bg-[#eef2ff] px-2.5 py-1 rounded-lg border border-indigo-100 break-all">
                    {reportData?.startDate || 'Start'} to {reportData?.endDate || 'End'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#f6f5ff] border border-indigo-100/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                {activeTab === 'daily' ? "Day's Readings" : 'Total Readings'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold text-slate-900">{count}</span>
                {activeTab === 'daily' && (
                  <span className="text-xs font-medium text-slate-400">/ 4 slots</span>
                )}
              </div>
            </div>
          </div>

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

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-[#4338ca] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-500 font-medium">Fetching report from backend...</p>
          </div>
        ) : count === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#4338ca] mx-auto flex items-center justify-center">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                No readings found for this period
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {reportData?.message ||
                  'No blood glucose entries were recorded during the selected date or range.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5b50e5] hover:bg-[#4a3fe0] text-white text-sm font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Record a Reading</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Activity className="w-4 h-4 text-slate-500" />
                <span>
                  {activeTab === 'daily'
                    ? "Day's Progression Trend"
                    : activeTab === 'month-to-date'
                    ? 'Month-to-Date Glucose Trend'
                    : 'Monthly Glucose Trend'}
                </span>
              </div>

              {activeTab !== 'daily' && (
                <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl w-full sm:w-auto overflow-x-auto max-w-full">
                  <button
                    type="button"
                    onClick={() => setSelectedChartSlot('ALL')}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition whitespace-nowrap ${
                      selectedChartSlot === 'ALL'
                        ? 'bg-white text-[#4338ca] shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChartSlot('MORNING')}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition whitespace-nowrap ${
                      selectedChartSlot === 'MORNING'
                        ? 'bg-white text-[#4338ca] shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Morning
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChartSlot('AFTER_BREAKFAST')}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition whitespace-nowrap ${
                      selectedChartSlot === 'AFTER_BREAKFAST'
                        ? 'bg-white text-[#4338ca] shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Breakfast
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChartSlot('AFTER_LUNCH')}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition whitespace-nowrap ${
                      selectedChartSlot === 'AFTER_LUNCH'
                        ? 'bg-white text-[#4338ca] shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Lunch
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChartSlot('AFTER_DINNER')}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition whitespace-nowrap ${
                      selectedChartSlot === 'AFTER_DINNER'
                        ? 'bg-white text-[#4338ca] shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dinner
                  </button>
                </div>
              )}
            </div>

            {activeTab === 'daily' ? (
              dailyChartData.length > 0 ? (
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dailyChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="reportTrendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5b50e5" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#5b50e5" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        interval="preserveStartEnd"
                        minTickGap={12}
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
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#5b50e5"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#reportTrendGradient)"
                        dot={{ r: 4, fill: '#ffffff', stroke: '#5b50e5', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  No slot readings recorded for this date.
                </div>
              )
            ) : (
              filteredMonthChartData.length > 0 ? (
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={filteredMonthChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        interval="preserveStartEnd"
                        minTickGap={16}
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
                        formatter={(val, name, item) => [
                          `${val} mg/dl`,
                          item.payload.slot || 'Glucose',
                        ]}
                        labelFormatter={(label, items) =>
                          items?.[0]?.payload?.fullLabel || label
                        }
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#5b50e5"
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: '#ffffff', stroke: '#5b50e5', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#5b50e5' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  No{' '}
                  {selectedChartSlot !== 'ALL'
                    ? SLOT_SHORT_NAMES[selectedChartSlot] || selectedChartSlot
                    : ''}{' '}
                  readings recorded for this period.
                </div>
              )
            )}

            {activeTab === 'daily' && (
              <div className="pt-5 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Recorded Slots for {formattedSelectedDate}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SLOT_ORDER.map((slotKey) => {
                    const item = dailyReadingsMap[slotKey];
                    const style = getSlotItemStyle(slotKey);
                    const status = item
                      ? getGlucoseStatus(item.value, item.slot)
                      : null;

                    return (
                      <div
                        key={slotKey}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${style.bg}`}
                          >
                            {style.icon}
                          </div>
                          <span className="text-xs font-semibold text-slate-800">
                            {style.label}
                          </span>
                        </div>

                        <div className="text-right">
                          {item ? (
                            <>
                              <span className="text-sm font-bold text-slate-900 block">
                                {item.value}{' '}
                                <span className="text-[10px] font-normal text-slate-400">
                                  mg/dl
                                </span>
                              </span>
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${status?.color}`}
                              >
                                {status?.label}
                              </span>
                            </>
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
            )}
          </div>
        )}
      </div>

      <ReadingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleModalSubmit}
        loading={actionLoading}
      />
    </AppLayout>
  );
}
