// OrderTimeline — vertical step tracker for order progress
// Props:
//   steps — array of { labelHi, done, date? }

import { formatDateOnly } from '../../utils/helpers';

export default function OrderTimeline({ steps }) {
  return (
    <div className="space-y-0 mt-3">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={step.labelHi} className="flex gap-3">
            {/* Icon + connector line */}
            <div className="flex flex-col items-center">
              <div
                className={[
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                  step.done
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400',
                ].join(' ')}
              >
                {step.done ? '✓' : '○'}
              </div>
              {!isLast && (
                <div className={`w-0.5 h-6 ${step.done ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </div>
            {/* Label + date */}
            <div className="pb-2">
              <p className={`text-sm font-medium ${step.done ? 'text-gray-800' : 'text-gray-400'}`}>
                {step.labelHi}
              </p>
              {step.date && (
                <p className="text-[10px] text-gray-400">{formatDateOnly(step.date)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
