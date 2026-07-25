import { useState } from 'react';

export default function Input({
  label,
  type = 'text',
  error,
  icon,
  className = '',
  id,
  placeholder: _ignoredPlaceholder,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase() || Math.random().toString(36).slice(2)}`;

  const isFloated = focused || Boolean(props.value);

  return (
    <div className={`relative ${className}`}>
      {/* Floating Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={`absolute text-sm transition-all duration-200 pointer-events-none z-10 ${icon ? 'left-11' : 'left-4'
            } ${isFloated
              ? `-top-2.5 text-xs px-1.5 ${focused ? 'text-accent-cyan font-bold' : 'text-primary-300'}`
              : 'top-3 text-white/40'
            }`}
          style={isFloated ? { background: 'rgba(9, 9, 30, 0.95)', borderRadius: '4px' } : {}}
        >
          {label}
        </label>
      )}

      {/* Icon */}
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 z-10 pointer-events-none">
          {icon}
        </div>
      )}

      <input
        id={inputId}
        type={type}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={`glass-input w-full px-4 py-3 text-sm ${icon ? 'pl-11' : ''
          } ${error ? 'error' : ''}`}
        placeholder=" "
        {...props}
      />

      {/* Error */}
      {error && (
        <p className="mt-1.5 text-xs text-danger flex items-center gap-1 animate-fade-in">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
