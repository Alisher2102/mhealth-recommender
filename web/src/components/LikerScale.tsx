import { SUS_SCALE } from "../content/sus";

interface LikertScaleProps {
  name: string;
  question: string;
  value?: number;
  onChange: (value: number) => void;
}

export default function LikertScale({
  name,
  question,
  value,
  onChange,
}: LikertScaleProps) {
  return (
    <fieldset className="border-t border-slate-200 py-5">
      <legend className="text-slate-900">{question}</legend>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUS_SCALE.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                selected
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span>{option.value}</span>
              <span className="hidden sm:inline">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
