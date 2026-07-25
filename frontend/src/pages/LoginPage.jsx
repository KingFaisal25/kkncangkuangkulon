import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/* Ã¢â€â‚¬Ã¢â€â‚¬ Floating orb Ã¢â€â‚¬Ã¢â€â‚¬ */
const Orb = ({ style }) => (
  <div className="absolute rounded-full pointer-events-none" style={style} />
);

/* Ã¢â€â‚¬Ã¢â€â”€ Animated particle dots Ã¢â€â‚¬Ã¢â€â‚¬ */
const Particles = () => {
  const dots = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map(d => (
        <div
          key={d.id}
          className="absolute rounded-full opacity-25 animate-float"
          style={{
            width: d.size, height: d.size, left: `${d.x}%`, top: `${d.y}%`,
            background: d.id % 3 === 0 ? '#00f0ff' : d.id % 3 === 1 ? '#7b4cf5' : '#ff007f',
            animationDelay: `${d.delay}s`, animationDuration: `${d.duration}s`,
            boxShadow: `0 0 8px ${d.id % 3 === 0 ? '#00f0ff' : d.id % 3 === 1 ? '#7b4cf5' : '#ff007f'}`,
          }}
        />
      ))}
    </div>
  );
};

/* Ã¢â€â‚¬Ã¢â€â‚¬ KKN-themed SVG illustration: rising sun over village hills + people Ã¢â€â‚¬Ã¢â€â‚¬ */
const KknIllustration = () => (
  <svg viewBox="0 0 520 360" className="w-full h-auto login-illustration" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#7b4cf5" stopOpacity="0.12" />
      </linearGradient>
      <linearGradient id="river" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00f0ff" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <radialGradient id="pingGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ff007f" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#ff007f" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* map panel frame */}
    <rect x="20" y="20" width="480" height="320" rx="20" fill="rgba(13,13,38,0.55)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

    {/* faint grid */}
    <g stroke="rgba(255,255,255,0.04)" strokeWidth="1">
      {Array.from({ length: 9 }).map((_, i) => <line key={'v'+i} x1={68 + i*48} y1="20" x2={68 + i*48} y2="340" />)}
      {Array.from({ length: 6 }).map((_, i) => <line key={'h'+i} x1="20" y1={68 + i*48} x2="500" y2={68 + i*48} />)}
    </g>

    {/* land parcels (jalan sawah/desa) */}
    <g stroke="rgba(0,240,255,0.35)" strokeWidth="1.5">
      <path d="M60 90 H230 V200 H60 Z" fill="url(#land)" />
      <path d="M250 90 H460 V170 H250 Z" fill="url(#land)" />
      <path d="M60 220 H220 V300 H60 Z" fill="url(#land)" />
      <path d="M250 190 H460 V300 H250 Z" fill="url(#land)" />
      {/* internal plot lines */}
      <path d="M145 90 V200 M60 145 H230" />
      <path d="M355 90 V170 M250 130 H460" />
      <path d="M140 220 V300 M60 260 H220" />
      <path d="M355 190 V300 M250 245 H460" />
    </g>

    {/* river curving across map */}
    <path className="map-river" d="M40 120 Q160 80 230 140 T480 200" stroke="url(#river)" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85" />

    {/* main road dashed */}
    <path className="map-road" d="M80 60 L260 180 L440 300" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeDasharray="8 6" fill="none" />

    {/* POI markers (points of interest) */}
    <g className="map-markers">
      {/* balai desa */}
      <g className="map-poi">
        <circle cx="260" cy="180" r="22" fill="url(#pingGlow)" className="map-ping" />
        <circle cx="260" cy="180" r="7" fill="#ff007f" />
        <circle cx="260" cy="180" r="3" fill="#fff" />
        <text x="272" y="172" fill="#fff" fontSize="11" fontWeight="700">Balai Desa</text>
        <text x="272" y="186" fill="#00f0ff" fontSize="9">Cangkuangkulon</text>
      </g>
      {/* posko KKN */}
      <g className="map-poi" style={{ animationDelay: '-1.5s' }}>
        <circle cx="145" cy="145" r="16" fill="url(#pingGlow)" className="map-ping" />
        <circle cx="145" cy="145" r="5" fill="#00f0ff" />
        <text x="155" y="140" fill="#fff" fontSize="10" fontWeight="700">Posko KKN</text>
      </g>
      {/* lapangan */}
      <g className="map-poi" style={{ animationDelay: '-3s' }}>
        <circle cx="355" cy="245" r="16" fill="url(#pingGlow)" className="map-ping" />
        <circle cx="355" cy="245" r="5" fill="#10b981" />
        <text x="365" y="240" fill="#fff" fontSize="10" fontWeight="700">Lapangan</text>
      </g>
    </g>

    {/* compass */}
    <g transform="translate(450,55)" className="map-compass">
      <circle r="16" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.2)" />
      <path d="M0 -12 L4 0 L0 12 L-4 0 Z" fill="#ff007f" />
      <text x="0" y="-19" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="700">N</text>
    </g>

    {/* scale bar */}
    <g transform="translate(40,318)">
      <rect x="0" y="0" width="80" height="5" fill="none" stroke="rgba(255,255,255,0.4)" />
      <rect x="0" y="0" width="40" height="5" fill="rgba(255,255,255,0.4)" />
      <text x="0" y="-3" fill="rgba(255,255,255,0.5)" fontSize="8">0</text>
      <text x="76" y="-3" fill="rgba(255,255,255,0.5)" fontSize="8">500m</text>
    </g>
  </svg>
);
const Feature = ({ icon, title, desc }) => (
  <div className="glass-card no-tilt p-4 border border-white/10 group">
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500/30 to-accent-cyan/20 border border-white/10 flex items-center justify-center text-accent-cyan shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-xs text-white/40 mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
  </div>
);

