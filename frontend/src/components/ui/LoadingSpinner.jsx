export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div
          className={`${sizes[size]} rounded-full border-2 border-white/10 border-t-primary-500 animate-spin`}
        />
        <div
          className={`absolute inset-0 ${sizes[size]} rounded-full border-2 border-transparent border-b-primary-300 animate-spin`}
          style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
        />
      </div>
      {text && <p className="text-sm text-white/50 animate-pulse-soft">{text}</p>}
    </div>
  );
}

export function Skeleton({ className = '', lines = 1 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'} ${className}`}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card-static p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-5 w-32" />
        </div>
      </div>
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  );
}
