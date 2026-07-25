import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(isAdmin ? '/admin/login' : '/login');
  };

  const timeStr = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateStr = currentTime.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  // Admin Navigation
  const adminNavLinks = [
    { to: '/admin', label: 'Dashboard', icon: HomeIcon },
    { to: '/admin/users', label: 'Peserta', icon: UsersIcon },
    { to: '/admin/attendance', label: 'Rekap Absen', icon: ChartBarIcon },
    { to: '/admin/divisions', label: 'Kelola Divisi', icon: FolderIcon },
  ];

  // Peserta Primary Links (High Frequency)
  const primaryNavLinks = [
    { to: '/', label: 'Dashboard', icon: HomeIcon },
    { to: '/attendance', label: 'Absensi', icon: CameraIcon },
    { to: '/programs', label: 'Proker', icon: RocketIcon },
    { to: '/divisions', label: 'Divisi', icon: FolderIcon },
    { to: '/finance', label: 'Keuangan', icon: WalletIcon },
  ];

  // Peserta Secondary Links (Dropdown 'Fitur Lainnya')
  const secondaryNavLinks = [
    { to: '/history', label: 'Riwayat Absensi', icon: ClockIcon, desc: 'Catatan log absensi harian' },
    { to: '/activities', label: 'Agenda Kegiatan', icon: CalendarIcon, desc: 'Jadwal & kegiatan KKN' },
    { to: '/requests', label: 'Izin & Koreksi', icon: DocumentCheckIcon, desc: 'Pengajuan izin / koreksi absen' },
    { to: '/reports', label: 'Laporan Kegiatan', icon: FileTextIcon, desc: 'Laporan pertanggungjawaban' },
  ];

  const isSecondaryActive = secondaryNavLinks.some((l) => location.pathname === l.to);

  return (
    <header className="sticky top-0 z-50 pt-2 pb-1 px-3 sm:px-6">
      <nav className="max-w-7xl mx-auto bg-[#09091e]/85 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
        <div className="px-3 sm:px-5">
          <div className="flex items-center justify-between h-16 gap-3">

            {/* 1. Brand Logo */}
            <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-cyan p-0.5 shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-[#070716] rounded-[10px] flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent-cyan animate-pulse-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-extrabold text-sm sm:text-base tracking-wide text-white">
                    Absensi <span className="gradient-text">KKN</span>
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 rounded-full">
                    UNLA
                  </span>
                </div>
                <p className="text-[10px] text-white/40 font-medium leading-none mt-0.5">{dateStr}</p>
              </div>
            </Link>

            {/* 2. Desktop Clean Navigation */}
            <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
              {isAdmin ? (
                adminNavLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-600/50 to-accent-cyan/30 text-white border border-primary-400/40 shadow-sm'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <link.icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent-cyan' : 'text-white/40'}`} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })
              ) : (
                <>
                  {/* Primary Links */}
                  {primaryNavLinks.map((link) => {
                    const isActive = location.pathname === link.to;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-600/50 to-accent-cyan/30 text-white border border-primary-400/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <link.icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent-cyan' : 'text-white/40'}`} />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}

                  {/* Secondary Links Dropdown ("Lainnya ▾") */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        isSecondaryActive
                          ? 'bg-gradient-to-r from-primary-600/50 to-accent-cyan/30 text-white border border-primary-400/40'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                      <span>Lainnya</span>
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-accent-cyan' : 'text-white/40'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Popover Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 p-2 rounded-2xl bg-[#0b0c24]/95 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-1 animate-fade-in-down">
                        <div className="px-2 py-1 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Fitur & Aktivitas
                        </div>
                        {secondaryNavLinks.map((link) => {
                          const isActive = location.pathname === link.to;
                          return (
                            <Link
                              key={link.to}
                              to={link.to}
                              onClick={() => setDropdownOpen(false)}
                              className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                                isActive
                                  ? 'bg-primary-500/20 text-white border border-primary-500/30'
                                  : 'text-white/70 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-white/5 text-white/50'}`}>
                                <link.icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold leading-tight">{link.label}</p>
                                <p className="text-[10px] text-white/40 truncate mt-0.5">{link.desc}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 3. Right Action Section */}
            <div className="flex items-center gap-2">
              
              {/* Clock Badge */}
              <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-white/80 text-xs font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{timeStr}</span>
              </div>

              {/* User Profile Popover */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all group"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary-500 to-accent-cyan flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {(user?.nama || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-xs font-semibold text-white/90 max-w-[90px] truncate">
                    {user?.nama?.split(' ')[0] || 'User'}
                  </span>
                  <svg className="w-3 h-3 text-white/40 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Popover Card */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 p-4 rounded-2xl bg-[#0b0c24]/95 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-3 animate-fade-in-down">
                    {/* Header */}
                    <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-accent-cyan flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {(user?.nama || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{user?.nama || 'User'}</p>
                        <p className="text-[10px] text-white/40 font-mono truncate">{user?.nim || 'Peserta'}</p>
                        {user?.division?.nama && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30">
                            {user.division.nama}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Settings */}
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
                          setTheme(next);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <span className="flex items-center gap-2">
                          {theme === 'dark' ? <SunIcon className="w-4 h-4 text-amber-300" /> : <MoonIcon className="w-4 h-4 text-accent-cyan" />}
                          <span>Mode Tampilan</span>
                        </span>
                        <span className="text-[10px] capitalize font-mono text-white/40">{theme}</span>
                      </button>

                      <button
                        onClick={toggleFullscreen}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <span className="flex items-center gap-2">
                          <ExpandIcon className="w-4 h-4 text-primary-400" />
                          <span>Layar Penuh</span>
                        </span>
                        <span className="text-[10px] font-mono text-white/40">{isFullscreen ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Keluar Akun
                    </button>

                    {/* Developer Credit Desktop */}
                    <div className="pt-2 mt-2 border-t border-white/5 text-center">
                      <p className="text-[10px] text-white/30 font-mono">
                        Development by <strong className="text-accent-cyan/70 font-semibold">KingFaisal</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
              >
                {menuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>

            </div>
          </div>
        </div>

        {/* 4. Mobile Drawer Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-[#09091e]/95 backdrop-blur-2xl border-t border-white/10 p-4 space-y-4 rounded-b-2xl animate-fade-in-down">
            {/* Primary Section */}
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">Navigasi Utama</p>
              <div className="grid grid-cols-2 gap-2">
                {(isAdmin ? adminNavLinks : primaryNavLinks).map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-600/40 to-accent-cyan/30 text-white border border-primary-500/50'
                          : 'text-white/60 hover:text-white hover:bg-white/5 border border-white/5'
                      }`}
                    >
                      <link.icon className={`w-4 h-4 ${isActive ? 'text-accent-cyan' : 'text-white/50'}`} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Secondary Section (for Peserta) */}
            {!isAdmin && (
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">Fitur & Aktivitas</p>
                <div className="grid grid-cols-2 gap-2">
                  {secondaryNavLinks.map((link) => {
                    const isActive = location.pathname === link.to;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-600/40 to-accent-cyan/30 text-white border border-primary-500/50'
                            : 'text-white/60 hover:text-white hover:bg-white/5 border border-white/5'
                        }`}
                      >
                        <link.icon className={`w-4 h-4 ${isActive ? 'text-accent-cyan' : 'text-white/50'}`} />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Drawer User Info & Logout */}
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-accent-cyan flex items-center justify-center text-xs font-bold text-white">
                    {(user?.nama || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/90">{user?.nama || 'User'}</p>
                    <p className="text-[10px] text-white/40 font-mono">{user?.nim || ''}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20"
                >
                  Keluar
                </button>
              </div>

              {/* Developer Credit Mobile */}
              <div className="text-center pt-2">
                <p className="text-[10px] text-white/30 font-mono">
                  UNLA Bandung · Development by <strong className="text-accent-cyan/70 font-semibold">KingFaisal</strong>
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

/* ─── Custom Icons ──────────────────────────── */

function HomeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function CameraIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CalendarIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function DocumentCheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function RocketIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.24a6 6 0 00-4.243 4.243m15.556-15.556a6 6 0 00-4.243 4.243" />
    </svg>
  );
}

function FileTextIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function ChartBarIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function FolderIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function WalletIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function SunIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MoonIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function ExpandIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  );
}
