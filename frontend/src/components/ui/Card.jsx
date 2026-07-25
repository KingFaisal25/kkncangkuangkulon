export default function Card({
  children,
  className = '',
  gradient = false,
  hover = true,
  padding = 'p-6',
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`${gradient ? 'gradient-border' : hover ? 'glass-card' : 'glass-card-static'} ${padding} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
