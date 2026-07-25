import { useEffect, useState } from 'react';
import api from '../services/api';

const getImageUrl = (report) => {
  const imgPath = report.dokumentasi_url || report.dokumentasi;
  if (!imgPath) return null;
  if (imgPath.startsWith('http')) return imgPath;
  if (imgPath.startsWith('/')) return imgPath;
  return `/storage/${imgPath}`;
};

export default function ReportsPage() {
  const [activities, setActivities] = useState([]);
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ activity_id: '', hasil: '', kendala: '', catatan: '', dokumentasi_file: null });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState(null);

  const load = () => Promise.all([api.get('/activities'), api.get('/reports')])
    .then(([a, r]) => {
      setActivities(a.data.data?.activities || []);
      setReports(r.data.data?.reports || []);
    })
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, dokumentasi_file: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    
    const body = new FormData();
    if (form.activity_id) body.append('activity_id', form.activity_id);
    if (form.hasil) body.append('hasil', form.hasil);
    if (form.kendala) body.append('kendala', form.kendala);
    if (form.catatan) body.append('catatan', form.catatan);
    if (form.dokumentasi_file instanceof File) {
      body.append('dokumentasi_file', form.dokumentasi_file);
    }

    try {
      await api.post('/reports', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm({ activity_id: '', hasil: '', kendala: '', catatan: '', dokumentasi_file: null });
      setPreview(null);
      setMessage({ text: 'Laporan kegiatan berhasil disimpan!', type: 'success' });
      setShowForm(false);
      load();
    } catch (err) {
      let errMsg = err.response?.data?.message || 'Gagal menyimpan laporan.';
      if (err.response?.data?.errors) {
        const errValues = Object.values(err.response.data.errors).flat();
        if (errValues.length > 0) errMsg = errValues.join(' | ');
      }
      setMessage({ text: errMsg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(0,240,255,0.1) 50%, rgba(123,76,245,0.15) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.2) 0%, transparent 70%)' }} />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-accent-cyan" />
              <p className="text-emerald-400 text-xs font-bold tracking-[0.2em] uppercase">Dokumentasi KKN</p>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
              Laporan <span className="gradient-text">Kegiatan</span>
            </h1>
            <p className="text-white/40 mt-2">Catat hasil dan dokumentasi kegiatan dengan rapi.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary px-5 py-2.5 text-sm font-semibold shrink-0 flex items-center gap-2"
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {showForm ? 'Batal' : 'Tulis Laporan'}
          </button>
        </div>
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
          <h2 className="font-heading text-lg font-semibold mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM16.862 4.487L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Tulis Laporan Baru
          </h2>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Kegiatan</label>
              <select
                className="glass-input w-full px-4 py-2.5 text-sm"
                value={form.activity_id}
                onChange={e => setForm({ ...form, activity_id: e.target.value })}
                required
              >
                <option value="">Pilih kegiatan yang dilaporkan</option>
                {activities.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
              </select>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Foto Dokumentasi</label>
              <label className="relative flex flex-col items-center gap-3 p-6 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden"
                style={{ border: '1px dashed rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)' }}>
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                ) : (
                  <>
                    <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span className="text-white/40 text-sm">Klik untuk upload foto dokumentasi</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Hasil Kegiatan</label>
              <textarea className="glass-input w-full px-4 py-3 text-sm min-h-24 resize-none" placeholder="Deskripsikan hasil kegiatan..." value={form.hasil} onChange={e => setForm({ ...form, hasil: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Kendala</label>
                <textarea className="glass-input w-full px-4 py-3 text-sm min-h-20 resize-none" placeholder="Kendala yang dihadapi..." value={form.kendala} onChange={e => setForm({ ...form, kendala: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Catatan Tambahan</label>
                <textarea className="glass-input w-full px-4 py-3 text-sm min-h-20 resize-none" placeholder="Catatan atau saran..." value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-5 py-2.5 text-sm">Batal</button>
              <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 text-sm font-semibold flex items-center gap-2">
                {saving ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Menyimpan...</>
                ) : (<><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Simpan Laporan</>)}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reports Grid */}
      <div>
        <h2 className="font-heading text-lg font-semibold mb-4 text-white/80">Laporan Tersimpan</h2>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <div className="skeleton h-44 w-full" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-5 w-2/3 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-5/6 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-white/50 font-medium">Belum ada laporan kegiatan.</p>
            <p className="text-white/25 text-sm mt-1">Buat laporan pertama Anda dengan tombol di atas.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report, idx) => {
              const imgUrl = getImageUrl(report);
              return (
                <article key={report.id} className="glass-card overflow-hidden group" style={{ animationDelay: `${idx * 80}ms` }}>
                  {imgUrl ? (
                    <div className="aspect-video overflow-hidden relative">
                      <img src={imgUrl} alt={report.activity?.nama || 'Dokumentasi'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <svg className="w-12 h-12 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  )}
                <div className="p-5">
                  <h2 className="font-heading text-base font-semibold text-white group-hover:text-accent-cyan transition-colors">{report.activity?.nama}</h2>
                  {report.hasil && <p className="text-white/50 text-sm mt-2 line-clamp-3 leading-relaxed">{report.hasil}</p>}
                  {report.kendala && (
                    <div className="mt-3 flex gap-2 items-start">
                      <span className="text-xs font-semibold text-warning/70 uppercase tracking-wider shrink-0 mt-0.5">Kendala:</span>
                      <p className="text-white/40 text-xs line-clamp-2">{report.kendala}</p>
                    </div>
                  )}
                </div>
              </article>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}