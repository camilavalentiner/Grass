"use client";
export function Stars({ value, onChange, size = 30 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="inline-flex gap-1.5" role="radiogroup" aria-label="How driven do you feel?">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange?.(n)}
          className="transition-transform hover:-translate-y-0.5 active:translate-y-0"
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <path
              d="M12 2.6 l2.9 6.1 6.6 .8 -4.9 4.6 1.3 6.6 -5.9 -3.3 -5.9 3.3 1.3 -6.6 -4.9 -4.6 6.6 -.8z"
              fill={n <= value ? "#f3d55b" : "transparent"}
              stroke="#3b2f28"
              strokeWidth="1.3"
              strokeLinejoin="round"
              transform={`rotate(${(n * 7) % 11 - 5} 12 12)`}
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
