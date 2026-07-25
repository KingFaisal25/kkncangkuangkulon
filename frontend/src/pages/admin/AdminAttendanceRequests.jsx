import { useEffect, useState } from 'react';
import api from '../../services/api';

const StatusBadge = ({ status }) => {
    const map = {
        menunggu: { label: 'Menunggu', cls: 'bg-warning/20 text-warning border-warning/30' },
        disetujui: { label: 'Disetujui', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
        ditolak: { label: 'Ditolak', cls: 'bg-danger/20 text-danger border-danger/30' },
    };
    const s = map[status?.toLowerCase()] || { label: status, cls: 'bg-white/10 text-white/60 border-white/10' };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
            {s.label}
        </span>
    );
};

const JenisBadge = ({ jenis }) => {
    const labels = { izin: 'Izin', sakit: 'Sakit', dinas: 'Dinas', koreksi: 'Koreksi' };
    const colors = {
        izin: 'bg-info/15 text-info', sakit: 'bg-warning/15 text-warning',
        dinas: 'bg-primary-500/15 text-primary-300', koreksi: 'bg-accent-pink/15 text-accent-pink',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase ${colors[jenis] || 'bg-white/10 text-white/60'}`}>
            {labels[jenis] || jenis}
        </span>
    );
};

export default function AdminAttendanceRequests() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('semua');
    const [deciding, setDeciding] = useState(null);

    const load = () => api.get('/admin/attendance-requests')
        .then(({ data }) => setItems(data.data?.requests || []))
        .finally(() => setLoading(false));

    useEffect(() => { load(); }, []);

    const decide = async (id, status) => {
        setDeciding(`${id}-${status}`);
        try {
            await api.patch(`/admin/attendance-requests/${id}`, { status });
            await load();
        } finally {
            setDeciding(null);
        }
    };

    const pending = items.filter(i => i.status === 'menunggu').length;
    const filtered = filter === 'semua' ? items : items.filter(i => i.status === filter);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-1">Admin Panel</p>
                    <h1 className="font-heading text-3xl font-bold text-white">Pengajuan Izin & Koreksi</h1>
                    <p className="text-white/40 text-sm mt-1">Tinjau dan putuskan pengajuan dari mahasiswa.</p>
                </div>
                {pending > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning/10 border border-warning/20">
                        <span className="w-2 h-2 rounded-full bg-warning animate-ping" />
                        <span className="text-warning text-sm font-semibold">{pending} menunggu</span>
                    </div>
                )}
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { key: 'semua', label: 'Semua', count: items.length },
                    { key: 'menunggu', label: 'Menunggu', count: items.filter(i => i.status === 'menunggu').length },
                    { key: 'disetujui', label: 'Disetujui', count: items.filter(i => i.status === 'disetujui').length },
                    { key: 'ditolak', label: 'Ditolak', count: items.filter(i => i.status === 'ditolak').length },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${filter === f.key
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {f.label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f.key ? 'bg-white/20' : 'bg-white/10'}`}>{f.count}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass-card p-5 flex gap-4">
                            <div className="flex-1 space-y-3">
                                <div className="skeleton h-5 w-1/3 rounded" />
                                <div className="skeleton h-4 w-2/3 rounded" />
                                <div className="skeleton h-4 w-1/2 rounded" />
                            </div>
                            <div className="skeleton h-8 w-24 rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-white/40 text-sm">
                        {filter === 'semua' ? 'Belum ada pengajuan.' : `Tidak ada pengajuan dengan status "${filter}".`}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((item, idx) => (
                        <div key={item.id} className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-white font-semibold text-sm">{item.user?.nama || 'Mahasiswa'}</span>
                                        <JenisBadge jenis={item.jenis} />
                                        <StatusBadge status={item.status} />
                                    </div>
                                    <p className="text-white/50 text-sm">{new Date(item.tanggal).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                                    <p className="text-white/40 text-sm mt-1 line-clamp-2">{item.alasan}</p>
                                    {item.bukti_url && (
                                        <a href={item.bukti_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent-cyan text-xs mt-1 hover:underline">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                                            Lihat Bukti
                                        </a>
                                    )}
                                </div>
                            </div>
                            {item.status === 'menunggu' && (
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => decide(item.id, 'disetujui')}
                                        disabled={!!deciding}
                                        className="btn-primary px-4 py-2 text-sm font-semibold flex items-center gap-1.5"
                                        style={{ background: 'linear-gradient(135deg, #00ff88, #00b860)' }}
                                    >
                                        {deciding === `${item.id}-disetujui` ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                                        Setujui
                                    </button>
                                    <button
                                        onClick={() => decide(item.id, 'ditolak')}
                                        disabled={!!deciding}
                                        className="btn-danger px-4 py-2 text-sm font-semibold flex items-center gap-1.5"
                                    >
                                        {deciding === `${item.id}-ditolak` ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                                        Tolak
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}