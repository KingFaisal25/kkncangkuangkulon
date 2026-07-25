import { useEffect, useState } from 'react';
import api from '../../services/api';

const initial = { nama: '', deskripsi: '', penanggung_jawab: '', target_tanggal: '', status: 'rencana', progress: 0, catatan: '' };

const statusConfig = {
    rencana: { label: 'Rencana', cls: 'bg-white/10 text-white/50 border-white/10', bar: 'rgba(255,255,255,0.3)' },
    persiapan: { label: 'Persiapan', cls: 'bg-info/20 text-info border-info/30', bar: '#00f0ff' },
    berjalan: { label: 'Berjalan', cls: 'bg-warning/20 text-warning border-warning/30', bar: '#ffb700' },
    selesai: { label: 'Selesai', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', bar: '#00ff88' },
};

const StatusBadge = ({ status }) => {
    const s = statusConfig[status?.toLowerCase()] || statusConfig.rencana;
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>{s.label}</span>;
};

export default function AdminWorkPrograms() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initial);
    const [editing, setEditing] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = () => api.get('/admin/work-programs')
        .then(({ data }) => setItems(data.data?.programs || []))
        .finally(() => setLoading(false));

    useEffect(() => { load(); }, []);

    const change = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) await api.put(`/admin/work-programs/${editing}`, form);
            else await api.post('/admin/work-programs', form);
            setForm(initial);
            setEditing(null);
            setShowForm(false);
            setMessage({ text: editing ? 'Program berhasil diperbarui.' : 'Program berhasil ditambahkan.', type: 'success' });
            load();
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Gagal menyimpan.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const edit = (item) => {
        setEditing(item.id);
        setForm({ ...item, target_tanggal: item.target_tanggal?.slice(0, 10) || '', catatan: item.catatan || '' });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const remove = async (id) => {
        if (!confirm('Hapus program ini?')) return;
        await api.delete(`/admin/work-programs/${id}`);
        load();
        setMessage({ text: 'Program berhasil dihapus.', type: 'success' });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-1">Admin Panel</p>
                    <h1 className="font-heading text-3xl font-bold text-white">Kelola Program Kerja</h1>
                    <p className="text-white/40 text-sm mt-1">Kelola dan pantau progres program kerja KKN.</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setForm(initial); setShowForm(!showForm); }}
                    className="btn-primary px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shrink-0"
                >
                    <svg className={`w-4 h-4 transition-transform duration-300 ${showForm && !editing ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {showForm && !editing ? 'Batal' : 'Tambah Program'}
                </button>
            </div>

            {/* Notification */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm animate-fade-in ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-danger/10 border border-danger/20 text-danger'}`}>
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {message.type === 'success'
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        }
                    </svg>
                    {message.text}
                </div>
            )}

            {/* Form */}
            {showForm && (
                <div className="glass-card p-6 animate-scale-in">
                    <h2 className="font-heading text-lg font-semibold mb-5">
                        {editing ? '✏️ Edit Program Kerja' : '➕ Tambah Program Kerja'}
                    </h2>
                    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Nama Program</label>
                            <input className="glass-input w-full px-4 py-2.5 text-sm" name="nama" value={form.nama} onChange={change} placeholder="Nama program kerja" required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Penanggung Jawab</label>
                            <input className="glass-input w-full px-4 py-2.5 text-sm" name="penanggung_jawab" value={form.penanggung_jawab} onChange={change} placeholder="Nama PJ" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Deskripsi</label>
                            <textarea className="glass-input w-full px-4 py-3 text-sm min-h-20 resize-none" name="deskripsi" value={form.deskripsi} onChange={change} placeholder="Deskripsi program..." />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Target Tanggal</label>
                            <input type="date" className="glass-input w-full px-4 py-2.5 text-sm" name="target_tanggal" value={form.target_tanggal} onChange={change} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Status</label>
                            <select className="glass-input w-full px-4 py-2.5 text-sm" name="status" value={form.status} onChange={change}>
                                <option value="rencana">Rencana</option>
                                <option value="persiapan">Persiapan</option>
                                <option value="berjalan">Berjalan</option>
                                <option value="selesai">Selesai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                                Progress: <span className="text-primary-400 font-bold">{form.progress}%</span>
                            </label>
                            <input type="range" min="0" max="100" name="progress" value={form.progress} onChange={change} className="w-full accent-primary-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Catatan</label>
                            <input className="glass-input w-full px-4 py-2.5 text-sm" name="catatan" value={form.catatan} onChange={change} placeholder="Catatan tambahan..." />
                        </div>
                        <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-white/5">
                            <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(initial); }} className="btn-secondary px-5 py-2.5 text-sm">Batal</button>
                            <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 text-sm font-semibold flex items-center gap-2">
                                {saving ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Menyimpan...</> : editing ? 'Simpan Perubahan' : 'Tambah Program'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Programs Grid */}
            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                    {[...Array(4)].map((_, i) => <div key={i} className="glass-card p-5 space-y-4"><div className="skeleton h-5 w-3/4 rounded" /><div className="skeleton h-4 w-full rounded" /><div className="skeleton h-2 w-full rounded-full" /></div>)}
                </div>
            ) : items.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-white/40 text-sm">Belum ada program kerja. Tambahkan program pertama!</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {items.map((item, idx) => {
                        const cfg = statusConfig[item.status?.toLowerCase()] || statusConfig.rencana;
                        return (
                            <div key={item.id} className="glass-card p-5 flex flex-col gap-4" style={{ animationDelay: `${idx * 60}ms` }}>
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="font-heading text-base font-semibold text-white">{item.nama}</h2>
                                    <StatusBadge status={item.status} />
                                </div>
                                {item.deskripsi && <p className="text-white/40 text-sm line-clamp-2 -mt-2">{item.deskripsi}</p>}

                                {/* Progress */}
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-white/40">Progress</span>
                                        <span className="font-bold text-white">{item.progress}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.progress}%`, background: cfg.bar }} />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-white/5">
                                    {item.penanggung_jawab && (
                                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                                            <svg className="w-3.5 h-3.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
                                            {item.penanggung_jawab}
                                        </div>
                                    )}
                                    {item.target_tanggal && (
                                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                                            <svg className="w-3.5 h-3.5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" /></svg>
                                            {new Date(item.target_tanggal).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => edit(item)} className="btn-secondary flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                                        Edit
                                    </button>
                                    <button onClick={() => remove(item.id)} className="btn-danger flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}