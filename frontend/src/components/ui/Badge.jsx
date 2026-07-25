export default function Badge({ status, className = '' }) {
  const styles = {
    hadir: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    terlambat: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'tidak hadir': 'bg-red-500/15 text-red-400 border-red-500/30',
    alfa: 'bg-red-500/15 text-red-400 border-red-500/30',
    izin: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    pending: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  };

  const key = status?.toLowerCase() || 'pending';
  const style = styles[key] || styles.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {status || 'Unknown'}
    </span>
  );
}
