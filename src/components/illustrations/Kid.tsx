"use client";
import type { ReactNode } from "react";
import { INK, SKIN, HAIR } from "./Illo";

const r2 = (n: number) => Math.round(n * 100) / 100;

export const TOP = "#fbf1c2";       // pale yellow top
export const STRIPE = "#6f98cc";    // blue stripes on the sleeves
export const PINAFORE = "#7ea7d8";
export const PINAFORE_DEEP = "#5f8cc4";
export const SHOE = "#7a4e2f";
export const BOW = "#f2a9b9";

export type Mood = "smile" | "grin" | "focus" | "joy" | "calm";
type Pt = [number, number];

const d = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");

/* ------------------------------------------------------------------ */
/* Limbs: an ink outline stroke with a coloured stroke on top.         */
/* ------------------------------------------------------------------ */
export function Arm({ pts, cls }: { pts: [Pt, Pt, Pt]; cls?: string }) {
  const sleeve = d([pts[0], pts[1]]);
  const fore = d([pts[1], pts[2]]);
  return (
    <g className={cls} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={sleeve} stroke={INK} strokeWidth="10.5" />
      <path d={fore} stroke={INK} strokeWidth="7.5" />
      <path d={sleeve} stroke={TOP} strokeWidth="8" />
      <path d={sleeve} stroke={STRIPE} strokeWidth="8" strokeDasharray="2 4" strokeLinecap="butt" />
      <path d={fore} stroke={SKIN} strokeWidth="5" />
      <circle cx={pts[2][0]} cy={pts[2][1]} r="3.4" fill={SKIN} stroke={INK} strokeWidth="1.4" />
    </g>
  );
}

