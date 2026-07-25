import { useEffect, useState } from 'react';
import api from '../services/api';

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
  return (
    <span className="px-2 py-0.5 rounded-md bg-primary-500/15 text-primary-300 text-xs font-bold tracking-wider uppercase">
      {labels[jenis] || jenis}
    </span>
  );
};

export default function AttendanceRequestsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ tanggal: '', jenis: 'izin', alasan: '', bukti_file: null });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/attendance-requests')
    .then(({ data }) => setItems(data.data?.requests || []))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => value && body.append(key, value));
    try {
      await api.post('/attendance-requests', body);
      setForm({ tanggal: '', jenis: 'izin', alasan: '', bukti_file: null });
      setMessage({ text: 'Pengajuan berhasil dikirim! Tunggu persetujuan admin.', type: 'success' });
      setShowForm(false);
      load();
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Gagal mengirim pengajuan.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{ background: 'linear-gradient(135deg, rgba(255,183,0,0.15) 0%, rgba(123,76,245,0.15) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255,183,0,0.25) 0%, transparent 70%)' }} />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-warning to-accent-pink" />
              <p className="text-warning text-xs font-bold tracking-[0.2em] uppercase">KKNM Cangkuangkulon</p>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
              Izin & <span className="gradient-text">Koreksi</span>
            </h1>
            <p className="text-white/40 mt-2">Sampaikan kondisi Anda dengan rapi dan transparan.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary px-5 py-2.5 text-sm font-semibold shrink-0 flex items-center gap-2"
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {showForm ? 'Batal' : 'Ajukan'}
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
            <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Form Pengajuan
          </h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Tanggal</label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={e => setForm({ ...form, tanggal: e.target.value })}
                  required
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Jenis Pengajuan</label>
                <select
                  value={form.jenis}
                  onChange={e => setForm({ ...form, jenis: e.target.value })}
                  className="glass-input w-full px-4 py-2.5 text-sm"
                >
                  <option value="izin">Izin</option>
                  <option value="sakit">Sakit</option>
                  <option value="dinas">Dinas</option>
                  <option value="koreksi">Koreksi Absensi</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Alasan</label>
              <textarea
                value={form.alasan}
                onChange={e => setForm({ ...form, alasan: e.target.value })}
                required
                placeholder="Jelaskan alasan pengajuan Anda..."
                className="glass-input w-full px-4 py-3 text-sm min-h-28 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Bukti (Opsional)</label>
              <label className="flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:border-primary-400/50"
                style={{ border: '1px dashed rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)' }}>
                <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-sm text-white/40">
                  {form.bukti_file ? form.bukti_file.name : 'Klik untuk upload foto bukti'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={e => setForm({ ...form, bukti_file: e.target.files[0] })} />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-5 py-2.5 text-sm">Batal</button>
              <button type="submit" disabled={submitting} className="btn-primary px-6 py-2.5 text-sm font-semibold flex items-center gap-2">
                {submitting ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Mengirim...</>
                ) : (<><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>Kirim</>)}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div>
        <h2 className="font-heading text-lg font-semibold mb-4 text-white/80">Riwayat Pengajuan</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-4 flex gap-4">
                <div className="skeleton h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3 rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-white/40 text-sm">Belum ada pengajuan.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="glass-card-static p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary-500/20 transition-all duration-200" style={{ animationDelay: `${idx * 60}ms` }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <JenisBadge jenis={item.jenis} />
                      <span className="text-white/30 text-xs">·</span>
                      <span className="text-white/50 text-sm">{new Date(item.tanggal).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    </div>
                    <p className="text-white/70 text-sm mt-1 line-clamp-2">{item.alasan}</p>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}