// StatusBadge — color-coded order/offer status badge
import { getStatusConfig } from '../../utils/helpers';

export default function StatusBadge({ status, showEnglish = false }) {
  const config = getStatusConfig(status);
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        config.bg,
        config.text,
      ].join(' ')}
    >
      {showEnglish ? config.labelEn : config.label}
    </span>
  );
}
