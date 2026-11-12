import React from 'react';
import { SLOT_LABELS, getGlucoseStatus } from '../../utils/constants.jsx';
import { Calendar, Edit2, HeartPulse, Trash2 } from 'lucide-react';

export default function ReadingTable({ readings, onEdit, onDelete, onAddNew }) {
  if (!readings || readings.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center mb-4 shadow-inner">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No readings recorded yet</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Start recording up to 4 daily blood glucose entries to track your health trends.
        </p>
        <button
          onClick={onAddNew}
          className="mt-6 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition shadow-md shadow-indigo-500/20"
        >
          + Add First Reading
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Mobile Cards View (Hidden on tablet/desktop: <md) */}
      <div className="md:hidden space-y-3">
        {readings.map((reading) => {
          const status = getGlucoseStatus(reading.value, reading.slot);
          const formattedDate = reading.date
            ? new Date(reading.date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '-';

          return (
            <div
              key={reading.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3"
            >
              {/* Card Header: Date & Status Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formattedDate}</span>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${status.color}`}
                >
                  {status.label}
                </span>
              </div>

              {/* Card Body: Slot & Value */}
              <div className="flex items-end justify-between pt-1">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Time Slot</span>
                  <span className="inline-block mt-0.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                    {SLOT_LABELS[reading.slot] || reading.slot}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 leading-none">
                    {reading.value}
                  </span>
                  <span className="text-xs text-slate-400 ml-1 font-medium">mg/dl</span>
                </div>
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => onEdit(reading)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(reading)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop Table View (Visible on md and up: >=768px) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Time Slot</th>
                <th className="px-6 py-4">Glucose Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {readings.map((reading) => {
                const status = getGlucoseStatus(reading.value, reading.slot);
                const formattedDate = reading.date
                  ? new Date(reading.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '-';

                return (
                  <tr key={reading.id} className="hover:bg-slate-50/60 transition">
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 flex items-center gap-2 mt-0.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{formattedDate}</span>
                    </td>

                    {/* Slot */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                        {SLOT_LABELS[reading.slot] || reading.slot}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base font-bold text-slate-900">
                        {reading.value}
                      </span>{' '}
                      <span className="text-xs text-slate-400 font-medium">mg/dl</span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(reading)}
                          title="Edit Reading"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(reading)}
                          title="Delete Reading"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
