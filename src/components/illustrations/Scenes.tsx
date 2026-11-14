"use client";
import { Illo, Ink, Wash, INK, HAIR } from "./Illo";
import { Arm, Daisy, Head, Leg, OpenBook, Pinafore, PINAFORE } from "./Kid";

const PAL = { pink: "#f5c9d3", blue: "#bfd9ea", yellow: "#f7edb5", green: "#cfe3b6", lav: "#e6d6f0", white: "#fffdf7" };

function GrassTufts({ xs, y = 200 }: { xs: number[]; y?: number }) {
  return <>{xs.map((x) => <path key={x} d={`M${x} ${y} l3 -10 l3 10 l3 -12 l3 12 l3 -8 l3 8`} opacity=".7" />)}</>;
}

/* ------------------------------------------------------------------ */
/* Lying in the grass with a daisy — little to nothing left to do.      */
/* ------------------------------------------------------------------ */
export function Carefree({ className }: { className?: string }) {
  return (
    <Illo className={className} title="Child lying happily in the grass">
      {({ ink, wash }) => (
        <>
          <Wash filter={wash}>
            <g className="ani-drift"><ellipse cx="60" cy="44" rx="40" ry="14" fill={PAL.blue} opacity=".8" /></g>
            <g className="ani-drift" style={{ animationDelay: "-7s" }}><ellipse cx="250" cy="58" rx="48" ry="16" fill={PAL.blue} opacity=".8" /></g>
            <path d="M-10 148 q80 -30 160 -10 q90 20 180 -8 v100 h-340 z" fill="#c9df9f" />
            <path d="M-10 176 q90 -16 170 -4 q90 12 180 -6 v70 h-350 z" fill="#b6d48a" opacity=".8" />
          </Wash>
          <Ink filter={ink}>
            <path d="M28 44 q6 -16 30 -10 q14 -10 32 4 q16 2 10 14" opacity=".45" />
            <path d="M206 58 q8 -18 34 -12 q18 -12 40 6 q18 4 10 16" opacity=".45" />
            <path d="M-10 150 q80 -30 160 -10 q90 20 180 -8" opacity=".55" />
            <GrassTufts xs={[14, 44, 250, 284, 306]} y={196} />
            <GrassTufts xs={[26, 230, 270]} y={212} />
            <Daisy x={30} y={190} r={4} />
            <Daisy x={262} y={204} r={4} />
            <Daisy x={298} y={184} r={3.5} />
            {/* body first, then limbs, then head so the hair sits on top */}
            <Pinafore x={100} y={150} rotate={-90} skirt={30} flare={8} />
            {/* back arm resting on the grass above the head */}
            <Arm pts={[[104, 141], [86, 122], [64, 118]]} />
            {/* straight leg and a bent, bobbing leg */}
            <Leg pts={[[130, 146], [168, 142], [206, 144]]} foot={1} />
            <g className="ani-swing" style={{ transformOrigin: "130px 158px", animationDuration: "3.4s" }}>
              <Leg pts={[[130, 158], [166, 128], [194, 146]]} foot={1} />
            </g>
            <Head x={84} y={150} dir={1} rotate={-90} mood="grin" pony="side" />
            {/* front arm raised to the sky, holding a daisy, swaying */}
            <g className="ani-sway" style={{ transformOrigin: "104px 160px", animationDuration: "4.2s" }}>
              <Arm pts={[[104, 160], [122, 136], [128, 114]]} />
              <path d="M128 112 v-10" stroke="#6f9e46" strokeWidth="1.6" />
              <Daisy x={128} y={98} r={6} />
            </g>
          </Ink>
        </>
      )}
    </Illo>
  );
}

