// Mock Notifications Data
// Structure matches future API: GET /api/notifications?userId=
//
// Each notification carries both farmerLink and buyerLink so the
// Notifications page can navigate to the correct route based on user.role.
// This avoids farmer-specific routes (e.g. /farmer/orders) appearing for buyers.

export const notifications = [
  {
    id: 'n1',
    type: 'offer',
    icon: '🤝',
    title: 'नया ऑफर मिला',
    titleEn: 'New Offer Received',
    message: 'Ramesh Agarwal ने आपके गेहूँ लॉट पर ₹2,280/क्विंटल का ऑफर दिया।',
    messageEn: 'Ramesh Agarwal made an offer of ₹2,280/quintal on your Wheat lot.',
    read: false,
    createdAt: '2026-08-27T14:00:00',
    farmerLink: '/farmer/offers',      // farmer goes to their offer list
    buyerLink: '/buyer/offers',        // buyer goes to their offer list
  },
  {
    id: 'n2',
    type: 'price',
    icon: '📈',
    title: 'टमाटर का दाम बढ़ा!',
    titleEn: 'Tomato Price Surge!',
    message: 'टमाटर का दाम आज ₹3,200/क्विंटल हो गया — 23% की बढ़ोतरी।',
    messageEn: 'Tomato price reached ₹3,200/quintal today — 23% rise.',
    read: false,
    createdAt: '2026-08-27T09:30:00',
    farmerLink: '/farmer/mandi',       // farmer goes to mandi prices
    buyerLink: '/buyer/marketplace',   // buyer goes to marketplace
  },
  {
    id: 'n3',
    type: 'order',
    icon: '🚚',
    title: 'ऑर्डर रास्ते में',
    titleEn: 'Order In Transit',
    message: 'सरसों ऑर्डर KS-TRK-7842 उठा लिया गया है।',
    messageEn: 'Mustard order KS-TRK-7842 has been picked up.',
    read: true,
    createdAt: '2026-08-25T08:00:00',
    farmerLink: '/farmer/offers',      // farmer has no orders page — offers is the closest
    buyerLink: '/buyer/orders',        // buyer goes to order tracking
  },
  {
    id: 'n4',
    type: 'payment',
    icon: '💰',
    title: 'भुगतान हो गया!',
    titleEn: 'Payment Received!',
    message: 'धान के लिए ₹2,05,000 आपके खाते में जमा हो गए।',
    messageEn: '₹2,05,000 credited to your account for Rice sale.',
    read: true,
    createdAt: '2026-08-20T16:00:00',
    farmerLink: '/farmer/profile',     // farmer goes to profile (bank/payment info)
    buyerLink: '/buyer/profile',       // buyer goes to profile
  },
];
