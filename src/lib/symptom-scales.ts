import type { ScaleType } from "@/modules/clinical/types";

/** Standard PHQ-9 / GAD-7 answer options (0–3). */
export const SCALE_ANSWERS: { value: number; label: string }[] = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

export const PHQ9_QUESTIONS: readonly string[] = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed; or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself in some way",
];

export const GAD7_QUESTIONS: readonly string[] = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen",
];

export type ScaleDefinition = {
  type: ScaleType;
  title: string;
  shortTitle: string;
  intro: string;
  questions: readonly string[];
  maxScore: number;
};

export const PHQ9: ScaleDefinition = {
  type: "phq9",
  title: "PHQ-9 — depression check",
  shortTitle: "PHQ-9",
  intro:
    "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
  questions: PHQ9_QUESTIONS,
  maxScore: 27,
};

export const GAD7: ScaleDefinition = {
  type: "gad7",
  title: "GAD-7 — anxiety check",
  shortTitle: "GAD-7",
  intro:
    "Over the last 2 weeks, how often have you been bothered by the following problems?",
  questions: GAD7_QUESTIONS,
  maxScore: 21,
};

/**
 * Severity interpretation. Buckets come from the validated PHQ-9 / GAD-7
 * scoring guides; bucket labels are diagnostic shorthand, not a diagnosis.
 */
export function severity(type: ScaleType, score: number): string {
  if (type === "phq9") {
    if (score <= 4) return "Minimal";
    if (score <= 9) return "Mild";
    if (score <= 14) return "Moderate";
    if (score <= 19) return "Moderately severe";
    return "Severe";
  }
  // GAD-7
  if (score <= 4) return "Minimal";
  if (score <= 9) return "Mild";
  if (score <= 14) return "Moderate";
  return "Severe";
}

/** Index of the PHQ-9 suicidal ideation item. */
export const PHQ9_SI_INDEX = 8;
