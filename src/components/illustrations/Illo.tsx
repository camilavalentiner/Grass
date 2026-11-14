"use client";
import { useId, type ReactNode, type SVGProps } from "react";

/**
 * Shared scaffolding for the hand-drawn illustrations.
 * Ink lines are displaced by noise so they wobble like a dip pen;
 * washes are displaced more and blurred so they sit loosely under the line,
 * the way a watercolour wash never quite matches the drawing.
 */
export const INK = "#3b2f28";
export const SKIN = "#f3cdb8";
export const HAIR = "#8f6b4c";
export const DRESS = "#7ea7d8";
export const DRESS_DEEP = "#5f8cc4";

export function Illo({
  children, viewBox = "0 0 320 220", className, title, ...rest
}: { children: (ids: { ink: string; wash: string }) => ReactNode; viewBox?: string; className?: string; title?: string } & Omit<SVGProps<SVGSVGElement>, "children">) {
  const id = useId().replace(/:/g, "");
  const ink = `ink-${id}`, wash = `wash-${id}`;
  return (
    <svg viewBox={viewBox} className={className} role="img" aria-label={title} {...rest}>
      {title && <title>{title}</title>}
      <defs>
        <filter id={ink} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={wash} x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="3" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
      </defs>
      {children({ ink: `url(#${ink})`, wash: `url(#${wash})` })}
    </svg>
  );
}

/** Watercolour wash layer */
export function Wash({ filter, children, opacity = 0.85 }: { filter: string; children: ReactNode; opacity?: number }) {
  return <g filter={filter} opacity={opacity} stroke="none">{children}</g>;
}
/** Ink line layer */
export function Ink({ filter, children, width = 1.6 }: { filter: string; children: ReactNode; width?: number }) {
  return (
    <g filter={filter} fill="none" stroke={INK} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </g>
  );
}

/** A little face: dot eyes, hook nose, mouth. `mood` changes the mouth. */
export function Face({ x, y, mood = "smile", dir = 1 }: { x: number; y: number; mood?: "smile" | "grin" | "focus" | "open"; dir?: 1 | -1 }) {
  const m = {
    smile: `M${x - 6 * dir} ${y + 8} q${6 * dir} 6 ${12 * dir} 0`,
    grin: `M${x - 7 * dir} ${y + 7} q${7 * dir} 9 ${14 * dir} 0`,
    focus: `M${x - 4 * dir} ${y + 9} q${4 * dir} 1 ${8 * dir} 0`,
    open: `M${x - 6 * dir} ${y + 7} q${6 * dir} 10 ${12 * dir} 0 z`,
  }[mood];
  return (
    <g>
      <circle cx={x - 5 * dir} cy={y} r={1.4} fill={INK} stroke="none" />
      <circle cx={x + 4 * dir} cy={y - 0.5} r={1.4} fill={INK} stroke="none" />
      <path d={`M${x + 1 * dir} ${y + 1} l${3 * dir} 4 l${-3 * dir} 1`} />
      <path d={m} fill={mood === "open" ? "#b55b6a" : "none"} />
      <circle cx={x - 9 * dir} cy={y + 5} r={3} fill="#f2a9b4" stroke="none" opacity={0.55} />
    </g>
  );
}
