"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";

import { cn } from "@/lib/utils";

/**
 * A timeline scrubber for the morph playground: drag, click or use the arrow
 * keys (one step per `step`, Page keys ten, Home and End jump to the ends).
 * Built as an ARIA slider on a div because the component set has no range
 * primitive and a bare `<input>` is off limits outside `ui/`.
 */
export function ProgressScrubber({
  value,
  onChange,
  step = 0.01,
  label,
  valueText,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label: string;
  valueText?: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const fromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    onChange(Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: step,
      ArrowUp: step,
      ArrowLeft: -step,
      ArrowDown: -step,
      PageUp: step * 10,
      PageDown: -step * 10,
    };
    let next: number | null = null;
    if (event.key in moves) next = value + moves[event.key];
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 1;
    if (next === null) return;
    event.preventDefault();
    onChange(Math.min(1, Math.max(0, Math.round(next / step) * step)));
  };

  const percent = `${value * 100}%`;

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={Math.round(value * 1000) / 1000}
      aria-valuetext={valueText}
      className={cn(
        "group/scrubber relative flex h-6 cursor-pointer touch-none items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        fromPointer(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) fromPointer(event);
      }}
      onKeyDown={onKeyDown}
    >
      <span aria-hidden="true" className="absolute inset-x-0 h-1 rounded-full bg-tint-15" />
      <span aria-hidden="true" className="absolute left-0 h-1 rounded-full bg-foreground" style={{ width: percent }} />
      <span
        aria-hidden="true"
        className="absolute size-4 -translate-x-1/2 rounded-full bg-background shadow-md ring-1 ring-border-loud transition-[scale] duration-(--duration-fast) ease-out-quart group-active/scrubber:scale-110"
        style={{ left: percent }}
      />
    </div>
  );
}