export function Leg({ pts, foot = 1, cls }: { pts: [Pt, Pt, Pt]; /** direction the toe points: +1 right, -1 left */ foot?: number; cls?: string }) {
  const line = d(pts);
  const [ax, ay] = pts[2];
  const ang = Math.atan2(ay - pts[1][1], ax - pts[1][0]) * (180 / Math.PI);
  return (
    <g className={cls} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={line} stroke={INK} strokeWidth="7.5" />
      <path d={line} stroke={SKIN} strokeWidth="5" />
      {/* scrunched sock */}
      <g transform={`rotate(${r2(ang + 90)} ${ax} ${ay})`}>
        <path d={`M${ax - 5} ${ay - 2} q5 -3 10 0 v6 q-5 3 -10 0 z`} fill="#fffdf7" stroke={INK} strokeWidth="1.3" />
        <path d={`M${ax - 4.5} ${ay + 0.5} q4.5 -2 9 0 M${ax - 4.5} ${ay + 3} q4.5 -2 9 0`} stroke={INK} strokeWidth="1" />
      </g>
      {/* shoe: a little mary-jane pointing in `foot` direction */}
      <g transform={`translate(${ax + foot * 4} ${ay + 5})`}>
        <path d={`M${-7 * foot} -2 q${7 * foot} -4 ${14 * foot} 0 q0 4 ${-3 * foot} 4 h${-9 * foot} q${-3 * foot} 0 ${-2 * foot} -4 z`} fill={SHOE} stroke={INK} strokeWidth="1.3" />
        <path d={`M${-5 * foot} -2 q${5 * foot} -2.5 ${10 * foot} 0`} stroke="#fffdf7" strokeWidth="1" opacity=".8" />
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Pinafore dress over the striped top, drawn with the neck at (0,0).  */
/* ------------------------------------------------------------------ */
export function Pinafore({ x, y, rotate = 0, skirt = 30, flare = 7, children, cls }: { x: number; y: number; rotate?: number; skirt?: number; flare?: number; children?: ReactNode; cls?: string }) {
  const hem = 12 + skirt;
  return (
    <g className={cls} transform={`translate(${x} ${y}) rotate(${rotate})`}>
      {/* top */}
      <path d="M-13 1 h26 v12 h-26 z" fill={TOP} stroke={INK} strokeWidth="1.3" />
      {/* pinafore skirt + bib */}
      <path d={`M-10 12 h20 l${flare} ${skirt} q-${10 + flare} 3 -${20 + 2 * flare} 0 z`} fill={PINAFORE} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d={`M-8 3 h16 v10 h-16 z`} fill={PINAFORE} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d={`M-6 3 v-3 M6 3 v-3`} stroke={INK} strokeWidth="1.5" />
      <path d={`M-9 12 h18`} stroke={PINAFORE_DEEP} strokeWidth="2" />
      {/* pocket */}
      <path d={`M1 ${hem - 14} h7 v6 h-7 z`} fill="none" stroke={INK} strokeWidth="1.2" />
      {/* collar */}
      <path d="M-7 0 q3 5 7 5 q4 0 7 -5" fill="#fffdf7" stroke={INK} strokeWidth="1.3" />
      {children}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Head: hair on top with a fringe, a ponytail with a bow, a daisy     */
/* clip, and a face whose eyebrows and mouth follow the mood.          */
/* ------------------------------------------------------------------ */
export function Head({ x, y, dir = 1, rotate = 0, mood = "smile", pony = "down", cls, blink = true }: {
  x: number; y: number; dir?: 1 | -1; rotate?: number; mood?: Mood; pony?: "down" | "up" | "side"; cls?: string; blink?: boolean;
}) {
  const brows = {
    smile: "M1 -7 q3 -2 6 -1 M9 -8 q3 -1 5 1",
    grin: "M1 -8 q3 -3 6 -2 M9 -9 q3 -1 5 1",
    joy: "M0 -9 q4 -4 7 -2 M9 -10 q4 -2 6 1",
    focus: "M1 -6 q3 0 6 1 M9 -6 q3 0 5 1",
    calm: "M1 -7 q3 -1 6 0 M9 -8 q3 0 5 1",
  }[mood];
  const mouth = {
    smile: <path d="M4 6 q5 5 10 0" />,
    grin: <path d="M3 5 q6 8 12 0" />,
    joy: <path d="M3 5 q6 11 12 0 z" fill="#b55b6a" />,
    focus: <path d="M6 7 h6" />,
    calm: <path d="M5 7 q4 2 8 0" />,
  }[mood];
  const tail = {
    down: "M-16 -5 q-12 0 -14 12 q-1 10 5 16",
    up: "M-16 -6 q-14 -8 -10 -24 q2 -8 8 -10",
    side: "M-16 -5 q-14 4 -22 2 q-8 -2 -10 6",
  }[pony];
  return (
    <g className={cls} transform={`translate(${x} ${y}) rotate(${rotate}) scale(${dir} 1)`} strokeLinecap="round" strokeLinejoin="round">
      {/* ponytail (behind) */}
      <g className="ani-sway" style={{ transformOrigin: "-16px -5px" }}>
        <path d={tail} fill="none" stroke={INK} strokeWidth="8.5" />
        <path d={tail} fill="none" stroke={HAIR} strokeWidth="6" />
        <path d={tail} fill="none" stroke="#6f4f34" strokeWidth="1" strokeDasharray="6 5" opacity=".7" transform="translate(1.5 0)" />
      </g>
      {/* ear */}
      <circle cx="-12" cy="3" r="3.4" fill={SKIN} stroke={INK} strokeWidth="1.3" />
      {/* face */}
      <circle cx="0" cy="0" r="15" fill={SKIN} stroke={INK} strokeWidth="1.5" />
      <circle cx="5" cy="5" r="3.2" fill="#f2a9b4" opacity=".55" />
      {/* hair cap with fringe */}
      <path d="M-17 4 C-19 -16 19 -18 17 1 L13 -5 Q9 -9 4 -6 Q0 -10 -5 -6 Q-10 -10 -14 -3 Z" fill={HAIR} stroke={INK} strokeWidth="1.5" />
      <path d="M7 -6 l1 5 M1 -7 v5 M-6 -6 l-1 5 M-12 -3 l-1 5" fill="none" stroke={INK} strokeWidth="1" />
      <path d="M-10 -12 q10 -6 22 -1" fill="none" stroke="#6f4f34" strokeWidth="1" opacity=".6" />
      {/* bow at the ponytail */}
      <g transform="translate(-16 -5)">
        <path d="M0 0 l-7 -5 l1 8 z M0 0 l-6 6 l-1 -8 z" fill={BOW} stroke={INK} strokeWidth="1.2" />
        <circle r="1.8" fill="#e3899f" stroke={INK} strokeWidth="1" />
      </g>
      {/* daisy clip at the front of the fringe */}
      <g transform="translate(11 -9)">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx={r2(Math.cos((a * Math.PI) / 180) * 2.6)} cy={r2(Math.sin((a * Math.PI) / 180) * 2.6)} rx="2" ry="1.1" transform={`rotate(${a})`} fill="#fffdf7" stroke={INK} strokeWidth=".7" />
        ))}
        <circle r="1.4" fill="#f3d55b" stroke={INK} strokeWidth=".7" />
      </g>
      {/* eyes, brows, nose, mouth */}
      <g className={blink ? "ani-blink" : undefined} style={{ transformOrigin: "7px -1px" }}>
        <circle cx="3" cy="-1" r="1.6" fill={INK} />
        <circle cx="11" cy="-2" r="1.6" fill={INK} />
      </g>
      <g fill="none" stroke={INK} strokeWidth="1.3">
        <path d={brows} />
        <path d="M12 1 l3 4 l-3 1" />
        {mouth}
      </g>
    </g>
  );
}

/* Small reusable props */
export function Daisy({ x, y, r = 5, cls }: { x: number; y: number; r?: number; cls?: string }) {
  return (
    <g className={cls} transform={`translate(${x} ${y})`}>
      {[0, 51, 103, 154, 206, 257, 309].map((a) => (
        <ellipse key={a} cx={r2(Math.cos((a * Math.PI) / 180) * r)} cy={r2(Math.sin((a * Math.PI) / 180) * r)} rx={r2(r * 0.8)} ry={r2(r * 0.42)} transform={`rotate(${a})`} fill="#fffdf7" stroke={INK} strokeWidth=".9" />
      ))}
      <circle r={r * 0.5} fill="#f3d55b" stroke={INK} strokeWidth=".9" />
    </g>
  );
}

export function OpenBook({ x, y, w = 56, cls, flip = false }: { x: number; y: number; w?: number; cls?: string; flip?: boolean }) {
  const h = w / 2;
  return (
    <g className={cls} transform={`translate(${x} ${y})`}>
      <path d={`M${-h} 0 q${h / 2} -8 ${h} 0 q${h / 2} -8 ${h} 0 l-1 10 q${-h / 2} -6 ${-h + 1} 0 q${-h / 2} -6 ${-h + 1} 0 z`} fill="#fffdf7" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M0 -3 v12" stroke={INK} strokeWidth="1.2" />
      <path d={`M${-h + 6} 1 q${h / 2 - 6} -5 ${h - 10} -1 M${-h + 6} 4 q${h / 2 - 6} -5 ${h - 10} -1 M${6} 0 q${h / 2 - 6} -5 ${h - 10} 1 M${6} 3 q${h / 2 - 6} -5 ${h - 10} 1`} fill="none" stroke="#9a8f80" strokeWidth=".9" />
      {flip && (
        <path className="ani-page" style={{ transformOrigin: "0px 2px" }} d={`M0 -3 q${h / 2} -8 ${h - 2} -1 l-1 10 q${-h / 2} -6 ${-h + 3} 0 z`} fill="#fffdf7" stroke={INK} strokeWidth="1.2" />
      )}
    </g>
  );
}
