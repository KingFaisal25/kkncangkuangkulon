import { useEffect, useState } from 'react';
import api from '../services/api';

const StatusBadge = ({ status }) => {
  const map = {
    aktif: { label: 'Aktif', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    selesai: { label: 'Selesai', cls: 'bg-primary-500/20 text-primary-300 border-primary-500/30' },
    dibatalkan: { label: 'Dibatalkan', cls: 'bg-danger/20 text-danger border-danger/30' },
  };
  const s = map[status?.toLowerCase()] || { label: status, cls: 'bg-white/10 text-white/60 border-white/10' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {s.label}
    </span>
  );
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/activities')
      .then(({ data }) => setActivities(data.data?.activities || []))
      .finally(() => setLoading(false));
  }, []);

  const SkeletonCard = () => (
    <div className="glass-card p-5 space-y-3">
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/3 rounded mt-2" />
      <div className="skeleton h-4 w-full rounded mt-3" />
      <div className="skeleton h-4 w-5/6 rounded" />
      <div className="flex gap-2 mt-4">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{ background: 'linear-gradient(135deg, rgba(123,76,245,0.2) 0%, rgba(0,240,255,0.1) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(123,76,245,0.3) 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-accent-cyan to-primary-500" />
            <p className="text-accent-cyan text-xs font-bold tracking-[0.2em] uppercase">KKNM Cangkuangkulon</p>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
            Kegiatan <span className="gradient-text">KKN</span>
          </h1>
          <p className="text-white/40 mt-2">Agenda dan kegiatan yang dapat diikuti oleh mahasiswa peserta KKN.</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : activities.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="text-white/50 font-medium">Belum ada kegiatan yang dibuat admin.</p>
          <p className="text-white/25 text-sm mt-1">Kegiatan akan muncul di sini setelah admin menambahkannya.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {activities.map((activity, idx) => (
            <div
              key={activity.id}
              className="glass-card p-5 group"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="font-heading text-lg font-semibold text-white group-hover:text-accent-cyan transition-colors line-clamp-2">
                  {activity.nama}
                </h2>
                <StatusBadge status={activity.status} />
              </div>

              {activity.deskripsi && (
                <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">{activity.deskripsi}</p>
              )}

              <div className="border-t border-white/5 pt-4 mt-auto space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <svg className="w-4 h-4 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                  </svg>
                  <span>{new Date(activity.tanggal).toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <svg className="w-4 h-4 text-accent-cyan shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{activity.jam_mulai} – {activity.jam_selesai}</span>
                </div>
                {activity.lokasi && (
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <svg className="w-4 h-4 text-accent-pink shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span>{activity.lokasi}</span>
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