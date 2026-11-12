import React, { useState, useEffect, useCallback } from 'react';
import readingService from '../services/readingService.js';
import AppLayout from '../components/layout/AppLayout.jsx';
import ReadingModal from '../components/readings/ReadingModal.jsx';
import ReadingTable from '../components/readings/ReadingTable.jsx';
import DeleteConfirmation from '../components/readings/DeleteConfirmation.jsx';
import { Plus } from 'lucide-react';

export default function Readings() {
  const [readings, setReadings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal states for Add and Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState(null);

  // Delete modal state
  const [deletingReading, setDeletingReading] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReadings = useCallback(async (targetPage = page) => {
    try {
      setLoading(true);
      const res = await readingService.getReadings({ page: targetPage, limit: 20 });
      if (res?.success && Array.isArray(res?.data)) {
        setReadings(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
          setPage(res.pagination.page);
        }
      }
    } catch (err) {
      console.error('Failed to load readings:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReadings(1);
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchReadings(newPage);
  };

  const handleAddNewClick = () => {
    setEditingReading(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (reading) => {
    setEditingReading(reading);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (editingReading) {
        await readingService.updateReading(editingReading.id, formData);
        setEditingReading(null);
      } else {
        await readingService.createReading(formData);
      }
      await fetchReadings(page);
      setIsModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingReading) return;

    setActionLoading(true);
    try {
      await readingService.deleteReading(deletingReading.id);
      await fetchReadings(page);
      setDeletingReading(null);
    } catch (err) {
      console.error('Failed to delete reading:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Blood Glucose Readings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Record and manage your daily blood glucose readings.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddNewClick}
            className="self-start sm:self-auto flex items-center gap-2 bg-[#4338ca] hover:bg-[#3730a3] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Reading</span>
          </button>
        </div>

        {/* Readings Table / Recent Readings List */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl">
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-[#4338ca] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-500 font-medium">Loading your readings...</p>
          </div>
        ) : (
          <ReadingTable
            readings={readings}
            pagination={pagination}
            onPageChange={handlePageChange}
            onEdit={handleOpenEdit}
            onDelete={(reading) => setDeletingReading(reading)}
            onAddNew={handleAddNewClick}
          />
        )}

        {/* Add / Edit Reading Modal Dialog */}
        <ReadingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingReading(null);
          }}
          onSubmit={handleModalSubmit}
          initialData={editingReading}
          loading={actionLoading}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmation
          isOpen={Boolean(deletingReading)}
          onClose={() => setDeletingReading(null)}
          onConfirm={handleConfirmDelete}
          loading={actionLoading}
        />
      </div>
    </AppLayout>
  );
}
