import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import attendanceService from '../services/attendanceService';
import api from '../services/api';
import StatsCard from '../components/ui/StatsCard';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/LoadingSpinner';
import financeService from '../services/financeService';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [activities, setActivities] = useState([]);
  const [workPrograms, setWorkPrograms] = useState([]);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const mainRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useGSAP(() => {
    if (!loading && mainRef.current) {
      gsap.fromTo(
        '.gsap-animate',
        { opacity: 0, y: 25, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, [loading]);

  const loadData = async () => {
    try {
      const [historyResponse, todayData, activitiesRes, programsRes, financeRes] = await Promise.all([
        attendanceService.getHistory().catch(() => null),
        attendanceService.getToday().catch(() => null),
        api.get('/activities?upcoming=1').catch(() => null),
        api.get('/work-programs').catch(() => null),
        financeService.getSummary().catch(() => null),
      ]);
      
      const records = historyResponse?.data?.data || historyResponse?.data || [];
      const totalHadir = records.filter(r => r.status === 'Hadir').length;
      const totalTerlambat = records.filter(r => r.status === 'Terlambat').length;
      const totalAbsensi = totalHadir + totalTerlambat;
      
      const TARGET_HARI_KKN = 40;
      const persentase = Math.min(100, Math.round((totalAbsensi / TARGET_HARI_KKN) * 100));

      setDashboard({
        stats: { total_hadir: totalHadir, total_terlambat: totalTerlambat, total_tidak_hadir: 0, persentase },
        recent: records
      });
      setTodayAttendance(todayData?.data?.attendance || todayData?.attendance || null);

      // Activities & Programs & Finance
      const actList = activitiesRes?.data?.data?.activities || [];
      const progList = programsRes?.data?.data?.programs || [];
      setActivities(actList);
      setWorkPrograms(progList);
      setFinanceSummary(financeRes?.data?.data || null);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboard?.stats || {};
  const recentHistory = dashboard?.recent || [];

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div ref={mainRef} className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="gsap-animate relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900/70 via-surface-light to-surface border border-white/10 p-6 sm:p-8">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-accent-cyan/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
                </span>
                Universitas Langlangbuana Bandung
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs">
                Desa Cangkuangkulon
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight">
              {greeting()}, <span className="gradient-text">{user?.nama?.split(' ')[0] || 'Peserta'}</span> 👋
            </h1>
            <p className="text-white/50 text-sm mt-1.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              <span className="text-white/20">•</span>
              <span className="font-mono text-accent-cyan">{currentTime.toLocaleTimeString('id-ID')}</span>
            </p>
          </div>
          
          <Link to="/attendance" className="shrink-0">
            <button className="btn-primary px-6 py-3 text-sm font-semibold rounded-2xl flex items-center gap-2 shadow-lg shadow-primary-500/30">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Absen Sekarang
            </button>
          </Link>
        </div>
      </div>

      {/* 🚀 QUICK ACTION SHORTCUTS (Akses Cepat KKN) */}
      <div className="gsap-animate grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/attendance" className="glass-card p-3.5 flex items-center gap-3 hover:border-accent-cyan/40 group transition-all">
          <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-accent-cyan transition-colors">Absen Wajah</p>
            <p className="text-[10px] text-white/40">Face recognition</p>
          </div>
        </Link>

        <Link to="/finance" className="glass-card p-3.5 flex items-center gap-3 hover:border-emerald-500/40 group transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Kas & RAB</p>
            <p className="text-[10px] text-white/40">Laporan keuangan</p>
          </div>
        </Link>

        <Link to="/divisions" className="glass-card p-3.5 flex items-center gap-3 hover:border-primary-400/40 group transition-all">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-primary-300 transition-colors">Divisi KKN</p>
            <p className="text-[10px] text-white/40">Laporan pertanggungjawaban</p>
          </div>
        </Link>

        <Link to="/activities" className="glass-card p-3.5 flex items-center gap-3 hover:border-amber-400/40 group transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Agenda KKN</p>
            <p className="text-[10px] text-white/40">Jadwal kegiatan mendatang</p>
          </div>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            value={stats.total_hadir ?? 0}
            label="Total Hadir"
            color="success"
            delay={0}
          />
          <StatsCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            value={stats.total_terlambat ?? 0}
            label="Terlambat"
            color="warning"
            delay={100}
          />
          <StatsCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            value={stats.total_tidak_hadir ?? 0}
            label="Tidak Hadir"
            color="danger"
            delay={200}
          />
          <StatsCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
            value={`${stats.persentase ?? 0}%`}
            label="Kehadiran"
            color="primary"
            delay={300}
          />
        </div>
      )}

      {/* Today's Attendance Card */}
      <div className="animate-fade-in-up">
        <div className={`gradient-border p-6 sm:p-8 ${!todayAttendance ? 'text-center' : ''}`}>
          <div className="relative z-10">
            <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Absensi Hari Ini
            </h2>

            {loading ? (
              <div className="skeleton h-20 w-full" />
            ) : todayAttendance ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                {todayAttendance.face_photo && (
                  <img
                    src={todayAttendance.face_photo.startsWith('http') ? todayAttendance.face_photo : `/storage/${todayAttendance.face_photo}`}
                    alt="Foto absen"
                    className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-md"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge status={todayAttendance.status || 'Hadir'} />
                    {todayAttendance.similarity_score && (
                      <span className="text-xs text-white/40">
                        Kemiripan: {(todayAttendance.similarity_score * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/60">
                    Waktu Absen:{' '}
                    <span className="text-white font-mono font-medium">
                      {todayAttendance.waktu_absen
                        ? todayAttendance.waktu_absen.substring(0, 5)
                        : (todayAttendance.created_at
                          ? new Date(todayAttendance.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                          : '-')}
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <div className="w-16 h-16 rounded-2xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-accent-cyan mx-auto mb-4 animate-pulse-glow">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-white/60 font-medium mb-5">Anda belum melakukan absensi hari ini</p>
                <Link to="/attendance">
                  <button className="btn-primary px-8 py-3 text-sm font-semibold rounded-xl">
                    Absen Face Recognition
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 💰 SECTION: LAPORAN KEUANGAN KKN (Transparansi Kas untuk Seluruh Mahasiswa) */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white leading-tight">Laporan Keuangan KKN</h2>
              <p className="text-xs text-white/40">Transparansi saldo kas, total pemasukan, dan pengeluaran kelompok</p>
            </div>
          </div>
          <Link to="/finance" className="text-xs font-semibold text-accent-cyan hover:underline flex items-center gap-1">
            Detail Keuangan & RAB →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50 font-medium">Saldo Kas Kelompok</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="font-heading text-xl font-extrabold font-mono text-emerald-400">
              {fmt(financeSummary?.saldo)}
            </p>
          </div>

          <div className="glass-card p-5 border border-sky-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50 font-medium">Total Pemasukan</span>
              <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <p className="font-heading text-xl font-extrabold font-mono text-sky-400">
              {fmt(financeSummary?.total_pemasukan)}
            </p>
          </div>

          <div className="glass-card p-5 border border-rose-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50 font-medium">Total Pengeluaran</span>
              <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <p className="font-heading text-xl font-extrabold font-mono text-rose-400">
              {fmt(financeSummary?.total_pengeluaran)}
            </p>
          </div>
        </div>
      </div>

      {/* 📌 SECTION 1: UPCOMING ACTIVITIES (Pengingat Kegiatan Mendatang dari Admin) */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white leading-tight">Kegiatan Mendatang</h2>
              <p className="text-xs text-white/40">Pengingat jadwal kegiatan KKN dari Admin</p>
            </div>
          </div>
          <Link to="/activities" className="text-xs font-semibold text-accent-cyan hover:underline flex items-center gap-1">
            Lihat Semua →
          </Link>
        </div>

        {activities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.slice(0, 4).map((act, idx) => (
              <div key={idx} className="glass-card p-5 relative overflow-hidden group border border-white/10 hover:border-accent-cyan/40">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                    act.status === 'berjalan' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    act.status === 'persiapan' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  }`}>
                    {act.status || 'Rencana'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-accent-cyan font-mono bg-accent-cyan/10 px-2.5 py-1 rounded-lg border border-accent-cyan/20">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {act.jam_mulai ? act.jam_mulai.substring(0, 5) : '08:00'} - {act.jam_selesai ? act.jam_selesai.substring(0, 5) : 'Selesai'}
                  </div>
                </div>

                <h3 className="font-heading font-bold text-base text-white group-hover:text-accent-cyan transition-colors mb-1">
                  {act.nama}
                </h3>
                
                {act.deskripsi && (
                  <p className="text-xs text-white/50 line-clamp-2 mb-3 leading-relaxed">
                    {act.deskripsi}
                  </p>
                )}

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(act.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  {act.lokasi && (
                    <div className="flex items-center gap-1 text-white/60 truncate max-w-[150px]">
                      <svg className="w-3.5 h-3.5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{act.lokasi}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card-static p-6 text-center border border-white/5">
            <p className="text-white/40 text-xs">Belum ada agenda kegiatan mendatang dari Admin.</p>
          </div>
        )}
      </div>

      {/* 🚀 SECTION 2: WORK PROGRAMS (Program Kerja KKN) */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.24a6 6 0 00-4.243 4.243m15.556-15.556a6 6 0 00-4.243 4.243" />
              </svg>
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white leading-tight">Program Kerja KKN</h2>
              <p className="text-xs text-white/40">Status & progres program kerja kelompok KKN</p>
            </div>
          </div>
          <Link to="/programs" className="text-xs font-semibold text-accent-cyan hover:underline flex items-center gap-1">
            Lihat Semua →
          </Link>
        </div>

        {workPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workPrograms.slice(0, 4).map((prog, idx) => (
              <div key={idx} className="glass-card p-5 border border-white/10">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-heading font-bold text-sm text-white truncate">{prog.nama}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-white/70">
                    {prog.status || 'rencana'}
                  </span>
                </div>
                
                {prog.penanggung_jawab && (
                  <p className="text-xs text-white/50 mb-3">
                    PJ: <span className="text-white/80 font-medium">{prog.penanggung_jawab}</span>
                  </p>
                )}

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white/40">Progres</span>
                    <span className="text-accent-cyan font-mono">{prog.progress ?? 0}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-cyan shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all duration-500"
                      style={{ width: `${prog.progress ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card-static p-6 text-center border border-white/5">
            <p className="text-white/40 text-xs">Belum ada daftar program kerja dari Admin.</p>
          </div>
        )}
      </div>

      {/* Recent Attendance */}
      {recentHistory.length > 0 && (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold">Riwayat Absensi Terbaru</h2>
            <Link to="/history" className="text-xs font-semibold text-accent-cyan hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="glass-card-static overflow-hidden border border-white/5">
            <div className="divide-y divide-white/5">
              {recentHistory.slice(0, 5).map((record, idx) => (
                <div key={idx} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/50 text-xs font-mono font-medium">
                      {new Date(record.tanggal || record.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(record.tanggal || record.created_at).toLocaleDateString('id-ID', { weekday: 'long' })}
                      </p>
                      <p className="text-xs text-white/40 font-mono">
                        {record.waktu_absen
                          ? record.waktu_absen.substring(0, 5)
                          : (record.created_at
                            ? new Date(record.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                            : '-')}
                      </p>
                    </div>
                  </div>
                  <Badge status={record.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
