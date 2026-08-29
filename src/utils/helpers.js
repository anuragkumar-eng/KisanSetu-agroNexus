// Utility helpers

/**
 * Format a number as Indian Rupees
 * e.g. 228000 → "₹2,28,000"
 */
export function formatRupees(amount) {
  if (amount == null) return '—';
  return '₹' + amount.toLocaleString('en-IN');
}

/**
 * Format price per quintal
 * e.g. 2250 → "₹2,250/क्विंटल"
 */
export function formatPricePerUnit(price, unit = 'क्विंटल') {
  return `₹${price.toLocaleString('en-IN')}/${unit}`;
}

/**
 * Format a price change with sign and color class
 * Returns { text, colorClass }
 */
export function formatPriceChange(change, changePercent) {
  if (change === 0) return { text: 'कोई बदलाव नहीं', colorClass: 'text-gray-500' };
  const sign = change > 0 ? '+' : '';
  return {
    text: `${sign}₹${Math.abs(change)} (${sign}${changePercent.toFixed(1)}%)`,
    colorClass: change > 0 ? 'text-green-600' : 'text-red-500',
  };
}

/**
 * Format date string to readable format
 * e.g. "2026-08-27T14:00:00" → "27 Aug, 2:00 PM"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date only (no time)
 */
export function formatDateOnly(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get relative time (e.g. "2 hours ago")
 */
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'अभी / Just now';
  if (minutes < 60) return `${minutes} मिनट पहले`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} घंटे पहले`;
  const days = Math.floor(hours / 24);
  return `${days} दिन पहले`;
}

/**
 * Get status display config (label + color classes)
 */
export function getStatusConfig(status) {
  const configs = {
    active:     { label: 'सक्रिय',    labelEn: 'Active',     bg: 'bg-green-100',  text: 'text-green-700'  },
    pending:    { label: 'प्रतीक्षित', labelEn: 'Pending',    bg: 'bg-yellow-100', text: 'text-yellow-700' },
    accepted:   { label: 'स्वीकृत',   labelEn: 'Accepted',   bg: 'bg-blue-100',   text: 'text-blue-700'   },
    rejected:   { label: 'अस्वीकृत',  labelEn: 'Rejected',   bg: 'bg-red-100',    text: 'text-red-600'    },
    completed:  { label: 'पूर्ण',      labelEn: 'Completed',  bg: 'bg-gray-100',   text: 'text-gray-600'   },
    sold:       { label: 'बिक गया',   labelEn: 'Sold',       bg: 'bg-gray-100',   text: 'text-gray-500'   },
    in_transit: { label: 'रास्ते में', labelEn: 'In Transit', bg: 'bg-blue-100',   text: 'text-blue-700'   },
    delivered:  { label: 'पहुँच गया', labelEn: 'Delivered',  bg: 'bg-green-100',  text: 'text-green-700'  },
    draft:      { label: 'ड्राफ्ट',   labelEn: 'Draft',      bg: 'bg-gray-100',   text: 'text-gray-500'   },
    expired:    { label: 'समाप्त',    labelEn: 'Expired',    bg: 'bg-red-50',     text: 'text-red-400'    },
    paid:       { label: 'भुगतान हो गया', labelEn: 'Paid',  bg: 'bg-green-100',  text: 'text-green-700'  },
  };
  return configs[status] || { label: status, labelEn: status, bg: 'bg-gray-100', text: 'text-gray-600' };
}

/**
 * Truncate text to n characters
 */
export function truncate(text, n = 80) {
  if (!text) return '';
  return text.length > n ? text.slice(0, n) + '…' : text;
}
