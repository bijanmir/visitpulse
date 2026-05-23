"use client";

import {
  SCALE_ANSWERS,
  severity,
  type ScaleDefinition,
} from "@/lib/symptom-scales";
import { cn } from "@/lib/utils";

type ScaleAnswers = (number | null)[];

export function SymptomScaleStep({
  scale,
  answers,
  onChange,
  onSkip,
  skipped,
}: {
  scale: ScaleDefinition;
  answers: ScaleAnswers;
  onChange: (next: ScaleAnswers) => void;
  onSkip: () => void;
  skipped: boolean;
}) {
  const answered = answers.filter((a) => a !== null).length;
  const allAnswered = answered === scale.questions.length;
  const subtotal = answers.reduce<number>((sum, v) => sum + (v ?? 0), 0);

  if (skipped) {
    return (
      <div>
        <div className="flex items-center gap-2 text-pulse-700">
          <h2 className="font-medium text-slate-800">{scale.title}</h2>
        </div>
        <p className="mt-3 rounded-xl bg-mist-50 px-4 py-4 text-sm text-slate-600">
          Skipped for this check-in. Tap below if you&apos;d like to fill it in
          after all.
        </p>
        <button
          type="button"
          onClick={onSkip}
          className="mt-3 text-sm font-medium text-pulse-700 hover:text-pulse-800"
        >
          Answer {scale.shortTitle} questions
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-pulse-700">
        <h2 className="font-medium text-slate-800">{scale.title}</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">{scale.intro}</p>

      <ol className="mt-5 space-y-4">
        {scale.questions.map((q, i) => (
          <li
            key={i}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <p className="text-sm text-slate-700">
              <span className="mr-1 font-medium text-slate-500">{i + 1}.</span>
              {q}
            </p>
            <div
              role="radiogroup"
              aria-label={`Question ${i + 1}`}
              className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4"
            >
              {SCALE_ANSWERS.map((opt) => {
                const selected = answers[i] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      const next = answers.slice();
                      next[i] = opt.value;
                      onChange(next);
                    }}
                    className={cn(
                      "rounded-lg px-2 py-2 text-xs font-medium transition-colors",
                      selected
                        ? "bg-pulse-100 text-pulse-800 ring-2 ring-pulse-300"
                        : "bg-mist-50 text-slate-600 ring-1 ring-slate-200 hover:bg-mist-100",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-mist-50 px-4 py-3 text-sm">
        <span className="text-slate-600">
          {answered} of {scale.questions.length} answered
          {allAnswered && (
            <>
              {" · "}
              <span className="font-medium text-slate-800">
                Score {subtotal}/{scale.maxScore} ({severity(scale.type, subtotal)})
              </span>
            </>
          )}
        </span>
        <button
          type="button"
          onClick={onSkip}
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          Skip this section
        </button>
      </div>
    </div>
  );
}
