import React, { useState, useEffect } from 'react';
import Badge from '../components/ui/Badge';
import attendanceService from '../services/attendanceService';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('Semua');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await attendanceService.getHistory();
        if (response.success && response.data) {
          setHistory(response.data.data || response.data);
        }
      } catch {
        setError('Gagal memuat riwayat absensi.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const statusFilters = ['Semua', 'Hadir', 'Terlambat', 'Tidak Hadir'];
  const filtered = filter === 'Semua' ? history : history.filter(r => r.status === filter);

  const stats = {
    hadir: history.filter(r => r.status === 'Hadir').length,
    terlambat: history.filter(r => r.status === 'Terlambat').length,
    tidakHadir: history.filter(r => r.status === 'Tidak Hadir').length,
    total: history.length,
  };

  const SimilarityBar = ({ score }) => {
    const pct = Math.min(100, Math.max(0, (score || 0) * 100));
    const color = pct >= 80 ? '#00ff88' : pct >= 60 ? '#ffb700' : '#ff3366';
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color }}>{pct.toFixed(1)}%</span>
        <div className="w-16 h-1.5 rounded-full overflow-hidden bg-white/10">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{ background: 'linear-gradient(135deg, rgba(123,76,245,0.2) 0%, rgba(0,240,255,0.1) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(123,76,245,0.3) 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-primary-400 to-accent-cyan" />
            <p className="text-primary-300 text-xs font-bold tracking-[0.2em] uppercase">Rekap Kehadiran</p>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
            Riwayat <span className="gradient-text">Absensi</span>
          </h1>
          <p className="text-white/40 mt-2">Histori lengkap absensi selama KKN berlangsung.</p>
        </div>
      </div>

      {/* Quick Stats */}
      {!loading && !error && history.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Absensi', value: stats.total, color: 'text-white', bg: 'bg-white/5' },
            { label: 'Hadir', value: stats.hadir, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Terlambat', value: stats.terlambat, color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Tidak Hadir', value: stats.tidakHadir, color: 'text-danger', bg: 'bg-danger/10' },
          ].map(s => (
            <div key={s.label} className={`glass-card p-4 ${s.bg} !bg-opacity-100`}>
              <p className={`text-2xl font-bold font-heading ${s.color}`}>{s.value}</p>
              <p className="text-white/40 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      {!loading && history.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${filter === f
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
            >
              {f}
              {f !== 'Semua' && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({f === 'Hadir' ? stats.hadir : f === 'Terlambat' ? stats.terlambat : stats.tidakHadir})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="glass-card p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5">
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/3 rounded" />
                <div className="skeleton h-3 w-1/4 rounded" />
              </div>
              <div className="skeleton h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-card p-10 text-center text-danger flex flex-col items-center gap-3">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white/50 text-sm">{filter === 'Semua' ? 'Belum ada riwayat absensi.' : `Tidak ada absensi dengan status "${filter}".`}</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tanggal</th>
                  <th>Hari</th>
                  <th>Waktu</th>
                  <th>Status</th>
                  <th>Similarity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record, index) => {
                  const date = new Date(record.tanggal || record.created_at);
                  return (
                    <tr key={record.id} className="animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                      <td className="text-white/30 font-mono text-xs">{String(index + 1).padStart(2, '0')}</td>
                      <td>
                        <span className="text-white font-medium text-sm">
                          {date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="text-white/50 text-sm">
                        {date.toLocaleDateString('id-ID', { weekday: 'long' })}
                      </td>
                      <td className="font-mono text-sm text-white/60">
                        {record.waktu_absen || record.waktu || (record.created_at
                          ? new Date(record.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                          : '-')}
                      </td>
                      <td><Badge status={record.status} /></td>
                      <td>
                        {record.similarity != null
                          ? <SimilarityBar score={record.similarity} />
                          : <span className="text-white/20 text-xs">—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-white/5 text-xs text-white/25">
            Menampilkan {filtered.length} dari {history.length} entri
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