/* ------------------------------------------------------------------ */
/* Reading in the big green armchair — a fair amount of work left.      */
/* ------------------------------------------------------------------ */
export function ReadingChair({ className }: { className?: string }) {
  return (
    <Illo className={className} title="Child reading in a big green armchair">
      {({ ink, wash }) => (
        <>
          <Wash filter={wash}>
            <path d="M100 48 q0 -10 14 -10 h120 q14 0 14 10 v128 h-148 z" fill={PAL.green} />
            <path d="M72 118 q-6 0 -6 8 v40 q0 8 8 8 h190 q8 0 8 -8 v-40 q0 -8 -6 -8 h-26 v24 h-130 v-24 z" fill="#c2d9a4" />
            <ellipse cx="170" cy="158" rx="80" ry="10" fill="#b4ce95" />
            <rect x="18" y="30" width="44" height="160" fill="#f1ebdb" />
            {[36, 76, 116, 156].map((y) => (
              <g key={y}>
                <rect x="22" y={y} width="7" height="30" fill={PAL.yellow} />
                <rect x="30" y={y + 2} width="6" height="28" fill={PAL.lav} />
                <rect x="37" y={y} width="8" height="30" fill={PAL.green} />
                <rect x="46" y={y + 3} width="5" height="27" fill={PAL.pink} />
                <rect x="52" y={y} width="7" height="30" fill={PAL.blue} />
              </g>
            ))}
            <rect x="262" y="40" width="40" height="30" fill="#f3e2c6" />
            <ellipse cx="166" cy="156" rx="40" ry="9" fill={PAL.pink} />
          </Wash>
          <Ink filter={ink}>
            <path d="M18 30 v160 M62 30 v160 M18 66 h44 M18 106 h44 M18 146 h44 M18 186 h44" />
            <path d="M24 38 v26 M31 40 v26 M38 38 v26 M46 42 v22 M53 38 v26 M24 78 v26 M32 80 v26 M39 78 v26 M47 82 v22 M54 78 v26 M24 118 v26 M31 120 v26 M39 118 v26 M47 122 v22 M53 118 v26 M24 158 v26 M32 160 v26 M38 158 v26 M46 162 v22 M54 158 v26" />
            <path d="M262 40 h40 v30 h-40 z M268 46 h28 v18 h-28 z" />
            <path d="M268 60 q6 -10 12 0 q4 -8 10 -2" opacity=".6" />
            <path d="M102 50 q0 -12 14 -12 h120 q14 0 14 12 v70" />
            <path d="M74 120 q-8 0 -8 8 v38 q0 8 8 8 h192 q8 0 8 -8 v-38 q0 -8 -8 -8" />
            <path d="M74 120 q14 -2 26 2 v20 M266 120 q-14 -2 -26 2 v20 M100 142 h130" />
            <path d="M98 174 v16 q-6 4 -12 2 M250 174 v16 q6 4 12 2" />
            <path d="M120 62 q4 20 2 40 M230 70 q-2 20 2 36" opacity=".45" />
            <path d="M128 158 q34 -12 60 0" opacity=".5" />
            {/* child, facing left, feet swinging */}
            <Pinafore x={166} y={112} skirt={24} flare={9} />
            <g className="ani-swing" style={{ transformOrigin: "154px 148px", animationDuration: "3s" }}>
              <Leg pts={[[154, 148], [134, 166], [122, 184]]} foot={-1} />
            </g>
            <g className="ani-swing" style={{ transformOrigin: "164px 150px", animationDuration: "3s", animationDelay: "-1.5s" }}>
              <Leg pts={[[164, 150], [146, 170], [138, 190]]} foot={-1} />
            </g>
            <OpenBook x={166} y={140} w={60} flip />
            <Arm pts={[[156, 114], [146, 130], [142, 142]]} />
            <Arm pts={[[176, 114], [188, 130], [190, 142]]} />
            <g className="ani-nod" style={{ transformOrigin: "166px 110px" }}>
              <Head x={166} y={96} dir={-1} rotate={-10} mood="calm" pony="down" />
            </g>
          </Ink>
        </>
      )}
    </Illo>
  );
}

