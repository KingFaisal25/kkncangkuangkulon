import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import adminService from '../../services/adminService';
import api from '../../services/api';

const AdminAttendance = () => {
  const [activities, setActivities] = useState([]);
  const [records, setRecords] = useState([]);
  const [totalMahasiswa, setTotalMahasiswa] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    tanggal_dari: new Date().toISOString().split('T')[0],
    tanggal_sampai: new Date().toISOString().split('T')[0],
    search: '', activity_id: ''
  });

  useEffect(() => {
    api.get('/admin/activities').then(({ data }) => setActivities(data.data.activities || []));
    // Total peserta KKN (semua mahasiswa)
    adminService.getUsers({ per_page: 1 }).then((res) => {
      setTotalMahasiswa(res?.data?.total ?? res?.total ?? 0);
    }).catch(() => {});
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAttendance({ ...filters, per_page: 1000 });
      const payload = res?.data ?? res;
      const list = payload?.data?.data || payload?.data || payload || [];
      setRecords(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => adminService.exportExcel(filters);
  const handleExportPDF = () => window.print();
  const handleFilter = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  // Stats computed from the currently-loaded (filtered) records
  const stats = useMemo(() => {
    const hadir = records.filter(r => r.status === 'Hadir').length;
    const terlambat = records.filter(r => r.status === 'Terlambat').length;
    const uniqueMhs = new Set(records.map(r => r.user?.id).filter(Boolean)).size;
    return { total: records.length, hadir, terlambat, uniqueMhs };
  }, [records]);

  // Group records by date
  const groupedRecords = records.reduce((acc, record) => {
    const date = record.tanggal;
    if (!acc[date]) acc[date] = [];
    acc[date].push(record);
    return acc;
  }, {});
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => new Date(b) - new Date(a));

  const StatCard = ({ label, value, accent }) => (
    <div className="glass-card p-4 border border-white/10">
      <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: accent }}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-heading text-white mb-2">Rekap Absensi</h1>
          <p className="text-primary-300">Data kehadiran peserta KKN</p>
        </div>
        <div className="flex gap-2 flex-wrap print:hidden">
          <Button onClick={handleExportExcel} variant="secondary">Export Excel</Button>
          <Button onClick={handleExportPDF} variant="primary">Export PDF</Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 print:hidden">
        <StatCard label="Total Mahasiswa" value={totalMahasiswa} accent="#00f0ff" />
        <StatCard label="Total Absensi" value={stats.total} accent="#ffffff" />
        <StatCard label="Mahasiswa Hadir" value={stats.uniqueMhs} accent="#10b981" />
        <StatCard label="Hadir" value={stats.hadir} accent="#10b981" />
        <StatCard label="Terlambat" value={stats.terlambat} accent="#f59e0b" />
      </div>

      <Card className="p-6 bg-glass border-glass-border mb-6 print:hidden">
        <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[220px]">
            <label className="block text-sm text-primary-300 mb-1">Kegiatan</label>
            <select value={filters.activity_id} onChange={(e) => setFilters({...filters, activity_id: e.target.value})} className="w-full bg-surface-lighter/50 border border-glass-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary-500">
              <option value="">Semua kegiatan</option>
              {activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.nama}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-primary-300 mb-1">Cari Nama/NIM</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full bg-surface-lighter/50 border border-glass-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary-500"
              placeholder="Ketik untuk mencari..."
            />
          </div>
          <div>
            <label className="block text-sm text-primary-300 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={filters.tanggal_dari}
              onChange={(e) => setFilters({...filters, tanggal_dari: e.target.value})}
              className="w-full bg-surface-lighter/50 border border-glass-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-primary-300 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={filters.tanggal_sampai}
              onChange={(e) => setFilters({...filters, tanggal_sampai: e.target.value})}
              className="w-full bg-surface-lighter/50 border border-glass-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary-500"
            />
          </div>
          <Button type="submit" variant="primary">Filter</Button>
        </form>
      </Card>

      <div id="attendance-print-area" className="space-y-8">
        {/* Print-only header (visible only when exporting PDF) */}
        <div className="hidden print:block mb-4">
          <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Rekap Absensi KKN</h1>
          <p>Periode: {filters.tanggal_dari} s/d {filters.tanggal_sampai}</p>
          <p>Total Mahasiswa: {totalMahasiswa} | Total Absensi: {stats.total} (Hadir: {stats.hadir}, Terlambat: {stats.terlambat})</p>
        </div>

        {loading ? (
          <Card className="bg-glass border-glass-border overflow-hidden print:hidden">
            <div className="p-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          </Card>
        ) : records.length === 0 ? (
          <Card className="bg-glass border-glass-border overflow-hidden print:hidden">
            <div className="p-12 text-center text-primary-300">
              Tidak ada data absensi ditemukan.
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((date) => (
              <div key={date} className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-3 border-b border-glass-border pb-2">
                  <div className="p-2 bg-primary-500/20 rounded-lg print:hidden">
                    <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-heading font-semibold text-white">
                    {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h2>
                  <Badge status="Hadir" className="ml-auto opacity-80 print:hidden">
                    {groupedRecords[date].length} Absensi
                  </Badge>
                </div>

                <Card className="bg-glass border-glass-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-primary-100">
                      <thead className="bg-surface-lighter/50 text-primary-300 text-sm uppercase">
                        <tr>
                          <th className="px-6 py-4 font-medium">Foto</th>
                          <th className="px-6 py-4 font-medium">Peserta</th>
                          <th className="px-6 py-4 font-medium">Waktu</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium">Similarity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-glass-border">
                        {groupedRecords[date].map((record) => (
                          <tr key={record.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              {record.foto_absen_url ? (
                                <img src={record.foto_absen_url} alt="Foto Absen" className="h-12 w-12 object-cover rounded shadow-md" />
                              ) : (
                                <div className="h-12 w-12 bg-surface-lighter rounded flex items-center justify-center text-xs">No img</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-white">{record.user?.nama || 'Unknown'}</div>
                              <div className="text-sm text-primary-400">{record.user?.nim || '-'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium">{record.waktu_absen}</div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge status={record.status} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className="mr-2">{(record.similarity * 100).toFixed(1)}%</span>
                                <div className="w-16 h-2 bg-surface-lighter rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${record.similarity >= 0.8 ? 'bg-success' : 'bg-warning'}`}
                                    style={{ width: `${Math.min(100, Math.max(0, record.similarity * 100))}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;