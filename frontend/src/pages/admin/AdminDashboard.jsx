import React, { useState, useEffect } from 'react';
import StatsCard from '../../components/ui/StatsCard';
import Button from '../../components/ui/Button';
import adminService from '../../services/adminService';
import api from '../../services/api';
import { useCallback } from 'react';

const AdminDashboard = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState({ total_peserta: 0, hadir: 0, terlambat: 0, tidak_hadir: 0 });
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getSummary({ tanggal: date });
      if (res.success) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchSummary();
    api.get('/admin/dashboard/progress').then(({ data }) => setProgress(data.data));
  }, [fetchSummary, date]);

  const handleExport = () => {
    adminService.exportExcel({ tanggal_dari: date, tanggal_sampai: date });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-heading text-white mb-2">Dashboard Admin</h1>
          <p className="text-primary-300">Ringkasan absensi KKN</p>
        </div>
        
        <div className="flex gap-4">
          <div>
            <label className="block text-sm text-primary-300 mb-1">Tanggal</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface-lighter/50 border border-glass-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary-500"
            />
          </div>
          <div className="flex items-end">
            <Button variant="primary" onClick={handleExport}>
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {progress && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="glass-card p-4">
            <p className="text-white/50 text-xs">Kegiatan</p>
            <p className="text-xl text-white font-heading font-bold mt-1">{progress.kegiatan || 0}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-white/50 text-xs">Program Kerja</p>
            <p className="text-xl text-white font-heading font-bold mt-1">{progress.program || 0}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-white/50 text-xs">Pengajuan Menunggu</p>
            <p className="text-xl text-amber-400 font-heading font-bold mt-1">{progress.pengajuan_menunggu || 0}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-white/50 text-xs">Total Divisi</p>
            <p className="text-xl text-accent-cyan font-heading font-bold mt-1">{progress.total_divisi || 0}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-white/50 text-xs">Saldo Kas KKN</p>
            <p className="text-lg text-emerald-400 font-heading font-bold font-mono mt-1">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(progress.saldo_kas || 0)}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-white/50 text-xs">Total Anggaran RAB</p>
            <p className="text-lg text-amber-300 font-heading font-bold font-mono mt-1">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(progress.total_rab || 0)}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            label="Total Peserta" 
            value={summary.total_peserta} 
            icon={
              <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatsCard 
            label="Hadir" 
            value={summary.hadir} 
            trend={summary.total_peserta ? Math.round((summary.hadir / summary.total_peserta) * 100) : 0}
            icon={
              <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard 
            label="Terlambat" 
            value={summary.terlambat} 
            trend={-(summary.total_peserta ? Math.round((summary.terlambat / summary.total_peserta) * 100) : 0)}
            icon={
              <svg className="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard 
            label="Tidak Hadir" 
            value={summary.tidak_hadir} 
            trend={-(summary.total_peserta ? Math.round((summary.tidak_hadir / summary.total_peserta) * 100) : 0)}
            icon={
              <svg className="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