/* ------------------------------------------------------------------ */
/* On a crate of books, surrounded by piles — a lot to do.              */
/* ------------------------------------------------------------------ */
const COLS = [PAL.pink, PAL.blue, PAL.yellow, PAL.green, PAL.white, PAL.lav];
function Pile({ x, base, n, lean = 0, w = 62, ink = false, wobbleTop = false }: { x: number; base: number; n: number; lean?: number; w?: number; ink?: boolean; wobbleTop?: boolean }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const y = base - (i + 1) * 11;
        const dx = Math.sin(i * 1.7) * 4 + (lean * i) / 2;
        const ww = w - Math.abs(Math.cos(i * 2.1)) * 10;
        const top = wobbleTop && i === n - 1;
        const el = ink ? (
          <path d={`M${x + dx} ${y} h${ww} v10 h-${ww} z M${x + dx + 3} ${y + 5} h${ww - 8}`} strokeWidth={i % 2 ? 1.4 : 1.1} />
        ) : (
          <rect x={x + dx} y={y} width={ww} height="10" rx="2" fill={COLS[(i + Math.round(x)) % COLS.length]} />
        );
        return top ? <g key={i} className="ani-wobble" style={{ transformOrigin: `${x + dx}px ${y + 10}px` }}>{el}</g> : <g key={i}>{el}</g>;
      })}
    </>
  );
}
export function BuriedInBooks({ className }: { className?: string }) {
  return (
    <Illo className={className} title="Child reading on top of a stack of books, surrounded by piles">
      {({ ink, wash }) => (
        <>
          <Wash filter={wash}>
            <ellipse cx="160" cy="200" rx="150" ry="10" fill="#e8e1c8" />
            <Pile x={16} base={200} n={9} lean={1} wobbleTop />
            <Pile x={78} base={200} n={5} w={50} />
            <Pile x={232} base={200} n={7} lean={-1} wobbleTop />
            <Pile x={286} base={200} n={4} w={44} />
            <rect x="126" y="152" width="72" height="14" rx="2" fill={PAL.yellow} />
            <rect x="122" y="166" width="78" height="14" rx="2" fill={PAL.white} />
            <rect x="128" y="180" width="70" height="18" rx="2" fill={PAL.blue} />
          </Wash>
          <Ink filter={ink}>
            <Pile x={16} base={200} n={9} lean={1} ink wobbleTop />
            <Pile x={78} base={200} n={5} w={50} ink />
            <Pile x={232} base={200} n={7} lean={-1} ink wobbleTop />
            <Pile x={286} base={200} n={4} w={44} ink />
            <path d="M126 152 h72 v14 h-72 z M122 166 h78 v14 h-78 z M128 180 h70 v18 h-70 z M130 159 h64 M126 173 h70 M132 189 h62" />
            {/* a pencil and a mug beside her */}
            <path d="M206 150 l22 -10 l3 4 l-22 10 z M228 140 l4 -2 l2 4 l-3 2 z" fill={PAL.yellow} />
            <path d="M92 150 h14 v-14 h-14 z M106 140 q6 0 6 5 q0 5 -6 5" fill="#fffdf7" />
            {/* child facing left, head bent over the book */}
            <Pinafore x={162} y={116} skirt={26} flare={8} />
            <Leg pts={[[152, 152], [150, 170], [148, 188]]} foot={-1} />
            <Leg pts={[[166, 154], [168, 172], [168, 190]]} foot={-1} />
            <g className="ani-bob" style={{ animationDuration: "3.8s" }}>
              <OpenBook x={160} y={138} w={58} flip />
              <Arm pts={[[152, 118], [140, 128], [136, 140]]} />
              <Arm pts={[[172, 118], [184, 128], [184, 140]]} />
              <Head x={162} y={100} dir={-1} rotate={-18} mood="focus" pony="down" />
            </g>
          </Ink>
        </>
      )}
    </Illo>
  );
}

