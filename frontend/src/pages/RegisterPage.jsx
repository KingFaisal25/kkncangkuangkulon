import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FaceCapture from '../components/camera/FaceCapture';

const STEPS = [
  { label: 'Data Diri', icon: '1' },
  { label: 'Foto Wajah', icon: '2' },
  { label: 'Konfirmasi', icon: '3' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    nama: '',
    nim: '',
    jurusan: '',
    password: '',
    password_confirmation: '',
  });

  const [faceData, setFaceData] = useState(null); // { imageBase64, embedding }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.nama.trim()) errs.nama = 'Nama wajib diisi';
    if (!form.nim.trim()) errs.nim = 'NIM wajib diisi';
    if (!form.jurusan.trim()) errs.jurusan = 'Jurusan wajib diisi';
    if (!form.password) errs.password = 'Password wajib diisi';
    if (form.password.length < 6) errs.password = 'Password minimal 6 karakter';
    if (form.password !== form.password_confirmation) errs.password_confirmation = 'Konfirmasi password tidak cocok';
    return errs;
  };

  const handleNext = () => {
    if (step === 0) {
      const errs = validateStep1();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFaceCapture = (data) => {
    setFaceData(data);
    setStep(2); // Go to confirmation
  };

  const handleSubmit = async () => {
    setLoading(true);
    setServerError('');
    try {
      await register({
        nama: form.nama,
        nim: form.nim,
        jurusan: form.jurusan,
        password: form.password,
        password_confirmation: form.password_confirmation,
        foto_registrasi: faceData?.imageBase64 || null,
        face_embedding: faceData?.embedding || null,
      });
      navigate('/login', { state: { message: 'Registrasi berhasil! Silakan login.' } });
    } catch (err) {
      console.error(err);
      let msg = err.response?.data?.message || `Error: ${err.message}. ${err.response?.status ? 'Status: ' + err.response.status : ''}`;
      
      // If there's an HTML response or something weird, capture it
      if (err.response?.data && typeof err.response.data === 'string') {
        msg += ` | Data: ${err.response.data.substring(0, 50)}...`;
      }

      const valErrors = err.response?.data?.data;
      if (valErrors && typeof valErrors === 'object') {
        const firstError = Object.values(valErrors)[0];
        if (firstError && firstError[0]) {
          msg = firstError[0];
        }
      }
      setServerError(msg);
      
      if (valErrors && typeof valErrors === 'object') {
        const fieldErrors = {};
        Object.entries(valErrors).forEach(([key, val]) => {
          fieldErrors[key] = Array.isArray(val) ? val[0] : val;
        });
        setErrors(fieldErrors);
        setStep(0); // Go back to form
      } else if (err.response?.data?.errors) {
        const fieldErrors = {};
        Object.entries(err.response.data.errors).forEach(([key, val]) => {
          fieldErrors[key] = Array.isArray(val) ? val[0] : val;
        });
        setErrors(fieldErrors);
        setStep(0); // Go back to form
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="gradient-mesh" />
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-light/50 to-surface" />
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-primary-600/8 rounded-full blur-3xl animate-float" />

      <div className="relative z-10 w-full max-w-lg animate-fade-in-up">
        {/* Brand */}
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl font-bold gradient-text-glow">Pendaftaran</h1>
          <p className="text-white/40 text-sm mt-1">Buat akun untuk mulai menggunakan absensi</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    i < step
                      ? 'bg-emerald-500 text-white'
                      : i === step
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-white/5 text-white/30 border border-white/10'
                  }`}
                >
                  {i < step ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.icon
                  )}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${i <= step ? 'text-white/70' : 'text-white/30'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-colors duration-300 ${
                    i < step ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8">
          {serverError && (
            <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {serverError}
            </div>
          )}

          {/* Step 1: Personal Data */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-in">
              <Input
                label="Nama Lengkap"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                error={errors.nama}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              <Input
                label="NIM"
                name="nim"
                value={form.nim}
                onChange={handleChange}
                error={errors.nim}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                  </svg>
                }
              />
              <Input
                label="Jurusan"
                name="jurusan"
                value={form.jurusan}
                onChange={handleChange}
                error={errors.jurusan}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                }
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />
              <Input
                label="Konfirmasi Password"
                name="password_confirmation"
                type="password"
                value={form.password_confirmation}
                onChange={handleChange}
                error={errors.password_confirmation}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              />

              <Button fullWidth size="lg" onClick={handleNext}>
                Lanjutkan
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>
          )}

          {/* Step 2: Face Capture */}
          {step === 1 && (
            <div className="animate-fade-in">
              <FaceCapture
                onCapture={handleFaceCapture}
                onCancel={handleBack}
              />
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h3 className="font-heading font-semibold text-lg">Konfirmasi Data</h3>
                <p className="text-sm text-white/40">Periksa data Anda sebelum mendaftar</p>
              </div>

              {/* Summary */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-white/50">Nama</span>
                  <span className="text-sm font-medium">{form.nama}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-white/50">NIM</span>
                  <span className="text-sm font-medium">{form.nim}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-white/50">Jurusan</span>
                  <span className="text-sm font-medium">{form.jurusan}</span>
                </div>
              </div>

              {/* Face preview */}
              {faceData && (
                <div className="text-center">
                  <p className="text-sm text-white/50 mb-2">Foto Wajah</p>
                  <div className="inline-block rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={faceData.imageBase64}
                      alt="Face"
                      className="w-32 h-32 object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleBack}>
                  Kembali
                </Button>
                <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>
                  Daftar Sekarang
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          {step === 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-white/40">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                  Masuk
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
