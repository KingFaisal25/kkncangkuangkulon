import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import divisionService from '../services/divisionService';
import { CardSkeleton } from '../components/ui/LoadingSpinner';

const STATUS_COLORS = {
    rencana: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
    berjalan: { bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-500/30' },
    selesai: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
};

function ProgressBar({ value, color = '#6366f1' }) {
    return (
        <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, value || 0)}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`, boxShadow: `0 0 8px ${color}66` }}
            />
        </div>
    );
}

export default function DivisionsPage() {
    const { user } = useAuth();
    const [divisions, setDivisions] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDivision, setActiveDivision] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ judul: '', deskripsi: '', progress: 50, status: 'berjalan', foto_bukti: '', tanggal_laporan: new Date().toISOString().slice(0, 10) });
    const [fotoPreview, setFotoPreview] = useState(null);
    const fileRef = useRef();

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try {
            const [divRes, repRes] = await Promise.all([
                divisionService.getDivisions().catch(() => null),
                divisionService.getReports().catch(() => null),
            ]);
            setDivisions(divRes?.data?.data || []);
            setReports(repRes?.data?.data || []);
        } finally {
            setLoading(false);
        }
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setForm(f => ({ ...f, foto_bukti: ev.target.result }));
            setFotoPreview(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activeDivision) return;
        setSubmitting(true);
        try {
            await divisionService.createReport({ ...form, division_id: activeDivision.id });
            setShowForm(false);
            setForm({ judul: '', deskripsi: '', progress: 50, status: 'berjalan', foto_bukti: '', tanggal_laporan: new Date().toISOString().slice(0, 10) });
            setFotoPreview(null);
            await loadAll();
        } catch (err) {
            alert(err?.response?.data?.message || 'Gagal menyimpan laporan');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus laporan ini?')) return;
        await divisionService.deleteReport(id).catch(() => { });
        await loadAll();
    };

    // Export reports as CSV
    const exportCSV = () => {
        const filtered = activeDivision ? reports.filter(r => r.division_id === activeDivision.id) : reports;
        const headers = ['Divisi', 'Judul', 'Progress (%)', 'Status', 'Pelapor', 'Tanggal'];
        const rows = filtered.map(r => [
            r.division?.nama || '-',
            r.judul,
            r.progress,
            r.status,
            r.user?.nama || '-',
            r.tanggal_laporan ? r.tanggal_laporan.slice(0, 10) : r.created_at?.slice(0, 10),
        ]);
        const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'laporan-divisi.csv'; a.click();
    };

    const exportPDF = () => {
        window.print();
    };

    const filtered = activeDivision ? reports.filter(r => r.division_id === activeDivision.id) : reports;

    return (
        <div className="space-y-8 animate-fade-in-up print:text-black print:bg-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
                        ðŸ—‚ï¸ Divisi <span className="gradient-text">KKN</span>
                    </h1>
                    <p className="text-white/50 text-sm mt-1">Progres dan laporan kerja per divisi</p>
                </div>
                <div className="flex gap-2 flex-wrap print:hidden">
                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/30 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export CSV
                    </button>
                    <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-semibold hover:bg-rose-500/30 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Division Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {divisions.map(div => (
                        <button
                            key={div.id}
                            onClick={() => setActiveDivision(activeDivision?.id === div.id ? null : div)}
                            className={`glass-card p-5 text-left border transition-all duration-200 group ${activeDivision?.id === div.id ? 'border-primary-400/60 bg-primary-500/10' : 'border-white/10 hover:border-white/30'}`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ background: `${div.warna}30`, border: `1.5px solid ${div.warna}60` }}>
                                    {div.nama[0]}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-heading font-bold text-sm text-white truncate">{div.nama}</p>
                                    <p className="text-xs text-white/40">{div.jumlah_anggota ?? div.anggota?.length ?? 0} anggota</p>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-white/40">Progres</span>
                                    <span style={{ color: div.warna }}>{div.progress ?? 0}%</span>
                                </div>
                                <ProgressBar value={div.progress} color={div.warna} />
                            </div>
                            <p className="text-xs text-white/30 mt-2">{div.jumlah_laporan ?? 0} laporan</p>
                        </button>
                    ))}
                </div>
            )}

            {/* Reports Section */}
            <div id="report-print-area">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div>
                        <h2 className="font-heading text-lg font-bold text-white">
                            {activeDivision ? `Laporan â€” ${activeDivision.nama}` : 'Semua Laporan Divisi'}
                        </h2>
                        {activeDivision && <p className="text-xs text-white/40">{activeDivision.deskripsi}</p>}
                    </div>
                    <button
                        onClick={() => {
                            if (!activeDivision && user?.division_id) {
                                const myDiv = divisions.find(d => d.id === user.division_id);
                                if (myDiv) setActiveDivision(myDiv);
                            }
                            setShowForm(true);
                        }}
                        className="btn-primary px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 print:hidden"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Tambah Laporan
                    </button>
                </div>

                {/* Add Report Form */}
                {showForm && (
                    <div className="glass-card p-6 border border-primary-400/30 mb-6 animate-fade-in-up print:hidden">
                        <h3 className="font-heading font-bold text-base mb-4 text-white">ðŸ“ Laporan Baru</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Division Select */}
                                <div>
                                    <label className="text-xs text-white/50 mb-1.5 block">Divisi *</label>
                                    <select
                                        value={activeDivision?.id || ''}
                                        onChange={e => setActiveDivision(divisions.find(d => d.id === +e.target.value) || null)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50"
                                        required
                                    >
                                        <option value="">Pilih Divisi</option>
                                        {divisions.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                                    </select>
                                </div>
                                {/* Status */}
                                <div>
                                    <label className="text-xs text-white/50 mb-1.5 block">Status *</label>
                                    <select
                                        value={form.status}
                                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50"
                                    >
                                        <option value="rencana">ðŸ“‹ Rencana</option>
                                        <option value="berjalan">âš™ï¸ Berjalan</option>
                                        <option value="selesai">âœ… Selesai</option>
                                    </select>
                                </div>
                            </div>

                            {/* Judul */}
                            <div>
                                <label className="text-xs text-white/50 mb-1.5 block">Judul Laporan *</label>
                                <input
                                    type="text"
                                    value={form.judul}
                                    onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
                                    placeholder="Contoh: Sosialisasi Program Kerja Minggu ke-2"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-cyan/50"
                                    required
                                />
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <label className="text-xs text-white/50 mb-1.5 block">Deskripsi</label>
                                <textarea
                                    value={form.deskripsi}
                                    onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))}
                                    rows={3}
                                    placeholder="Jelaskan perkembangan, kendala, atau catatan penting..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-cyan/50 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Progress */}
                                <div>
                                    <label className="text-xs text-white/50 mb-1.5 block">Progres: <span className="text-accent-cyan font-bold">{form.progress}%</span></label>
                                    <input
                                        type="range"
                                        min={0} max={100} step={5}
                                        value={form.progress}
                                        onChange={e => setForm(f => ({ ...f, progress: +e.target.value }))}
                                        className="w-full accent-cyan-400"
                                    />
                                </div>
                                {/* Tanggal */}
                                <div>
                                    <label className="text-xs text-white/50 mb-1.5 block">Tanggal Laporan *</label>
                                    <input
                                        type="date"
                                        value={form.tanggal_laporan}
                                        onChange={e => setForm(f => ({ ...f, tanggal_laporan: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Foto Bukti */}
                            <div>
                                <label className="text-xs text-white/50 mb-1.5 block">Foto Bukti (opsional)</label>
                                <input type="file" accept="image/*" ref={fileRef} onChange={handleFile} className="hidden" />
                                <button type="button" onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:border-accent-cyan/40 hover:text-white transition-all">
                                    ðŸ“· Pilih Foto
                                </button>
                                {fotoPreview && (
                                    <img src={fotoPreview} alt="preview" className="mt-2 w-32 h-32 object-cover rounded-xl border border-white/10" />
                                )}
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/30 transition-all">Batal</button>
                                <button type="submit" disabled={submitting} className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50">
                                    {submitting ? 'Menyimpan...' : 'âœ“ Simpan Laporan'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Reports Table / Cards */}
                {filtered.length === 0 ? (
                    <div className="glass-card-static p-10 text-center border border-white/5">
                        <p className="text-white/30 text-sm">Belum ada laporan{activeDivision ? ` untuk divisi ${activeDivision.nama}` : ''}.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(r => {
                            const sc = STATUS_COLORS[r.status] || STATUS_COLORS.rencana;
                            return (
                                <div key={r.id} className="glass-card p-5 border border-white/10 flex flex-col sm:flex-row gap-4">
                                    {/* Foto bukti */}
                                    {r.foto_bukti && (
                                        <img src={r.foto_bukti} alt="bukti" className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="font-heading font-bold text-sm text-white">{r.judul}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>{r.status}</span>
                                            <span className="text-xs text-white/30 ml-auto">{r.division?.nama}</span>
                                        </div>
                                        {r.deskripsi && <p className="text-xs text-white/50 mb-2 line-clamp-2">{r.deskripsi}</p>}
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <ProgressBar value={r.progress} color={r.division?.warna || '#6366f1'} />
                                            </div>
                                            <span className="text-xs font-bold text-accent-cyan font-mono">{r.progress}%</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2 text-xs text-white/30">
                                            <span>oleh {r.user?.nama || 'Anggota'} â€¢ {r.tanggal_laporan?.slice(0, 10) || r.created_at?.slice(0, 10)}</span>
                                            {(user?.role === 'admin' || r.user_id === user?.id) && (
                                                <button onClick={() => handleDelete(r.id)} className="text-rose-400 hover:text-rose-300 transition-colors print:hidden">Hapus</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
