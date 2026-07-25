import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import divisionService from '../../services/divisionService';

const TARGET_PESERTA = 37;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  // Form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nama: '',
    nim: '',
    jurusan: '',
    password: '',
    division_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userRes, divRes] = await Promise.all([
        adminService.getUsers().catch(() => null),
        divisionService.getDivisions().catch(() => null),
      ]);
      if (userRes?.success && userRes?.data) {
        setUsers(userRes.data.users || userRes.data || []);
      }
      setDivisions(divRes?.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminService.createUser({
        ...form,
        division_id: form.division_id ? parseInt(form.division_id) : null,
      });
      if (res.success) {
        setShowAddModal(false);
        setForm({ nama: '', nim: '', jurusan: '', password: '', division_id: '' });
        await loadData();
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal menambahkan peserta.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Yakin ingin menghapus peserta "${nama}"? Semua data absensi juga akan terhapus.`)) {
      try {
        setDeleting(id);
        const res = await adminService.deleteUser(id);
        if (res.success) loadData();
      } catch {
        alert('Gagal menghapus peserta.');
      } finally {
        setDeleting(null);
      }
    }
  };

  const filtered = users.filter(u =>
    u.nama?.toLowerCase().includes(search.toLowerCase()) ||
    u.nim?.toLowerCase().includes(search.toLowerCase()) ||
    u.jurusan?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (nama) => (nama || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-1">Admin Panel</p>
          <h1 className="font-heading text-3xl font-bold text-white">Manajemen Peserta KKN</h1>
          <p className="text-white/50 text-sm mt-1 flex items-center gap-2">
            <span>{loading ? 'Memuat...' : `${users.length} / ${TARGET_PESERTA} Mahasiswa Terdaftar`}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan font-mono">
              Target {TARGET_PESERTA} Mahasiswa
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Search */}
          <div className="relative max-w-xs w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama, NIM, jurusan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="glass-input w-full pl-9 pr-4 py-2.5 text-sm"
            />
          </div>

          {/* Add User Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary px-4 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap shadow-lg shadow-primary-500/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Mahasiswa
          </button>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="glass-card p-6 border border-primary-400/30 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-lg text-white">➕ Tambah Mahasiswa Peserta Baru</h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-white/40 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/60 mb-1.5 block">Nama Lengkap *</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                  placeholder="Contoh: Ahmad Faisal"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-cyan/50"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1.5 block">NIM *</label>
                <input
                  type="text"
                  value={form.nim}
                  onChange={e => setForm(f => ({ ...f, nim: e.target.value }))}
                  placeholder="Contoh: 1217050001"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-cyan/50 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1.5 block">Jurusan / Program Studi</label>
                <input
                  type="text"
                  value={form.jurusan}
                  onChange={e => setForm(f => ({ ...f, jurusan: e.target.value }))}
                  placeholder="Contoh: Teknik Informatika"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-cyan/50"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1.5 block">Password Akses *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-cyan/50"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-white/60 mb-1.5 block">Divisi KKN (Opsional)</label>
                <select
                  value={form.division_id}
                  onChange={e => setForm(f => ({ ...f, division_id: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50"
                >
                  <option value="">-- Pilih Divisi (Bisa ditugaskan nanti) --</option>
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.nama} — {d.deskripsi || ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : '✓ Tambah Mahasiswa'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden !p-0">
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
            <p className="text-white/40 text-sm">Memuat data peserta...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="text-white/50 font-medium">
              {search ? `Tidak ada peserta dengan kata kunci "${search}".` : 'Belum ada peserta terdaftar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Peserta</th>
                  <th>NIM</th>
                  <th>Jurusan</th>
                  <th>Divisi</th>
                  <th>Total Hadir</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => {
                  const div = divisions.find(d => d.id === user.division_id) || user.division;
                  return (
                    <tr key={user.id} className="animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                      <td>
                        <div className="flex items-center gap-3">
                          {user.foto_url ? (
                            <img src={user.foto_url} alt={user.nama} className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/30 to-primary-700/30 flex items-center justify-center text-xs font-bold text-primary-300 ring-1 ring-white/5">
                              {initials(user.nama)}
                            </div>
                          )}
                          <span className="text-white font-medium text-sm">{user.nama}</span>
                        </div>
                      </td>
                      <td className="font-mono text-sm text-white/60">{user.nim}</td>
                      <td className="text-sm text-white/50">{user.jurusan || '-'}</td>
                      <td>
                        {div ? (
                          <span
                            className="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                            style={{
                              backgroundColor: `${div.warna || '#6366f1'}20`,
                              color: div.warna || '#6366f1',
                              borderColor: `${div.warna || '#6366f1'}40`,
                            }}
                          >
                            {div.nama}
                          </span>
                        ) : (
                          <span className="text-xs text-white/30 font-light">Belum ada</span>
                        )}
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-info/15 text-info">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          {user.attendance_count || 0} kali
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDelete(user.id, user.nama)}
                          disabled={deleting === user.id}
                          className="btn-danger px-3 py-1.5 text-xs font-semibold flex items-center gap-1 ml-auto"
                        >
                          {deleting === user.id ? (
                            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                          )}
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-white/5 text-xs text-white/30 flex justify-between items-center">
              <span>Menampilkan {filtered.length} dari {users.length} peserta</span>
              <span>Target Kelompok: {TARGET_PESERTA} Mahasiswa</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
