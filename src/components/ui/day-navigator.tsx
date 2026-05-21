"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDays, formatDayLabel, toDayKey } from "@/lib/date-utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DayNavigator({
  dayKey,
  onDayChange,
  dayKeysWithData,
}: {
  dayKey: string;
  onDayChange: (key: string) => void;
  dayKeysWithData?: string[];
}) {
  const today = toDayKey(new Date());
  const selected = new Date(dayKey + "T12:00:00");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDayChange(toDayKey(addDays(selected, -1)))}
          aria-label="Previous day"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-[140px] text-center">
          <p className="text-sm font-semibold text-slate-800">
            {formatDayLabel(dayKey)}
          </p>
          <p className="text-xs text-slate-500">{dayKey}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDayChange(toDayKey(addDays(selected, 1)))}
          disabled={dayKey >= today}
          aria-label="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        {dayKey !== today && (
          <Button variant="ghost" size="sm" onClick={() => onDayChange(today)}>
            Today
          </Button>
        )}
      </div>
      <Input
        type="date"
        value={dayKey}
        max={today}
        onChange={(e) => e.target.value && onDayChange(e.target.value)}
        className="max-w-[180px]"
      />
      {dayKeysWithData && dayKeysWithData.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {dayKeysWithData.slice(0, 8).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onDayChange(key)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                key === dayKey
                  ? "bg-pulse-100 text-pulse-800 ring-1 ring-pulse-200"
                  : "bg-mist-100 text-slate-600 hover:bg-pulse-50"
              }`}
            >
              {formatDayLabel(key)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
