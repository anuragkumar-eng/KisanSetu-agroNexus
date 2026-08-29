// Orders — order tracking page for buyers
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import OrderTimeline from '../../components/farmer/OrderTimeline';
import { orders } from '../../data/mockOrders';
import { formatRupees } from '../../utils/helpers';

export default function Orders() {
  return (
    <Layout title="ऑर्डर / Orders" showBack>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {orders.length === 0 ? (
          <EmptyState
            emoji="📦"
            title="कोई ऑर्डर नहीं"
            subtitle="अभी तक कोई ऑर्डर नहीं दिया।"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{order.cropEmoji}</span>
                    <div>
                      <p className="font-bold text-gray-800">{order.cropNameHi}</p>
                      <p className="text-xs text-gray-500">👨‍🌾 {order.farmerName} • {order.farmerLocation}</p>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Order details */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-xl py-2">
                    <p className="text-[10px] text-gray-500">मात्रा</p>
                    <p className="font-bold text-gray-800 text-sm">{order.quantity} क्विं</p>
                  </div>
                  <div className="bg-green-50 rounded-xl py-2">
                    <p className="text-[10px] text-gray-500">कुल राशि</p>
                    <p className="font-bold text-green-700 text-sm">{formatRupees(order.totalAmount)}</p>
                  </div>
                  <div className={`rounded-xl py-2 ${order.paymentStatus === 'paid' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <p className="text-[10px] text-gray-500">भुगतान</p>
                    <p className={`font-bold text-sm ${order.paymentStatus === 'paid' ? 'text-green-700' : 'text-yellow-700'}`}>
                      {order.paymentStatusHi}
                    </p>
                  </div>
                </div>

                {/* Tracking ID */}
                {order.trackingId && (
                  <div className="bg-blue-50 rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="text-lg">🚚</span>
                    <div>
                      <p className="text-xs font-semibold text-blue-700">ट्रैकिंग ID: {order.trackingId}</p>
                      <p className="text-[10px] text-gray-500">{order.logisticsProvider}</p>
                    </div>
                  </div>
                )}

                {/* Timeline — now from shared component */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">📍 ऑर्डर स्थिति</p>
                  <OrderTimeline steps={order.steps} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
