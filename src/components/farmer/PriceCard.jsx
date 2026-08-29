// PriceCard — displays a mandi crop price with trend indicator
import Card from '../ui/Card';
import { formatPriceChange } from '../../utils/helpers';

function TrendArrow({ trend }) {
  if (trend === 'up')
    return <span className="text-green-500 text-lg font-bold">↑</span>;
  if (trend === 'down')
    return <span className="text-red-500 text-lg font-bold">↓</span>;
  return <span className="text-gray-400 text-lg font-bold">→</span>;
}

export default function PriceCard({ item, onClick }) {
  const changeInfo = formatPriceChange(item.change, item.changePercent);

  return (
    <Card onClick={onClick} className="flex items-center gap-3">
      {/* Crop emoji */}
      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
        {item.cropEmoji}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-800 truncate">{item.cropNameHi}</p>
          <span className="text-xs text-gray-400 truncate hidden sm:inline">{item.cropName}</span>
        </div>
        <p className="text-xs text-gray-500 truncate">{item.mandiHi || item.mandi}</p>
      </div>

      {/* Price & trend */}
      <div className="text-right flex-shrink-0">
        <div className="flex items-center gap-1 justify-end">
          <TrendArrow trend={item.trend} />
          <span className="text-lg font-bold text-gray-800">
            ₹{item.price.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="text-xs font-medium mt-0.5" style={{ color: item.change >= 0 ? '#16a34a' : '#ef4444' }}>
          {changeInfo.text}
        </p>
        <p className="text-[10px] text-gray-400">/क्विंटल</p>
      </div>
    </Card>
  );
}
