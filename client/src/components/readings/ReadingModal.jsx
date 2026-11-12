import React, { useState, useEffect } from 'react';
import { READING_SLOTS } from '../../utils/constants.jsx';
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Loader2,
  Save,
  X,
} from 'lucide-react';

export default function ReadingModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    slot: 'MORNING',
    value: '',
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          date: initialData.date ? initialData.date.split('T')[0] : '',
          slot: initialData.slot || 'MORNING',
          value: initialData.value !== undefined ? initialData.value : '',
        });
      } else {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          slot: 'MORNING',
          value: '',
        });
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validate = () => {
    if (!formData.date) {
      return 'Date is required.';
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.date > todayStr) {
      return 'Date cannot be in the future.';
    }

    if (!formData.slot) {
      return 'Please choose a reading slot.';
    }

    if (
      formData.value === '' ||
      formData.value === null ||
      formData.value === undefined
    ) {
      return 'Glucose value is required.';
    }

    const numVal = Number(formData.value);
    if (!Number.isInteger(numVal)) {
      return 'Glucose level must be a whole integer.';
    }

    if (numVal < 40 || numVal > 600) {
      return 'Glucose level must be between 40 and 600 mg/dl.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const clientErr = validate();
    if (clientErr) {
      setError(clientErr);
      return;
    }

    try {
      await onSubmit({
        date: formData.date,
        slot: formData.slot,
        value: Number(formData.value),
      });
      onClose();
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors &&
          err.response.data.errors.map((e) => e.message).join(', ')) ||
        'Failed to save reading. Please check your input.';

      setError(serverMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5b50e5] flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? 'Edit Reading' : 'Add New Reading'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Record your blood glucose level
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(e) => {
                  setError(null);
                  setFormData({ ...formData, date: e.target.value });
                }}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b50e5]/20 focus:border-[#5b50e5] transition"
              />
            </div>
          </div>

          {/* Time Slot Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Time Slot
            </label>
            <select
              value={formData.slot}
              onChange={(e) => {
                setError(null);
                setFormData({ ...formData, slot: e.target.value });
              }}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b50e5]/20 focus:border-[#5b50e5] transition"
            >
              {READING_SLOTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Glucose Value Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Glucose Level
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                placeholder="e.g. 110"
                min="40"
                max="600"
                value={formData.value}
                onChange={(e) => {
                  setError(null);
                  setFormData({ ...formData, value: e.target.value });
                }}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium pr-14 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b50e5]/20 focus:border-[#5b50e5] transition"
              />
              <span className="absolute right-3.5 text-xs font-medium text-slate-400 pointer-events-none">
                mg/dl
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Must be a whole number between 40 and 600 mg/dl.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-700 text-xs sm:text-sm flex items-start gap-2 font-medium animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5b50e5] hover:bg-[#4a3fe0] disabled:opacity-50 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{initialData ? 'Update' : 'Save Reading'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

