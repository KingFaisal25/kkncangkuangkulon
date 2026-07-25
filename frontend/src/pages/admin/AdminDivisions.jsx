import { useState, useEffect } from 'react';
import divisionService from '../../services/divisionService';
import adminService from '../../services/adminService';

const COLORS = ['#f59e0b', '#6366f1', '#10b981', '#0ea5e9', '#ec4899', '#8b5cf6', '#ef4444', '#84cc16'];

export default function AdminDivisions() {
    const [divisions, setDivisions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ nama: '', deskripsi: '', warna: '#6366f1' });
    const [submitting, setSubmitting] = useState(false);
    const [selectedDivision, setSelectedDivision] = useState(null);

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try {
            const [divRes, userRes] = await Promise.all([
                divisionService.getDivisions().catch(() => null),
                adminService.getUsers().catch(() => null),
            ]);
            setDivisions(divRes?.data?.data || []);
            const rawUsers = userRes?.data?.data?.users || userRes?.data?.users || [];
            setUsers(rawUsers.filter(u => u.role !== 'admin'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editing) {
                await divisionService.updateDivision(editing.id, form);
            } else {
                await divisionService.createDivision(form);
            }
            setShowForm(false);
            setEditing(null);
            setForm({ nama: '', deskripsi: '', warna: '#6366f1' });
            await loadAll();
        } catch (err) {
            alert(err?.response?.data?.message || 'Gagal menyimpan divisi');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (div) => {
        setEditing(div);
        setForm({ nama: div.nama, deskripsi: div.deskripsi || '', warna: div.warna || '#6366f1' });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus divisi ini? Semua laporan divisi juga akan terhapus.')) return;
        await divisionService.deleteDivision(id).catch(() => { });
        await loadAll();
    };

    const handleAssign = async (userId, divisionId) => {
        if (!divisionId) {
            await divisionService.unassignUser(userId).catch(() => { });
        } else {
            await divisionService.assignUser(parseInt(divisionId), userId).catch(() => { });
        }
        await loadAll();
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-extrabold tracking-tight">🗂️ Manage Divisi</h1>
                    <p className="text-white/50 text-sm mt-1">Kelola divisi KKN dan tugaskan anggota</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditing(null); setForm({ nama: '', deskripsi: '', warna: '#6366f1' }); }}
                    className="btn-primary px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Buat Divisi
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="glass-card p-6 border border-primary-400/30 animate-fade-in-up">
                    <h3 className="font-heading font-bold text-base mb-4">{editing ? '✏️ Edit Divisi' : '➕ Buat Divisi Baru'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-white/50 mb-1.5 block">Nama Divisi *</label>
                                <input type="text" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                                    placeholder="Bendahara, Sekretaris, dll." required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-cyan/50" />
                            </div>
                            <div>
                                <label className="text-xs text-white/50 mb-1.5 block">Warna Aksen</label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {COLORS.map(c => (
                                        <button key={c} type="button" onClick={() => setForm(f => ({ ...f, warna: c }))}
                                            className={`w-7 h-7 rounded-full border-2 transition-transform ${form.warna === c ? 'border-white scale-110' : 'border-transparent'}`}
                                            style={{ background: c }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-white/50 mb-1.5 block">Deskripsi</label>
                            <input type="text" value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))}
                                placeholder="Tugas dan tanggung jawab divisi ini..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-cyan/50" />
                        </div>
                        <div className="flex gap-3 justify-end pt-2">
                            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white transition-all">Batal</button>
                            <button type="submit" disabled={submitting} className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50">{submitting ? 'Menyimpan...' : '✓ Simpan'}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Divisions Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {divisions.map(div => (
                        <div key={div.id} className="glass-card p-5 border border-white/10 group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                                        style={{ background: `${div.warna}30`, border: `1.5px solid ${div.warna}60` }}>
                                        {div.nama[0]}
                                    </div>
                                    <div>
                                        <p className="font-heading font-bold text-sm text-white">{div.nama}</p>
                                        <p className="text-xs text-white/40">{div.anggota?.length ?? 0} anggota • {div.jumlah_laporan ?? 0} laporan</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(div)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-primary-500/30 flex items-center justify-center text-white/50 hover:text-white transition-all">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button onClick={() => handleDelete(div.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/30 flex items-center justify-center text-white/50 hover:text-rose-300 transition-all">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                            {div.deskripsi && <p className="text-xs text-white/40 mb-3">{div.deskripsi}</p>}
                            {/* Progress bar */}
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${div.progress ?? 0}%`, background: div.warna }} />
                                </div>
                                <span className="text-xs font-mono" style={{ color: div.warna }}>{div.progress ?? 0}%</span>
                            </div>
                            <button onClick={() => setSelectedDivision(selectedDivision?.id === div.id ? null : div)}
                                className="mt-3 text-xs text-accent-cyan hover:underline">
                                {selectedDivision?.id === div.id ? '▲ Sembunyikan anggota' : '▼ Lihat & assign anggota'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Assign Members Panel */}
            {selectedDivision && (
                <div className="glass-card p-6 border border-white/10 animate-fade-in-up">
                    <h3 className="font-heading font-bold text-base mb-4">
                        👥 Anggota Divisi <span style={{ color: selectedDivision.warna }}>{selectedDivision.nama}</span>
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-white/30 uppercase border-b border-white/5">
                                    <th className="text-left px-4 py-2.5">Mahasiswa</th>
                                    <th className="text-left px-4 py-2.5">NIM</th>
                                    <th className="text-left px-4 py-2.5">Divisi Saat Ini</th>
                                    <th className="text-left px-4 py-2.5">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-white/[0.02]">
                                        <td className="px-4 py-3 text-white font-medium">{u.nama}</td>
                                        <td className="px-4 py-3 text-white/50 font-mono text-xs">{u.nim}</td>
                                        <td className="px-4 py-3">
                                            {u.division_id ? (
                                                <span className="px-2 py-0.5 rounded-lg text-xs bg-primary-500/20 text-primary-300 border border-primary-500/30">
                                                    {divisions.find(d => d.id === u.division_id)?.nama || 'Divisi lain'}
                                                </span>
                                            ) : (
                                                <span className="text-white/30 text-xs">Belum ditugaskan</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                {u.division_id !== selectedDivision.id && (
                                                    <button onClick={() => handleAssign(u.id, selectedDivision.id)}
                                                        className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs hover:bg-emerald-500/30 transition-all">
                                                        → Tugaskan
                                                    </button>
                                                )}
                                                {u.division_id && (
                                                    <button onClick={() => handleAssign(u.id, null)}
                                                        className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs hover:bg-rose-500/30 transition-all">
                                                        ✕ Lepas
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
