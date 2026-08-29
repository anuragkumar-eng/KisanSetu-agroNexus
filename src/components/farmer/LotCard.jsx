// LotCard — displays a farmer's crop lot listing
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import Badge from '../ui/Badge';
import { formatDateOnly } from '../../utils/helpers';

export default function LotCard({ lot, onClick, showFarmer = false }) {
  return (
    <Card onClick={onClick} className="space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{lot.cropEmoji}</span>
          <div>
            <p className="font-semibold text-gray-800">{lot.cropNameHi}</p>
            <p className="text-xs text-gray-500">{lot.cropName}</p>
          </div>
        </div>
        <StatusBadge status={lot.status} />
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-xl py-2">
          <p className="text-xs text-gray-500">मात्रा</p>
          <p className="font-bold text-gray-800 text-sm">{lot.quantity}</p>
          <p className="text-[10px] text-gray-400">{lot.unitHi}</p>
        </div>
        <div className="bg-green-50 rounded-xl py-2">
          <p className="text-xs text-gray-500">माँग मूल्य</p>
          <p className="font-bold text-green-700 text-sm">₹{lot.askingPrice.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-gray-400">/क्विंटल</p>
        </div>
        <div className="bg-gray-50 rounded-xl py-2">
          <p className="text-xs text-gray-500">ऑफर</p>
          <p className="font-bold text-gray-800 text-sm">{lot.offerCount}</p>
          <p className="text-[10px] text-gray-400">मिले</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span>📍</span>
          <span>{lot.locationHi || lot.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="green">{lot.qualityHi}</Badge>
          {showFarmer && <span className="text-gray-400">• {lot.farmerName}</span>}
        </div>
      </div>
    </Card>
  );
}
