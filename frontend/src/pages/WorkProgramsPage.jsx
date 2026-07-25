import { useEffect, useState } from 'react';
import api from '../services/api';

const statusConfig = {
    rencana: { label: 'Rencana', cls: 'bg-white/10 text-white/50 border-white/10', dot: 'rgba(255,255,255,0.4)' },
    persiapan: { label: 'Persiapan', cls: 'bg-info/20 text-info border-info/30', dot: '#00f0ff' },
    berjalan: { label: 'Berjalan', cls: 'bg-warning/20 text-warning border-warning/30', dot: '#ffb700' },
    selesai: { label: 'Selesai', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: '#00ff88' },
};

const StatusBadge = ({ status }) => {
    const s = statusConfig[status?.toLowerCase()] || statusConfig.rencana;
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>
            <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: s.dot }} />
            {s.label}
        </span>
    );
};

const ProgressBar = ({ value }) => (
    <div>
        <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-white/40">Progress</span>
            <span className="text-xs font-bold text-white">{value}%</span>
        </div>
        <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${value}%` }} />
        </div>
    </div>
);

export default function WorkProgramsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('semua');

    useEffect(() => {
        api.get('/work-programs')
            .then(({ data }) => setItems(data.data?.programs || []))
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'semua' ? items : items.filter(i => i.status?.toLowerCase() === filter);
    const filters = ['semua', 'rencana', 'persiapan', 'berjalan', 'selesai'];

    const SkeletonCard = () => (
        <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between">
                <div className="skeleton h-5 w-2/3 rounded" />
                <div className="skeleton h-5 w-16 rounded-full" />
            </div>
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
            <div className="skeleton h-2 w-full rounded-full mt-4" />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
                style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(123,76,245,0.15) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.2) 0%, transparent 70%)' }} />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-accent-cyan to-primary-500" />
                        <p className="text-accent-cyan text-xs font-bold tracking-[0.2em] uppercase">KKNM Cangkuangkulon</p>
                    </div>
                    <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
                        Program <span className="gradient-text">Kerja</span>
                    </h1>
                    <p className="text-white/40 mt-2">Pantau progres dan status program KKN secara real-time.</p>
                </div>
            </div>

            {/* Stats Overview */}
            {!loading && items.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
                    {filters.slice(1).map(f => {
                        const count = items.filter(i => i.status?.toLowerCase() === f).length;
                        const cfg = statusConfig[f];
                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(f === filter ? 'semua' : f)}
                                className={`glass-card p-4 text-left transition-all duration-200 ${filter === f ? 'ring-1 ring-primary-500/50' : ''}`}
                            >
                                <p className="text-2xl font-bold font-heading text-white">{count}</p>
                                <p className={`text-xs font-semibold mt-1 ${cfg.cls.split(' ').find(c => c.startsWith('text-'))}`}>{cfg.label}</p>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Filter Tabs */}
            {!loading && items.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${filter === f
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                    </div>
                    <p className="text-white/50 font-medium">
                        {filter === 'semua' ? 'Belum ada program kerja.' : `Tidak ada program dengan status "${filter}".`}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {filtered.map((item, idx) => (
                        <div key={item.id} className="glass-card p-5 flex flex-col gap-4" style={{ animationDelay: `${idx * 80}ms` }}>
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="font-heading text-lg font-semibold text-white line-clamp-2">{item.nama}</h2>
                                <StatusBadge status={item.status} />
                            </div>

                            {item.deskripsi && (
                                <p className="text-white/40 text-sm leading-relaxed line-clamp-2">{item.deskripsi}</p>
                            )}

                            <ProgressBar value={item.progress ?? 0} />

                            <div className="border-t border-white/5 pt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                                {item.penanggung_jawab && (
                                    <div className="flex items-center gap-1.5 text-xs text-white/40">
                                        <svg className="w-3.5 h-3.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                        {item.penanggung_jawab}
                                    </div>
                                )}
                                {item.target_tanggal && (
                                    <div className="flex items-center gap-1.5 text-xs text-white/40">
                                        <svg className="w-3.5 h-3.5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                                        </svg>
                                        Target: {new Date(item.target_tanggal).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}