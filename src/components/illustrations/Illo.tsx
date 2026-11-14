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
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={wash} x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>
      {children({ ink: `url(#${ink})`, wash: `url(#${wash})` })}
    </svg>
  );
}

/** Watercolour wash layer */
export function Wash({ filter, children, opacity = 0.85 }: { filter: string; children: ReactNode; opacity?: number }) {
  return <g filter={filter} opacity={opacity} stroke="none" transform="translate(1.4 1)">{children}</g>;
}
/** Ink line layer */
export function Ink({ filter, children, width = 1.6 }: { filter: string; children: ReactNode; width?: number }) {
  return (
    <g filter={filter} fill="none" stroke={INK} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </g>
  );
}

