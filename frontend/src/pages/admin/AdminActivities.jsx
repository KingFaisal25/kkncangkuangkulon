import { useEffect, useState } from 'react';
import api from '../../services/api';

const emptyForm = { nama: '', deskripsi: '', tanggal: '', jam_mulai: '', jam_selesai: '', lokasi: '', status: 'aktif' };

const StatusBadge = ({ status }) => {
  const map = {
    aktif: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    selesai: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
    dibatalkan: 'bg-danger/20 text-danger border-danger/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || 'bg-white/10 text-white/60 border-white/10'}`}>
      {status}
    </span>
  );
};

export default function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/admin/activities')
    .then(({ data }) => setActivities(data.data?.activities || []))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      if (editing) {
        await api.put(`/admin/activities/${editing}`, form);
      } else {
        await api.post('/admin/activities', form);
      }
      setForm(emptyForm);
      setEditing(null);
      setShowForm(false);
      await load();
      setMessage({ text: editing ? 'Kegiatan berhasil diperbarui.' : 'Kegiatan berhasil ditambahkan.', type: 'success' });
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Gagal menyimpan kegiatan.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const edit = (activity) => {
    setEditing(activity.id);
    setForm({
      nama: activity.nama || '',
      deskripsi: activity.deskripsi || '',
      tanggal: activity.tanggal?.slice(0, 10) || '',
      jam_mulai: activity.jam_mulai || '',
      jam_selesai: activity.jam_selesai || '',
      lokasi: activity.lokasi || '',
      status: activity.status || 'aktif',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!window.confirm('Hapus kegiatan ini? Tindakan ini tidak bisa dibatalkan.')) return;
    await api.delete(`/admin/activities/${id}`);
    await load();
    setMessage({ text: 'Kegiatan berhasil dihapus.', type: 'success' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-1">Admin Panel</p>
          <h1 className="font-heading text-3xl font-bold text-white">Kelola Kegiatan</h1>
          <p className="text-white/40 text-sm mt-1">Tambah & kelola agenda kegiatan KKN.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(!showForm); }}
          className="btn-primary px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shrink-0"
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${showForm && !editing ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {showForm && !editing ? 'Batal' : 'Tambah Kegiatan'}
        </button>
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
          <h2 className="font-heading text-lg font-semibold mb-5">
            {editing ? '✏️ Edit Kegiatan' : '➕ Tambah Kegiatan Baru'}
          </h2>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Nama Kegiatan</label>
              <input name="nama" value={form.nama} onChange={change} required placeholder="Nama kegiatan..." className="glass-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Deskripsi</label>
              <textarea name="deskripsi" value={form.deskripsi} onChange={change} placeholder="Deskripsi kegiatan..." className="glass-input w-full px-4 py-3 text-sm min-h-20 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Tanggal</label>
              <input type="date" name="tanggal" value={form.tanggal} onChange={change} required className="glass-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Lokasi</label>
              <input name="lokasi" value={form.lokasi} onChange={change} placeholder="Lokasi kegiatan..." className="glass-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Jam Mulai</label>
              <input type="time" name="jam_mulai" value={form.jam_mulai} onChange={change} className="glass-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Jam Selesai</label>
              <input type="time" name="jam_selesai" value={form.jam_selesai} onChange={change} className="glass-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Status</label>
              <select name="status" value={form.status} onChange={change} className="glass-input w-full px-4 py-2.5 text-sm">
                <option value="aktif">Aktif</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-white/5">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }} className="btn-secondary px-5 py-2.5 text-sm">Batal</button>
              <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 text-sm font-semibold flex items-center gap-2">
                {saving ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Menyimpan...</> : editing ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Activities List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => <div key={i} className="glass-card p-5 space-y-3"><div className="skeleton h-5 w-3/4 rounded" /><div className="skeleton h-4 w-full rounded" /><div className="skeleton h-4 w-2/3 rounded" /></div>)}
        </div>
      ) : activities.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-white/40 text-sm">Belum ada kegiatan. Tambahkan kegiatan pertama!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {activities.map((activity, idx) => (
            <div key={activity.id} className="glass-card p-5 flex flex-col gap-3" style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-heading text-base font-semibold text-white line-clamp-2">{activity.nama}</h2>
                <StatusBadge status={activity.status} />
              </div>
              {activity.deskripsi && <p className="text-white/40 text-sm line-clamp-2">{activity.deskripsi}</p>}
              <div className="space-y-1 border-t border-white/5 pt-3">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <svg className="w-3.5 h-3.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" /></svg>
                  {new Date(activity.tanggal).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  {activity.jam_mulai && ` · ${activity.jam_mulai} – ${activity.jam_selesai}`}
                </div>
                {activity.lokasi && (
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <svg className="w-3.5 h-3.5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    {activity.lokasi}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => edit(activity)} className="btn-secondary flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                  Edit
                </button>
                <button onClick={() => remove(activity.id)} className="btn-danger flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