/* ------------------------------------------------------------------ */
/* Jumping for joy — end of a study session.                            */
/* ------------------------------------------------------------------ */
function Star({ x, y, r = 6, fill = "#f3d55b", cls, delay = 0 }: { x: number; y: number; r?: number; fill?: string; cls?: string; delay?: number }) {
  const p = Array.from({ length: 8 }).map((_, i) => {
    const a = (i * Math.PI) / 4, rr = i % 2 ? r * 0.42 : r;
    return `${Math.round((x + Math.cos(a) * rr) * 100) / 100} ${Math.round((y + Math.sin(a) * rr) * 100) / 100}`;
  });
  return <path className={cls} style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${delay}s` }} d={`M${p.join(" L")} z`} fill={fill} stroke={INK} strokeWidth="1.2" />;
}
const CONFETTI: [number, number, string][] = [[60, 20, PAL.pink], [250, 10, PAL.blue], [90, 40, PAL.yellow], [240, 30, PAL.green], [40, 0, PAL.lav], [280, 20, PAL.pink], [120, 10, PAL.green], [200, 0, PAL.yellow], [160, 20, PAL.pink]];
export function Celebrate({ className }: { className?: string }) {
  return (
    <Illo className={className} title="Child jumping for joy">
      {({ ink, wash }) => (
        <>
          <Wash filter={wash}>
            <ellipse cx="160" cy="206" rx="44" ry="6" fill="#c9df9f" />
            {CONFETTI.map(([x, y, c], i) => (
              <rect key={i} className="ani-fall" style={{ animationDelay: `${-i * 0.6}s`, transformOrigin: `${x}px ${y}px` }} x={x} y={y} width="9" height="5" fill={c} />
            ))}
          </Wash>
          <Ink filter={ink}>
            <Star x={96} y={72} r={8} cls="ani-twinkle" />
            <Star x={228} y={92} r={10} cls="ani-twinkle" delay={-0.6} />
            <Star x={70} y={126} r={6} cls="ani-twinkle" delay={-1.2} />
            <Star x={262} y={44} r={7} cls="ani-twinkle" delay={-0.3} />
            <g className="ani-bounce">
              <Pinafore x={160} y={96} skirt={34} flare={12} />
              <Leg pts={[[150, 142], [136, 160], [128, 176]]} foot={-1} />
              <Leg pts={[[170, 142], [186, 160], [196, 174]]} foot={1} />
              <Arm pts={[[148, 98], [124, 74], [112, 50]]} />
              <Arm pts={[[172, 98], [196, 74], [210, 48]]} />
              <Head x={160} y={76} dir={1} rotate={-6} mood="joy" pony="up" />
            </g>
          </Ink>
        </>
      )}
    </Illo>
  );
}

/* ------------------------------------------------------------------ */
/* A rabbit hiding behind a book — quiet moments and empty states.      */
/* ------------------------------------------------------------------ */
export function RabbitReading({ className }: { className?: string }) {
  return (
    <Illo className={className} title="A rabbit reading a book in the grass" viewBox="0 0 220 220">
      {({ ink, wash }) => (
        <>
          <Wash filter={wash}>
            <path d="M14 198 q50 -14 100 -4 q50 10 96 -2 v30 h-196 z" fill="#c9df9f" />
            <path d="M74 150 q0 -40 40 -42 q42 2 42 44 q0 36 -40 38 q-42 -2 -42 -40 z" fill="#fffdf7" />
            <path d="M122 110 q30 6 32 44 q-2 26 -20 34 q6 -40 -12 -78 z" fill="#b8835a" opacity=".9" />
            <circle cx="112" cy="96" r="22" fill="#fffdf7" />
            <path d="M118 78 q4 -12 10 -14 q-8 10 -10 14 z" fill="#b8835a" opacity=".8" />
            <g className="ani-twitch" style={{ transformOrigin: "126px 80px" }}>
              <path d="M124 80 q4 -40 20 -46 q10 0 6 16 q-6 22 -22 34 z" fill="#fffdf7" />
              <path d="M128 80 q4 -32 16 -40 q6 0 3 12 q-5 18 -17 28 z" fill="#f2bdb6" opacity=".8" />
            </g>
            <path d="M100 76 q-12 -36 -2 -46 q10 -4 12 12 q2 20 -6 36 z" fill="#b8835a" />
            <g className="ani-wobble" style={{ transformOrigin: "154px 178px" }}><circle cx="154" cy="178" r="10" fill="#fffdf7" /></g>
            <ellipse cx="86" cy="192" rx="15" ry="6" fill="#fffdf7" />
            <ellipse cx="132" cy="194" rx="15" ry="6" fill="#fffdf7" />
            <g className="ani-bob" style={{ animationDuration: "4.4s" }}>
              <path d="M58 68 l56 -10 l8 48 l-56 12 z" fill="#fbf4d0" />
              <path d="M60 70 l54 -9 l2 12 l-54 11 z" fill="#cfe3b6" />
            </g>
            {[[30, 150], [42, 162], [24, 168], [36, 176]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="4" fill="#f3d55b" />)}
          </Wash>
          <Ink filter={ink}>
            <path d="M14 198 q50 -14 100 -4 q50 10 96 -2" opacity=".6" />
            <path d="M76 160 q-4 -46 38 -50 q44 2 42 46 q-2 32 -36 36 q-30 2 -40 -20" />
            <path d="M122 112 q30 6 32 44 q-2 22 -16 30" opacity=".6" />
            <path d="M98 108 q-8 -24 14 -32 q22 -4 24 20 q0 12 -8 18" />
            <g className="ani-twitch" style={{ transformOrigin: "126px 80px" }}>
              <path d="M124 80 q4 -40 20 -46 q10 0 6 16 q-6 22 -22 34" />
              <path d="M138 44 q-6 10 -8 22" opacity=".5" />
            </g>
            <path d="M100 76 q-12 -36 -2 -46 q10 -4 12 12 q2 20 -6 36 M104 48 q2 10 2 22" />
            <g className="ani-wobble" style={{ transformOrigin: "154px 178px" }}><circle cx="154" cy="178" r="10" /></g>
            <path d="M72 190 q14 -8 28 0 q-6 10 -28 0 z M118 192 q14 -8 28 0 q-6 10 -28 0 z" />
            <g className="ani-bob" style={{ animationDuration: "4.4s" }}>
              <path d="M58 68 l56 -10 l8 48 l-56 12 z M60 70 q26 -2 54 -9 M62 72 l8 46" />
              <path d="M74 86 l30 -6 M76 94 l30 -6 M78 102 l24 -5" stroke="#8fa37a" strokeWidth="1.1" />
            </g>
            <path d="M70 118 l-6 -8 M120 108 l8 -12" />
            <path d="M30 186 q2 -20 0 -36 M42 190 q0 -16 0 -28 M24 184 q-2 -8 0 -16 M36 192 q0 -10 0 -16" />
            <GrassTufts xs={[18, 56, 160, 192]} />
          </Ink>
        </>
      )}
    </Illo>
  );
}

/** Four heads for the style board: the expressions. */
export function Expressions({ className }: { className?: string }) {
  return (
    <Illo className={className} title="Expressions" viewBox="0 0 320 70">
      {({ ink }) => (
        <Ink filter={ink}>
          <Head x={40} y={36} mood="smile" />
          <Head x={120} y={36} mood="grin" pony="side" />
          <Head x={200} y={36} mood="focus" rotate={-10} dir={-1} />
          <Head x={280} y={36} mood="joy" pony="up" />
        </Ink>
      )}
    </Illo>
  );
}

/** Picks a scene by how much work is left (0..1 of total remaining effort). */
export function MoodScene({ load, className }: { load: number; className?: string }) {
  if (load < 0.25) return <Carefree className={className} />;
  if (load < 0.6) return <ReadingChair className={className} />;
  return <BuriedInBooks className={className} />;
}

export { PINAFORE, HAIR };
