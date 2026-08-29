// Sparkline — pure SVG 14-day price trend chart (no external library)
// Props:
//   data   — array of numbers (prices)
//   width  — SVG viewBox width (default 300)
//   height — SVG viewBox height (default 80)

export function Sparkline({ data, width = 300, height = 80 }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padX = 8;
  const padY = 8;
  const w = width - padX * 2;
  const h = height - padY * 2;

  const points = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * w;
    const y = padY + h - ((v - min) / range) * h;
    return `${x},${y}`;
  });

  const [lx, ly] = points[points.length - 1].split(',').map(Number);

  // Area fill path (closes shape back to bottom)
  const firstX = padX;
  const lastX = padX + w;
  const bottomY = padY + h;
  const areaPath = `M${firstX},${bottomY} L${points.join(' L')} L${lastX},${bottomY} Z`;

  const isUp = data[data.length - 1] >= data[0];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Area fill */}
      <path
        d={areaPath}
        fill={isUp ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.10)'}
      />
      {/* Line */}
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={isUp ? '#16a34a' : '#ef4444'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      <circle cx={lx} cy={ly} r="4" fill={isUp ? '#16a34a' : '#ef4444'} />
    </svg>
  );
}

// DayLabels — x-axis date labels for the sparkline
// Props:
//   count — number of days (must match data array length)
export function DayLabels({ count }) {
  const days = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
  }
  return (
    <div className="flex justify-between text-[9px] text-gray-400 px-1 mt-1">
      <span>{days[0]}</span>
      <span>{days[Math.floor(count / 2)]}</span>
      <span>{days[days.length - 1]}</span>
    </div>
  );
}
