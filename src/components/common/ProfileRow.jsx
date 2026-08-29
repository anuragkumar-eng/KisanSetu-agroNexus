// ProfileRow — a single labeled row in a profile card
// Props:
//   emoji — leading icon string
//   label — small gray label above the value (Hindi or bilingual)
//   value — displayed value string

export default function ProfileRow({ emoji, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className="text-lg mt-0.5">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800 break-words">{value}</p>
      </div>
    </div>
  );
}
