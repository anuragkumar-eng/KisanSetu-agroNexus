// OfferCard — displays an offer with accept/reject actions
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import { formatRupees, formatDate } from '../../utils/helpers';

export default function OfferCard({
  offer,
  onAccept,
  onReject,
  onViewBuyer,
  showActions = true,
  isBuyerView = false,
}) {
  const isPending = offer.status === 'pending';

  return (
    <Card className="space-y-3">
      {/* Top: crop + status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{offer.lotCropEmoji}</span>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{offer.lotCropNameHi}</p>
            {!isBuyerView && (
              <p className="text-xs text-gray-500">{offer.buyerCompany}</p>
            )}
            {isBuyerView && (
              <p className="text-xs text-gray-500">{offer.farmerLocation}</p>
            )}
          </div>
        </div>
        <StatusBadge status={offer.status} />
      </div>

      {/* Buyer info (farmer view) */}
      {!isBuyerView && (
        <div
          className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 cursor-pointer hover:bg-green-50 transition-colors"
          onClick={onViewBuyer}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onViewBuyer?.()}
        >
          <span className="text-xl">👨‍💼</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-sm text-gray-800">{offer.buyerName}</p>
              {offer.buyerVerified && (
                <span className="text-blue-500 text-xs">✅ सत्यापित</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>⭐ {offer.buyerRating}</span>
              <span>•</span>
              <span>प्रोफाइल देखें →</span>
            </div>
          </div>
        </div>
      )}

      {/* Offer details */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-green-50 rounded-xl py-2">
          <p className="text-[10px] text-gray-500">ऑफर मूल्य</p>
          <p className="font-bold text-green-700 text-sm">₹{offer.offerPrice.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-gray-400">/क्विंटल</p>
        </div>
        <div className="bg-gray-50 rounded-xl py-2">
          <p className="text-[10px] text-gray-500">मात्रा</p>
          <p className="font-bold text-gray-800 text-sm">{offer.quantity}</p>
          <p className="text-[10px] text-gray-400">क्विंटल</p>
        </div>
        <div className="bg-gray-50 rounded-xl py-2">
          <p className="text-[10px] text-gray-500">कुल राशि</p>
          <p className="font-bold text-gray-800 text-xs">{formatRupees(offer.totalAmount)}</p>
        </div>
      </div>

      {/* Message */}
      {offer.messageHi && (
        <div className="bg-yellow-50 rounded-xl px-3 py-2 border-l-4 border-yellow-400">
          <p className="text-xs text-gray-600 italic">"{offer.messageHi}"</p>
        </div>
      )}

      {/* Time */}
      <p className="text-[10px] text-gray-400">{formatDate(offer.createdAt)}</p>

      {/* Actions — only for pending offers in farmer view */}
      {showActions && isPending && !isBuyerView && (
        <div className="flex gap-2 pt-1">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => onAccept?.(offer.id)}
            icon="✅"
          >
            स्वीकार करें
          </Button>
          <Button
            variant="danger"
            size="sm"
            fullWidth
            onClick={() => onReject?.(offer.id)}
            icon="❌"
          >
            अस्वीकार
          </Button>
        </div>
      )}
    </Card>
  );
}
