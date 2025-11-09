/**
 * Radio Group Component
 *
 * Far-future styled radio button group for exclusive selections.
 */

'use client';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  disabled = false
}: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.value}
          className={`block p-3 border rounded-sm cursor-pointer transition-all duration-300
            ${value === option.value
              ? 'border-cyan-400/60 bg-cyan-400/10 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
            }
            ${disabled || option.disabled ? 'opacity-40 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            disabled={disabled || option.disabled}
            className="hidden"
          />

          <div className="flex items-center space-x-3">
            {/* Custom Radio Indicator */}
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
              ${value === option.value
                ? 'border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                : 'border-white/40'
              }`}
            >
              {value === option.value && (
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
              )}
            </div>

            <div className="flex-1">
              <div className={`text-sm font-light uppercase tracking-wider
                ${value === option.value ? 'text-cyan-400' : 'text-white/80'}
              `}>
                {option.label}
              </div>
              {option.description && (
                <div className="text-xs text-white/40 mt-1">
                  {option.description}
                </div>
              )}
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}