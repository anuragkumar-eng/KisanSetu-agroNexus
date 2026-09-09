// BuyerOffers — offers the buyer has made
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import OfferCard from '../../components/farmer/OfferCard';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/ui/Button';
import { useOffers } from '../../hooks/useOffers';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

export default function BuyerOffers() {
  const navigate = useNavigate();
  const { offers: buyerOffers, loading, error } = useOffers();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <Layout title="मेरे ऑफर / My Offers" showBack>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'कुल ऑफर',  value: buyerOffers.length },
            { label: 'प्रतीक्षित', value: buyerOffers.filter((o) => o.status === 'pending').length },
            { label: 'स्वीकृत',   value: buyerOffers.filter((o) => o.status === 'accepted').length },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-[0_1px_6px_rgba(0,0,0,0.08)] p-3 text-center">
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {buyerOffers.length === 0 ? (
          <EmptyState
            emoji="🤝"
            title="कोई ऑफर नहीं दिया"
            subtitle="Marketplace में जाएँ और किसानों को ऑफर दें।"
            action={
              <Button variant="primary" onClick={() => navigate('/buyer/marketplace')}>
                बाज़ार देखें
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {buyerOffers.map((offer) => (
              <div key={offer._id || offer.id}>
                {/* Reusable OfferCard in buyer view mode */}
                <OfferCard
                  offer={offer}
                  isBuyerView={true}
                  showActions={false}
                />
                {/* Buyer-specific footer — pending hint or navigate-to-order action */}
                {(offer.status === 'pending' || offer.status === 'accepted') && (
                  <div className="flex items-center justify-end px-4 py-2 bg-white -mt-2 rounded-b-2xl border border-t-0 border-gray-100">
                    {offer.status === 'pending' && (
                      <p className="text-xs text-yellow-600 font-medium">⏳ किसान के जवाब का इंतज़ार</p>
                    )}
                    {offer.status === 'accepted' && (
                      <Button size="sm" variant="primary" onClick={() => navigate('/buyer/orders')}>
                        ऑर्डर देखें →
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" fullWidth icon="🛒" onClick={() => navigate('/buyer/marketplace')}>
          और लॉट देखें
        </Button>
      </div>
    </Layout>
  );
}
