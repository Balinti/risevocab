'use client';

interface TonePickerProps {
  selected: string;
  onChange: (tone: string) => void;
}

const TONES = [
  { value: 'polite', label: 'Polite', description: 'Respectful and courteous' },
  { value: 'neutral', label: 'Neutral', description: 'Professional and balanced' },
  { value: 'direct', label: 'Direct', description: 'Clear and straightforward' },
  { value: 'confident', label: 'Confident', description: 'Assertive but not aggressive' },
];

export default function TonePicker({ selected, onChange }: TonePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {TONES.map((tone) => (
        <button
          key={tone.value}
          onClick={() => onChange(tone.value)}
          className={`p-3 rounded-lg border text-left transition-all ${
            selected === tone.value
              ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400'
              : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
          }`}
        >
          <span className="block font-medium text-sm">{tone.label}</span>
          <span className="block text-xs text-gray-500 mt-0.5">{tone.description}</span>
        </button>
      ))}
    </div>
  );
}
