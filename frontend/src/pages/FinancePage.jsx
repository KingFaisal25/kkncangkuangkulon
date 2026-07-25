import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import financeService from '../services/financeService';
import rabService from '../services/rabService';
import divisionService from '../services/divisionService';
import { CardSkeleton } from '../components/ui/LoadingSpinner';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

function SummaryCard({ label, value, color, icon }) {
    return (
        <div className={`glass-card p-5 border ${color.border}`}>
            <div className="flex items-center gap-3 mb-1">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color.icon}`}>{icon}</div>
                <p className="text-xs text-white/50">{label}</p>
            </div>
            <p className={`font-heading text-xl font-extrabold font-mono ${color.text}`}>{value}</p>
        </div>
    );
}

export default function FinancePage() {
    const { user } = useAuth();
    const [tab, setTab] = useState('transaksi'); // 'transaksi' | 'rab'
    const [finance, setFinance] = useState(null);
    const [rab, setRab] = useState({ items: [], total_rab: 0 });
    const [divisions, setDivisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Transaction form
    const [txForm, setTxForm] = useState({ jenis: 'pemasukan', judul: '', jumlah: '', keterangan: '', tanggal: new Date().toISOString().slice(0, 10) });

    // RAB form
    const [rabForm, setRabForm] = useState({ division_id: '', nama_item: '', satuan: 'pcs', volume: 1, harga_satuan: '' });

    const bendaharaDiv = divisions.find(d => d.nama && d.nama.toLowerCase().includes('bendahara'));
    const isBendahara = user?.role === 'admin' ||
                        (user?.division?.nama && user.division.nama.toLowerCase().includes('bendahara')) ||
                        (bendaharaDiv && user?.division_id === bendaharaDiv.id);

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try {
            const [finRes, rabRes, divRes] = await Promise.all([
                financeService.getAll().catch(() => null),
                rabService.getItems().catch(() => null),
                divisionService.getDivisions().catch(() => null),
            ]);
            setFinance(finRes?.data?.data || null);
            setRab(rabRes?.data?.data || { items: [], total_rab: 0 });
            setDivisions(divRes?.data?.data || []);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await financeService.addTransaction({ ...txForm, jumlah: parseFloat(txForm.jumlah) });
            setTxForm({ jenis: 'pemasukan', judul: '', jumlah: '', keterangan: '', tanggal: new Date().toISOString().slice(0, 10) });
            setShowForm(false);
            await loadAll();
        } catch (err) {
            alert(err?.response?.data?.message || 'Gagal menyimpan transaksi');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTx = async (id) => {
        if (!confirm('Hapus transaksi ini?')) return;
        await financeService.deleteTransaction(id).catch(() => { });
        await loadAll();
    };

    const handleAddRab = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await rabService.addItem({ ...rabForm, volume: +rabForm.volume, harga_satuan: +rabForm.harga_satuan });
            setRabForm({ division_id: '', nama_item: '', satuan: 'pcs', volume: 1, harga_satuan: '' });
            setShowForm(false);
            await loadAll();
        } catch (err) {
            alert(err?.response?.data?.message || 'Gagal menyimpan item RAB');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRab = async (id) => {
        if (!confirm('Hapus item RAB ini?')) return;
        await rabService.deleteItem(id).catch(() => { });
        await loadAll();
    };

    // CSV exports
    const exportTxCSV = () => {
        const rows = finance?.transactions?.map(t => [t.tanggal, t.jenis, t.judul, t.jumlah, t.keterangan || '', t.user?.nama || '-']) || [];
        const csv = [['Tanggal', 'Jenis', 'Keterangan', 'Jumlah (Rp)', 'Catatan', 'Pencatat'], ...rows]
            .map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'keuangan-kkn.csv'; a.click();
    };

    const exportRabCSV = () => {
        const rows = rab.items?.map(i => [i.division?.nama || '', i.nama_item, i.volume, i.satuan, i.harga_satuan, i.total, i.keterangan || '']) || [];
        const csv = [['Divisi', 'Nama Item', 'Volume', 'Satuan', 'Harga Satuan (Rp)', 'Total (Rp)', 'Keterangan'], ...rows]
            .map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'rab-kkn.csv'; a.click();
    };

    const summary = finance?.summary || {};
    const transactions = finance?.transactions || [];

    const tabs = [
        { key: 'transaksi', label: '💸 Transaksi' },
        { key: 'rab', label: '📋 RAB' },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up print:text-black print:bg-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
                        💰 Keuangan <span className="gradient-text">KKN</span>
                    </h1>
                    <p className="text-white/50 text-sm mt-1">Saldo, transaksi, dan rencana anggaran biaya</p>
                </div>
                <div className="flex gap-2 flex-wrap print:hidden">
                    <button onClick={tab === 'rab' ? exportRabCSV : exportTxCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/30 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export CSV
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-semibold hover:bg-rose-500/30 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Export PDF
                    </button>
                    {isBendahara && (
                        <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            {tab === 'rab' ? 'Tambah RAB' : 'Tambah Transaksi'}
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SummaryCard label="Saldo Kas" value={fmt(summary.saldo)} color={{ border: 'border-emerald-500/30', icon: 'bg-emerald-500/15 text-emerald-400', text: 'text-emerald-400' }}
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <SummaryCard label="Total Pemasukan" value={fmt(summary.total_pemasukan)} color={{ border: 'border-sky-500/30', icon: 'bg-sky-500/15 text-sky-400', text: 'text-sky-400' }}
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>}
                    />
                    <SummaryCard label="Total Pengeluaran" value={fmt(summary.total_pengeluaran)} color={{ border: 'border-rose-500/30', icon: 'bg-rose-500/15 text-rose-400', text: 'text-rose-400' }}
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>}
                    />
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit print:hidden">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => { setTab(t.key); setShowForm(false); }}
                        className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${tab === t.key ? 'bg-primary-500/30 text-white border border-primary-400/40' : 'text-white/40 hover:text-white/70'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Add Form */}
            {showForm && isBendahara && (
                <div className="glass-card p-6 border border-primary-400/30 animate-fade-in-up print:hidden">
                    <h3 className="font-heading font-bold text-base mb-4 text-white">
                        {tab === 'rab' ? '📋 Tambah Item RAB' : '💸 Tambah Transaksi'}
                    </h3>
                    {tab === 'transaksi' ? (
                        <form onSubmit={handleAddTransaction} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-white/50 mb-1.5 block">Jenis *</label>
                                    <select value={txForm.jenis} onChange={e => setTxForm(f => ({ ...f, jenis: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50">
                                        <option value="pemasukan">⬆️ Pemasukan</option>
                                        <option value="pengeluaran">⬇️ Pengeluaran</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-white/50 mb-1.5 block">Tanggal *</label>
                                    <input type="date" value={txForm.tanggal} onChange={e => setTxForm(f => ({ ...f, tanggal: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-white/50 mb-1.5 block">Keterangan *</label>
                                <input type="text" value={txForm.judul} onChange={e => setTxForm(f => ({ ...f, judul: e.target.value }))}
                                    placeholder="Contoh: Dana dari BNI, Beli ATK, dll." required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-cyan/50" />
                            </div>
                            <div>
                                <label className="text-xs text-white/50 mb-1.5 block">Jumlah (Rp) *</label>
                                <input type="number" value={txForm.jumlah} onChange={e => setTxForm(f => ({ ...f, jumlah: e.target.value }))}
                                    placeholder="0" min="0" required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-cyan/50 font-mono" />
                            </div>
                            <div>
                                <label className="text-xs text-white/50 mb-1.5 block">Catatan tambahan</label>
                                <textarea value={txForm.keterangan} onChange={e => setTxForm(f => ({ ...f, keterangan: e.target.value }))} rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-cyan/50 resize-none" />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white transition-all">Batal</button>
                                <button type="submit" disabled={submitting} className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50">{submitting ? 'Menyimpan...' : '✓ Simpan'}</button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleAddRab} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-white/50 mb-1.5 block">Divisi *</label>
                                    <select value={rabForm.division_id} onChange={e => setRabForm(f => ({ ...f, division_id: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50" required>
                                        <option value="">Pilih Divisi</option>
                                        {divisions.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-white/50 mb-1.5 block">Nama Item *</label>
                                    <input type="text" value={rabForm.nama_item} onChange={e => setRabForm(f => ({ ...f, nama_item: e.target.value }))} placeholder="Contoh: Spanduk, ATK, dll." required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-cyan/50" />
                                </div>
                                <div>
                                    <label className="text-xs text-white/50 mb-1.5 block">Volume *</label>
                                    <input type="number" value={rabForm.volume} onChange={e => setRabForm(f => ({ ...f, volume: e.target.value }))} min="0" step="0.01" required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50 font-mono" />
                                </div>
                                <div>
                                    <label className="text-xs text-white/50 mb-1.5 block">Satuan *</label>
                                    <input type="text" value={rabForm.satuan} onChange={e => setRabForm(f => ({ ...f, satuan: e.target.value }))} placeholder="pcs, meter, kg, dll." required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-cyan/50" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs text-white/50 mb-1.5 block">Harga Satuan (Rp) *</label>
                                    <input type="number" value={rabForm.harga_satuan} onChange={e => setRabForm(f => ({ ...f, harga_satuan: e.target.value }))} placeholder="0" min="0" required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-cyan/50 font-mono" />
                                    {rabForm.volume && rabForm.harga_satuan && (
                                        <p className="text-xs text-accent-cyan mt-1">Total: {fmt(+rabForm.volume * +rabForm.harga_satuan)}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white transition-all">Batal</button>
                                <button type="submit" disabled={submitting} className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50">{submitting ? 'Menyimpan...' : '✓ Simpan'}</button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Transaction Tab */}
            {tab === 'transaksi' && (
                loading ? <CardSkeleton /> : (
                    transactions.length === 0 ? (
                        <div className="glass-card-static p-10 text-center border border-white/5">
                            <p className="text-white/30 text-sm">Belum ada transaksi. {isBendahara ? 'Klik "+ Tambah Transaksi" untuk memulai.' : ''}</p>
                        </div>
                    ) : (
                        <div className="glass-card-static overflow-hidden border border-white/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-xs text-white/30 uppercase tracking-wider border-b border-white/5">
                                            <th className="text-left px-5 py-3">Tanggal</th>
                                            <th className="text-left px-5 py-3">Keterangan</th>
                                            <th className="text-left px-5 py-3">Jenis</th>
                                            <th className="text-right px-5 py-3">Jumlah</th>
                                            <th className="text-left px-5 py-3">Pencatat</th>
                                            {isBendahara && <th className="px-5 py-3 print:hidden" />}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {transactions.map(t => (
                                            <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-5 py-3.5 text-white/50 font-mono text-xs">{t.tanggal}</td>
                                                <td className="px-5 py-3.5">
                                                    <p className="text-white font-medium">{t.judul}</p>
                                                    {t.keterangan && <p className="text-xs text-white/30 mt-0.5">{t.keterangan}</p>}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${t.jenis === 'pemasukan' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                                                        {t.jenis === 'pemasukan' ? '⬆ Masuk' : '⬇ Keluar'}
                                                    </span>
                                                </td>
                                                <td className={`px-5 py-3.5 text-right font-mono font-bold ${t.jenis === 'pemasukan' ? 'text-sky-300' : 'text-rose-300'}`}>
                                                    {t.jenis === 'pemasukan' ? '+' : '-'}{fmt(t.jumlah)}
                                                </td>
                                                <td className="px-5 py-3.5 text-white/40 text-xs">{t.user?.nama || '-'}</td>
                                                {isBendahara && (
                                                    <td className="px-5 py-3.5 print:hidden">
                                                        <button onClick={() => handleDeleteTx(t.id)} className="text-rose-400 hover:text-rose-300 text-xs transition-colors">Hapus</button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="border-t border-white/10">
                                        <tr className="bg-white/[0.02]">
                                            <td colSpan={3} className="px-5 py-3 text-sm font-bold text-white/50">Saldo Akhir</td>
                                            <td className={`px-5 py-3 text-right font-mono font-extrabold text-lg ${(summary.saldo || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {fmt(summary.saldo)}
                                            </td>
                                            <td colSpan={isBendahara ? 2 : 1} />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )
                )
            )}

            {/* RAB Tab */}
            {tab === 'rab' && (
                loading ? <CardSkeleton /> : (
                    rab.items?.length === 0 ? (
                        <div className="glass-card-static p-10 text-center border border-white/5">
                            <p className="text-white/30 text-sm">Belum ada item RAB. {isBendahara ? 'Klik "+ Tambah RAB" untuk memulai.' : ''}</p>
                        </div>
                    ) : (
                        <div className="glass-card-static overflow-hidden border border-white/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-xs text-white/30 uppercase tracking-wider border-b border-white/5">
                                            <th className="text-left px-5 py-3">Divisi</th>
                                            <th className="text-left px-5 py-3">Nama Item</th>
                                            <th className="text-right px-5 py-3">Volume</th>
                                            <th className="text-left px-5 py-3">Satuan</th>
                                            <th className="text-right px-5 py-3">Harga Satuan</th>
                                            <th className="text-right px-5 py-3">Total</th>
                                            {isBendahara && <th className="px-5 py-3 print:hidden" />}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {rab.items?.map(i => (
                                            <tr key={i.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold border" style={{ background: `${i.division?.warna}20`, color: i.division?.warna, borderColor: `${i.division?.warna}40` }}>
                                                        {i.division?.nama || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-white font-medium">{i.nama_item}</td>
                                                <td className="px-5 py-3.5 text-right text-white/60 font-mono">{i.volume}</td>
                                                <td className="px-5 py-3.5 text-white/60">{i.satuan}</td>
                                                <td className="px-5 py-3.5 text-right font-mono text-white/60">{fmt(i.harga_satuan)}</td>
                                                <td className="px-5 py-3.5 text-right font-mono font-bold text-accent-cyan">{fmt(i.total)}</td>
                                                {isBendahara && (
                                                    <td className="px-5 py-3.5 print:hidden">
                                                        <button onClick={() => handleDeleteRab(i.id)} className="text-rose-400 hover:text-rose-300 text-xs transition-colors">Hapus</button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="border-t border-white/10">
                                        <tr className="bg-white/[0.02]">
                                            <td colSpan={5} className="px-5 py-3 text-sm font-bold text-white/50">Total Anggaran RAB</td>
                                            <td className="px-5 py-3 text-right font-mono font-extrabold text-lg text-amber-400">{fmt(rab.total_rab)}</td>
                                            {isBendahara && <td />}
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )
                )
            )}
        </div>
    );
}