/* Ã¢â€â‚¬Ã¢â€â”€ Marquee strip Ã¢â€â‚¬Ã¢â€â‚¬ */
const Marquee = ({ text, count = 8, reverse = false }) => {
  const items = Array(count).fill(text);
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div className="inline-flex gap-8" style={{ animation: `marquee${reverse ? 'R' : ''} 28s linear infinite` }}>
        {[...items, ...items].map((t, i) => (
          <span key={i} className="text-xs font-bold tracking-[0.25em] uppercase opacity-30 shrink-0">
            {t} <span className="opacity-50 mx-2">Ã¢Å“Â¦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ nim: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const containerRef = useRef(null);

  useGSAP(() => {
    if (containerRef.current) {
      gsap.fromTo('.gsap-left-panel > *',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' });
      gsap.fromTo('.gsap-card',
        { opacity: 0, y: 35, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.4)', delay: 0.2 });
    }
  }, { scope: containerRef });

  useEffect(() => {
    if (document.getElementById('marquee-style')) return;
    const style = document.createElement('style');
    style.id = 'marquee-style';
    style.textContent = `
      @keyframes marquee   { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      @keyframes marqueeR  { from { transform: translateX(-50%); } to { transform: translateX(0); } }
    `;
    document.head.appendChild(style);
  }, []);

  if (isAuthenticated) { navigate('/', { replace: true }); return null; }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError(''); setSuccessMessage('');
  };

  const validate = () => {
    const errs = {};
    if (!form.nim.trim()) errs.nim = 'NIM wajib diisi';
    if (!form.password) errs.password = 'Password wajib diisi';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await login(form.nim, form.password);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || err.response?.data?.error || 'Login gagal. Periksa NIM dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden" style={{ background: '#05050f' }}>
      <div className="gradient-mesh" />
      <Particles />

      <Orb style={{ top: '-15%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(123,76,245,0.25) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <Orb style={{ bottom: '-20%', left: '-10%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <Orb style={{ top: '40%', left: '30%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,0,127,0.1) 0%, transparent 60%)', filter: 'blur(50px)', animation: 'float 10s ease-in-out infinite' }} />

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â LEFT PANEL Ã¢â‚¬â€ Branding + Illustration Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <div className="gsap-left-panel flex flex-col justify-between w-full lg:w-1/2 relative z-10 p-6 sm:p-10 lg:p-12 overflow-hidden">

        {/* Top logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="font-heading font-bold text-white text-lg tracking-wide block leading-none">Absensi KKN</span>
            <span className="text-[11px] font-semibold text-accent-cyan tracking-wider">Universitas Langlangbuana Bandung</span>
          </div>
        </div>

        {/* Center: headline + illustration */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-accent-cyan/20 w-fit">
            <div className="w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
            <span className="text-accent-cyan text-xs font-extrabold tracking-[0.15em] uppercase">Desa Cangkuangkulon</span>
          </div>

          <h1 className="font-heading text-5xl xl:text-6xl font-black leading-[1.05] text-white">
            Hadir <br />
            <span className="gradient-text-glow">Tepat</span> Waktu.
          </h1>

          <p className="text-white/50 text-base max-w-md leading-relaxed">
            Portal Absensi Digital & Program Kerja KKN <strong className="text-white">UNLA Bandung</strong>.
          </p>

          {/* Illustration */}
          <div className="max-w-md">
            <KknIllustration />
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <Feature
              title="Face Recognition"
              desc="Absen wajah anti-titip"
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-4.5L21 7.5m0 0L16.5 3M21 7.5H7.5" /></svg>}
            />
            <Feature
              title="Real-time"
              desc="Rekap langsung update"
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            />
            <Feature
              title="Liveness"
              desc="Deteksi gerakan hidup"
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.46 12C3.73 7.94 7.5 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-5.04 7-9.54 7s-8.27-2.94-9.54-7z" /></svg>}
            />
          </div>
        </div>

        {/* Bottom marquee */}
        <div className="space-y-2 overflow-hidden">
          <Marquee text="Universitas Langlangbuana Bandung Ã‚Â· KKNM Cangkuangkulon Ã‚Â· Development by KingFaisal" count={6} />
          <Marquee text="Face Recognition Ã‚Â· Kehadiran Real-Time Ã‚Â· UNLA Bandung" count={6} reverse />
        </div>
      </div>

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â RIGHT PANEL Ã¢â‚¬â€ Login Form Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative z-10">
        <div className="w-full max-w-md animate-fade-in-up">

          {/* Mobile-only brand header */}
          <div className="hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-accent-cyan/30 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
              <span className="text-accent-cyan text-xs font-bold tracking-wider uppercase">Absensi KKN</span>
            </div>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/30">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Card with gradient ring border */}
          <div className="gsap-card relative">
            <div className="absolute -inset-[1.5px] rounded-[1.6rem] bg-gradient-to-br from-primary-500/40 via-accent-cyan/20 to-transparent opacity-70 blur-[1px]" />
            <div className="relative glass-card p-8 sm:p-10 rounded-[1.5rem]">

              <div className="mb-7">
                <h2 className="font-heading text-2xl sm:text-3xl font-black text-white">Selamat Datang</h2>
                <p className="text-white/40 text-sm mt-1">Masuk untuk melanjutkan ke dashboard absensi.</p>
              </div>

              {successMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2 animate-fade-in">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {successMessage}
                </div>
              )}
              {serverError && (
                <div className="mb-5 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2 animate-fade-in">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="NIM"
                  name="nim"
                  value={form.nim}
                  onChange={handleChange}
                  error={errors.nim}
                  autoComplete="username"
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                />

                <div className="relative">
                  <Input
                    label="Password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    autoComplete="current-password"
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-[38px] text-white/30 hover:text-white/70 transition-colors" tabIndex={-1} aria-label="Toggle password visibility">
                    {showPass ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>

                {/* Remember + forgot */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer text-white/50 hover:text-white/70 transition-colors">
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary-500" />
                    Ingat saya
                  </label>
                  <button type="button" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">Lupa password?</button>
                </div>

                {/* Submit with shine sweep */}
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base font-bold mt-2 flex items-center justify-center gap-2 relative overflow-hidden shine-btn">
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Memproses...
                      </>
                    ) : (
                      <>
                        Masuk
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                      </>
                    )}
                  </span>
                </button>
              </form>

              <div className="mt-7 pt-6 border-t border-white/5 space-y-3 text-center">
                <p className="text-sm text-white/35">Belum punya akun? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">Daftar Sekarang</Link></p>
                <Link to="/admin/login" className="inline-flex items-center justify-center gap-1.5 text-xs text-white/30 hover:text-accent-cyan transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                  Masuk Portal Admin
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 space-y-1">
            <p className="text-white/40 text-xs font-medium">Universitas Langlangbuana Bandung</p>
            <p className="text-white/20 text-[11px] font-mono">Development by <strong className="text-accent-cyan font-semibold">KingFaisal</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}