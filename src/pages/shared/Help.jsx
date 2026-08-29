// Help & Grievance page
import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const FAQ = [
  {
    q: 'मंडी भाव कैसे देखें?',
    qEn: 'How to see mandi prices?',
    a: 'होम पेज पर "मंडी भाव" बटन दबाएँ। आपको सभी मंडियों के ताज़ा भाव दिखेंगे।',
  },
  {
    q: 'लॉट कैसे बनाएँ?',
    qEn: 'How to create a lot?',
    a: '"मेरी फसल" पेज पर जाएँ और "नया लॉट बनाएँ" बटन दबाएँ। फसल, मात्रा और मूल्य भरें।',
  },
  {
    q: 'ऑफर कैसे स्वीकार करें?',
    qEn: 'How to accept an offer?',
    a: '"ऑफर" पेज पर जाएँ। किसी भी ऑफर के नीचे "स्वीकार करें" बटन दबाएँ।',
  },
  {
    q: 'खरीदार भरोसेमंद है या नहीं?',
    qEn: 'Is the buyer trustworthy?',
    a: 'खरीदार की प्रोफाइल देखें — रेटिंग, कुल सौदे और समीक्षाएँ जाँचें। ✅ सत्यापित बैज देखें।',
  },
  {
    q: 'भुगतान नहीं मिला तो क्या करें?',
    qEn: 'What if payment is not received?',
    a: 'नीचे दिए गए "शिकायत करें" बटन पर क्लिक करें। हमारी टीम 24 घंटे में संपर्क करेगी।',
  },
];

export default function Help() {
  const [openIndex, setOpenIndex] = useState(null);
  const [grievance, setGrievance] = useState('');
  const [grievanceSent, setGrievanceSent] = useState(false);

  return (
    <Layout title="मदद / Help" showBack>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
        {/* Header */}
        <div className="bg-green-50 rounded-2xl p-5 text-center">
          <p className="text-4xl mb-2">🙋</p>
          <h2 className="text-lg font-bold text-green-700">कैसे मदद करें?</h2>
          <p className="text-sm text-gray-500 mt-1">How can we help you?</p>
        </div>

        {/* Emergency contacts */}
        <Card>
          <p className="font-semibold text-gray-700 mb-3">📞 संपर्क करें / Contact</p>
          <div className="space-y-2">
            {[
              { emoji: '📞', label: 'हेल्पलाइन', value: '1800-123-4567', sub: 'सोम–शनि, 8am–8pm' },
              { emoji: '💬', label: 'WhatsApp', value: '+91 98765 00000', sub: 'तत्काल सहायता' },
              { emoji: '📧', label: 'Email', value: 'help@kisansetu.in', sub: '24–48 घंटे में जवाब' },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-2xl">{c.emoji}</span>
                <div>
                  <p className="text-xs text-gray-500">{c.label}</p>
                  <p className="font-medium text-gray-800 text-sm">{c.value}</p>
                  <p className="text-[10px] text-gray-400">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* FAQ Accordion */}
        <Card padding={false} className="overflow-hidden">
          <p className="font-semibold text-gray-700 px-4 pt-4 pb-2">❓ अक्सर पूछे जाने वाले सवाल</p>
          {FAQ.map((item, i) => (
            <div key={i} className="border-t border-gray-50">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-4 py-3 flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.q}</p>
                  <p className="text-[10px] text-gray-400">{item.qEn}</p>
                </div>
                <span className="text-gray-400 text-lg flex-shrink-0">
                  {openIndex === i ? '−' : '+'}
                </span>
              </button>
              {openIndex === i && (
                <div className="px-4 pb-3 bg-gray-50">
                  <p className="text-sm text-gray-600">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </Card>

        {/* Grievance form */}
        <Card>
          <p className="font-semibold text-gray-700 mb-3">📝 शिकायत / Grievance</p>
          {grievanceSent ? (
            <div className="text-center py-4">
              <p className="text-3xl mb-2">✅</p>
              <p className="font-semibold text-green-700">शिकायत दर्ज हो गई!</p>
              <p className="text-xs text-gray-500 mt-1">हमारी टीम 24 घंटे में संपर्क करेगी।</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setGrievanceSent(true); }}
              className="space-y-3"
            >
              <textarea
                value={grievance}
                onChange={(e) => setGrievance(e.target.value)}
                required
                rows={4}
                placeholder="अपनी समस्या यहाँ लिखें... / Describe your issue here..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm resize-none"
              />
              <Button type="submit" variant="primary" fullWidth size="lg">
                शिकायत भेजें / Submit
              </Button>
            </form>
          )}
        </Card>

        {/* Version */}
        <p className="text-center text-xs text-gray-400">
          KisanSetu v1.0 • Smart India Hackathon 2026
        </p>
      </div>
    </Layout>
  );
}
