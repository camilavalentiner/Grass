"use client";
import { Illo, Ink, Wash, Face, SKIN, HAIR, DRESS, DRESS_DEEP } from "./Illo";

const PAL = { pink: "#f5c9d3", blue: "#bfd9ea", yellow: "#f7edb5", green: "#cfe3b6", lav: "#e6d6f0", white: "#fffdf7" };

/* ------------------------------------------------------------------ */
/* Reading in the big green armchair — a medium amount of work left.   */
/* ------------------------------------------------------------------ */
export function ReadingChair({ className }: { className?: string }) {
  return (
    <Illo className={className} title="Child reading in a big green armchair">
      {({ ink, wash }) => (
        <>
          <Wash filter={wash}>
            {/* chair */}
            <path d="M100 48 q0 -10 14 -10 h120 q14 0 14 10 v128 h-148 z" fill={PAL.green} />
            <path d="M72 118 q-6 0 -6 8 v40 q0 8 8 8 h190 q8 0 8 -8 v-40 q0 -8 -6 -8 h-26 v24 h-130 v-24 z" fill="#c2d9a4" />
            <ellipse cx="170" cy="158" rx="80" ry="10" fill="#b4ce95" />
            {/* bookshelf */}
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
            {/* picture frame */}
            <rect x="262" y="40" width="40" height="30" fill="#f3e2c6" />
            {/* child */}
            <path d="M152 92 q0 -16 15 -17 q16 0 17 16 q0 15 -16 16 q-16 0 -16 -15z" fill={SKIN} />
            <path d="M150 82 q8 -16 28 -10 q8 8 6 24 l6 30 q-2 8 -8 4 l-6 -26 q-12 6 -22 -2 z" fill={HAIR} />
            <path d="M150 114 h34 l6 36 h-46 z" fill={DRESS} />
            <path d="M156 128 h22 l3 22 h-28 z" fill={DRESS_DEEP} opacity=".5" />
            <ellipse cx="166" cy="156" rx="40" ry="9" fill={PAL.pink} />
            <path d="M136 141 q30 -10 60 0 l-2 10 q-28 -8 -56 0 z" fill="#fffdf7" />
            <path d="M151 150 l-24 30 l6 4 l24 -30 z M163 152 l-14 34 l7 2 l14 -34 z" fill={SKIN} />
          </Wash>
          <Ink filter={ink}>
            {/* shelf */}
            <path d="M18 30 v160 M62 30 v160 M18 66 h44 M18 106 h44 M18 146 h44 M18 186 h44" />
            <path d="M24 38 v26 M31 40 v26 M38 38 v26 M46 42 v22 M53 38 v26 M24 78 v26 M32 80 v26 M39 78 v26 M47 82 v22 M54 78 v26 M24 118 v26 M31 120 v26 M39 118 v26 M47 122 v22 M53 118 v26 M24 158 v26 M32 160 v26 M38 158 v26 M46 162 v22 M54 158 v26" />
            <path d="M262 40 h40 v30 h-40 z M268 46 h28 v18 h-28 z" />
            {/* chair line */}
            <path d="M102 50 q0 -12 14 -12 h120 q14 0 14 12 v70" />
            <path d="M74 120 q-8 0 -8 8 v38 q0 8 8 8 h192 q8 0 8 -8 v-38 q0 -8 -8 -8" />
            <path d="M74 120 q14 -2 26 2 v20 M266 120 q-14 -2 -26 2 v20 M100 142 h130" />
            <path d="M98 174 v16 q-6 4 -12 2 M250 174 v16 q6 4 12 2" />
            <path d="M120 62 q4 20 2 40 M230 70 q-2 20 2 36" opacity=".5" />
            {/* child */}
            <path d="M153 94 q-1 -16 14 -18 q17 0 17 16 q0 14 -15 15" />
            <path d="M150 84 q6 -14 26 -10 q10 6 7 22 M178 96 l8 34 M172 100 l6 32 M166 102 l4 26" />
            <Face x={166} y={92} mood="focus" dir={-1} />
            <path d="M152 114 q16 -4 34 0 l6 36 M150 116 l-4 34" />
            <path d="M138 142 q28 -10 56 0 M166 138 v12 M140 150 q26 -8 52 0" />
            <path d="M152 150 l-24 30 M164 152 l-14 34" />
            <path d="M122 182 q-10 2 -8 8 q6 2 14 -4 z M146 188 q-10 2 -8 8 q6 2 14 -4 z" fill="#fffdf7" />
            <path d="M128 158 q34 -12 60 0" opacity=".6" />
          </Ink>
        </>
      )}
    </Illo>
  );
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
            <ellipse cx="70" cy="48" rx="38" ry="14" fill={PAL.blue} opacity=".8" />
            <ellipse cx="250" cy="60" rx="46" ry="16" fill={PAL.blue} opacity=".8" />
            <path d="M-10 150 q80 -30 160 -10 q90 20 180 -8 v100 h-340 z" fill="#c9df9f" />
            <path d="M-10 175 q90 -16 170 -4 q90 12 180 -6 v70 h-350 z" fill="#b6d48a" opacity=".8" />
            {/* hair spread on the grass */}
            <path d="M80 146 q-26 -16 -42 -2 q-8 10 2 16 q-12 8 0 18 q8 6 20 -2 q-2 12 12 12 q4 -6 2 -14 z" fill={HAIR} opacity=".8" />
            <path d="M72 144 q-18 -14 -34 -2 M66 150 q-22 -2 -30 12 M64 160 q-20 4 -22 18 M70 170 q-12 10 -6 20" stroke={HAIR} strokeWidth="5" fill="none" strokeLinecap="round" opacity=".9" />
            <circle cx="84" cy="158" r="16" fill={SKIN} />
            <path d="M98 146 h78 l4 28 h-84 z" fill={DRESS} />
            <path d="M110 160 h60 l2 12 h-64 z" fill={DRESS_DEEP} opacity=".45" />
            {/* arms */}
            <path d="M102 150 l-28 -30 l6 -4 l30 30 z M118 150 l8 -34 l6 2 l-6 34 z" fill={SKIN} />
            {/* legs */}
            <path d="M180 152 l56 -10 l2 6 l-56 12 z M180 166 l62 2 v6 l-62 -2 z" fill={SKIN} />
          </Wash>
          <Ink filter={ink}>
            <path d="M34 48 q6 -16 30 -10 q14 -10 32 4 q16 2 10 14" opacity=".5" />
            <path d="M206 60 q8 -18 34 -12 q18 -12 40 6 q18 4 10 16" opacity=".5" />
            <path d="M-10 152 q80 -30 160 -10 q90 20 180 -8" opacity=".6" />
            {/* grass tufts */}
            {[20, 60, 140, 200, 270, 300].map((x) => (
              <path key={x} d={`M${x} 200 l3 -10 l3 10 l3 -12 l3 12 l3 -8 l3 8`} opacity=".7" />
            ))}
            {/* daisies in the grass */}
            {[[28, 198], [262, 206], [300, 186], [210, 204]].map(([x, y]) => (
              <g key={`${x}${y}`}>
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <ellipse key={a} cx={x + Math.cos((a * Math.PI) / 180) * 4} cy={y + Math.sin((a * Math.PI) / 180) * 4} rx="3" ry="1.6" transform={`rotate(${a} ${x + Math.cos((a * Math.PI) / 180) * 4} ${y + Math.sin((a * Math.PI) / 180) * 4})`} fill="#fffdf7" strokeWidth=".8" />
                ))}
                <circle cx={x} cy={y} r="2" fill="#f3d55b" strokeWidth=".8" />
              </g>
            ))}
            {/* head and hair */}
            <path d="M98 160 q-2 -16 -14 -18 q-16 0 -16 16 q0 14 14 16" />
            <path d="M78 146 q-30 -18 -44 -4 M72 150 q-26 -4 -36 12 M70 160 q-22 2 -26 20 M76 168 q-14 8 -8 22 M74 141 q-10 -12 -26 -10 M80 174 q-4 12 4 18" />
            <Face x={84} y={156} mood="grin" dir={1} />
            {/* body */}
            <path d="M98 146 h78 l4 28 h-84 M98 174 q40 -6 80 0" />
            <path d="M102 150 l-28 -30 q-6 -4 -10 2 M118 150 l8 -34 q2 -4 6 -2" />
            {/* daisy in hand */}
            <g>
              {[0, 51, 103, 154, 206, 257, 309].map((a) => (
                <ellipse key={a} cx={128 + Math.cos((a * Math.PI) / 180) * 6} cy={106 + Math.sin((a * Math.PI) / 180) * 6} rx="4.5" ry="2.4" transform={`rotate(${a} ${128 + Math.cos((a * Math.PI) / 180) * 6} ${106 + Math.sin((a * Math.PI) / 180) * 6})`} fill="#fffdf7" />
              ))}
              <circle cx="128" cy="106" r="3" fill="#f3d55b" />
            </g>
            {/* legs crossed */}
            <path d="M180 152 l56 -10 M180 166 l62 2" />
            <path d="M236 140 q10 -6 14 2 q-2 8 -14 6 z M242 164 q12 -4 14 4 q-2 8 -14 4 z" fill="#fffdf7" />
          </Ink>
        </>
      )}
    </Illo>
  );
}

/* ------------------------------------------------------------------ */
/* Sitting on a crate of books, surrounded by piles — a lot to do.      */
/* ------------------------------------------------------------------ */
function Pile({ x, base, n, lean = 0, w = 62 }: { x: number; base: number; n: number; lean?: number; w?: number }) {
  const cols = [PAL.pink, PAL.blue, PAL.yellow, PAL.green, PAL.white, PAL.lav];
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const y = base - (i + 1) * 11;
        const dx = Math.sin(i * 1.7) * 4 + (lean * i) / 2;
        return <rect key={i} x={x + dx} y={y} width={w - Math.abs(Math.cos(i * 2.1)) * 10} height="10" rx="2" fill={cols[(i + Math.round(x)) % cols.length]} />;
      })}
    </>
  );
}
function PileInk({ x, base, n, lean = 0, w = 62 }: { x: number; base: number; n: number; lean?: number; w?: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const y = base - (i + 1) * 11;
        const dx = Math.sin(i * 1.7) * 4 + (lean * i) / 2;
        const ww = w - Math.abs(Math.cos(i * 2.1)) * 10;
        return <path key={i} d={`M${x + dx} ${y} h${ww} v10 h-${ww} z M${x + dx + 3} ${y + 5} h${ww - 8}`} strokeWidth={i % 2 ? 1.4 : 1.1} />;
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
            <Pile x={16} base={200} n={9} lean={1} />
            <Pile x={78} base={200} n={5} w={50} />
            <Pile x={232} base={200} n={7} lean={-1} />
            <Pile x={286} base={200} n={4} w={44} />
            <rect x="296" y="190" width="30" height="10" rx="2" fill={PAL.pink} transform="rotate(-20 310 195)" />
            {/* crate of books */}
            <rect x="126" y="152" width="72" height="14" rx="2" fill={PAL.yellow} />
            <rect x="122" y="166" width="78" height="14" rx="2" fill={PAL.white} />
            <rect x="128" y="180" width="70" height="18" rx="2" fill={PAL.blue} />
            {/* child */}
            <path d="M160 86 q10 -18 30 -8 q10 10 4 26 l2 30 q-6 4 -8 -2 l-4 -26 q-14 6 -24 -4 z" fill={HAIR} />
            <path d="M150 100 q0 -16 15 -17 q16 0 17 16 q0 15 -16 16 q-16 0 -16 -15z" fill={SKIN} />
            <path d="M148 116 h34 l6 36 h-46 z" fill={DRESS} />
            <path d="M152 154 l-6 32 h8 l6 -32 z M170 154 l2 34 h8 l-2 -34 z" fill={SKIN} />
            <path d="M132 134 q30 -12 60 0 l-2 10 q-28 -8 -56 0 z" fill="#fffdf7" />
          </Wash>
          <Ink filter={ink}>
            <PileInk x={16} base={200} n={9} lean={1} />
            <PileInk x={78} base={200} n={5} w={50} />
            <PileInk x={232} base={200} n={7} lean={-1} />
            <PileInk x={286} base={200} n={4} w={44} />
            <path d="M126 152 h72 v14 h-72 z M122 166 h78 v14 h-78 z M128 180 h70 v18 h-70 z M130 159 h64 M126 173 h70 M132 189 h62" />
            {/* child */}
            <path d="M151 102 q-1 -16 14 -18 q17 0 17 16 q0 14 -15 15" />
            <path d="M158 88 q10 -16 32 -8 q8 8 4 24 M190 104 l4 32 M184 108 l2 30 M178 110 l0 24" />
            <Face x={163} y={100} mood="focus" dir={-1} />
            <path d="M150 116 q16 -4 34 0 l6 36 M148 118 l-2 34 M146 152 h44" />
            <path d="M152 154 l-6 32 M172 154 l2 34" />
            <path d="M142 186 q-10 2 -8 8 q6 2 14 -4 z M172 188 q-8 4 -4 9 q6 1 12 -5 z" fill="#fffdf7" />
            <path d="M134 135 q28 -10 56 0 M162 131 v12 M136 143 q26 -8 52 0" />
            <path d="M136 136 l10 -18 M190 136 l-6 -18" />
          </Ink>
        </>
      )}
    </Illo>
  );
}

/* ------------------------------------------------------------------ */
/* Jumping for joy — end of a study session.                            */
/* ------------------------------------------------------------------ */
function Star({ x, y, r = 6, fill = "#f3d55b" }: { x: number; y: number; r?: number; fill?: string }) {
  const p = Array.from({ length: 8 }).map((_, i) => {
    const a = (i * Math.PI) / 4, rr = i % 2 ? r * 0.42 : r;
    return `${x + Math.cos(a) * rr} ${y + Math.sin(a) * rr}`;
  });
  return <path d={`M${p.join(" L")} z`} fill={fill} />;
}
export function Celebrate({ className }: { className?: string }) {
  return (
    <Illo className={className} title="Child jumping for joy">
      {({ ink, wash }) => (
        <>
          <Wash filter={wash}>
            <ellipse cx="160" cy="204" rx="40" ry="6" fill="#c9df9f" />
            {[[60, 60, PAL.pink], [250, 48, PAL.blue], [90, 130, PAL.yellow], [240, 140, PAL.green], [40, 170, PAL.lav], [280, 100, PAL.pink], [120, 30, PAL.green]].map(([x, y, c], i) => (
              <rect key={i} x={x as number} y={y as number} width="10" height="5" fill={c as string} transform={`rotate(${i * 37} ${x} ${y})`} />
            ))}
            <Star x={100} y={70} r={8} />
            <Star x={226} y={90} r={10} />
            <Star x={70} y={120} r={6} />
            <Star x={260} y={40} r={7} />
            {/* hair flying up */}
            <path d="M146 62 q4 -26 20 -28 q18 0 20 26 q8 -14 4 -30 q-8 -16 -30 -10 q-20 4 -18 30 z" fill={HAIR} />
            <circle cx="160" cy="76" r="17" fill={SKIN} />
            <path d="M144 96 h34 l10 48 h-54 z" fill={DRESS} />
            <path d="M146 96 l-30 -40 l6 -4 l32 40 z M176 96 l32 -44 l6 4 l-30 44 z" fill={SKIN} />
            <path d="M144 144 l-12 24 l8 4 l14 -24 z M176 144 l14 26 l-8 4 l-16 -26 z" fill={SKIN} />
          </Wash>
          <Ink filter={ink}>
            <Star x={100} y={70} r={8} fill="none" />
            <Star x={226} y={90} r={10} fill="none" />
            <Star x={260} y={40} r={7} fill="none" />
            <path d="M176 70 q-2 -14 -16 -14 q-14 0 -16 14 q0 16 16 18 q14 -2 16 -16" />
            <path d="M146 64 q-2 -30 24 -32 M150 56 q0 -20 10 -26 M166 36 q12 -2 18 10 M178 60 q6 -14 0 -28" />
            <Face x={160} y={76} mood="open" dir={1} />
            <path d="M146 96 q16 -4 32 0 l10 48 h-54 z" />
            <path d="M146 96 l-30 -40 q-4 -6 2 -8 M178 96 l32 -44 q2 -6 8 -4" />
            <circle cx="113" cy="52" r="4" fill={SKIN} />
            <circle cx="213" cy="48" r="4" fill={SKIN} />
            <path d="M146 144 l-12 24 M178 144 l14 26" />
            <path d="M128 166 q-10 4 -8 10 q6 2 14 -6 z M196 170 q10 4 8 10 q-6 2 -14 -6 z" fill="#fffdf7" />
            <path d="M150 120 q10 -4 20 0" opacity=".5" />
          </Ink>
        </>
      )}
    </Illo>
  );
}

/* ------------------------------------------------------------------ */
/* A rabbit hiding behind a book — for quiet moments and empty states.  */
/* ------------------------------------------------------------------ */
export function RabbitReading({ className }: { className?: string }) {
  return (
    <Illo className={className} title="A rabbit reading a book in the grass" viewBox="0 0 220 220">
      {({ ink, wash }) => (
        <>
          <Wash filter={wash}>
            <path d="M14 198 q50 -14 100 -4 q50 10 96 -2 v30 h-196 z" fill="#c9df9f" />
            {/* body */}
            <path d="M74 150 q0 -40 40 -42 q42 2 42 44 q0 36 -40 38 q-42 -2 -42 -40 z" fill="#fffdf7" />
            <path d="M122 110 q30 6 32 44 q-2 26 -20 34 q6 -40 -12 -78 z" fill="#b8835a" opacity=".9" />
            {/* head */}
            <circle cx="112" cy="96" r="22" fill="#fffdf7" />
            <path d="M118 78 q4 -12 10 -14 q-8 10 -10 14 z" fill="#b8835a" opacity=".8" />
            {/* ears */}
            <path d="M124 80 q4 -40 20 -46 q10 0 6 16 q-6 22 -22 34 z" fill="#fffdf7" />
            <path d="M128 80 q4 -32 16 -40 q6 0 3 12 q-5 18 -17 28 z" fill="#f2bdb6" opacity=".8" />
            <path d="M100 76 q-12 -36 -2 -46 q10 -4 12 12 q2 20 -6 36 z" fill="#b8835a" />
            {/* tail, feet */}
            <circle cx="154" cy="178" r="10" fill="#fffdf7" />
            <ellipse cx="86" cy="192" rx="15" ry="6" fill="#fffdf7" />
            <ellipse cx="132" cy="194" rx="15" ry="6" fill="#fffdf7" />
            {/* book, held up in front of the face */}
            <path d="M58 68 l56 -10 l8 48 l-56 12 z" fill="#fbf4d0" />
            <path d="M60 70 l54 -9 l2 12 l-54 11 z" fill="#cfe3b6" />
            <path d="M74 86 l30 -6 M76 94 l30 -6 M78 102 l24 -5" stroke="#8fa37a" strokeWidth="1.2" fill="none" />
            {/* little yellow flowers */}
            {[[30, 150], [42, 162], [24, 168], [36, 176]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="4" fill="#f3d55b" />)}
          </Wash>
          <Ink filter={ink}>
            <path d="M14 198 q50 -14 100 -4 q50 10 96 -2" opacity=".6" />
            <path d="M76 160 q-4 -46 38 -50 q44 2 42 46 q-2 32 -36 36 q-30 2 -40 -20" />
            <path d="M122 112 q30 6 32 44 q-2 22 -16 30" opacity=".6" />
            <path d="M98 108 q-8 -24 14 -32 q22 -4 24 20 q0 12 -8 18" />
            <path d="M124 80 q4 -40 20 -46 q10 0 6 16 q-6 22 -22 34 M100 76 q-12 -36 -2 -46 q10 -4 12 12 q2 20 -6 36" />
            <path d="M138 44 q-6 10 -8 22 M104 48 q2 10 2 22" opacity=".5" />
            <circle cx="154" cy="178" r="10" />
            <path d="M72 190 q14 -8 28 0 q-6 10 -28 0 z M118 192 q14 -8 28 0 q-6 10 -28 0 z" />
            <path d="M58 68 l56 -10 l8 48 l-56 12 z M60 70 q26 -2 54 -9 M62 72 l8 46" />
            <path d="M70 118 l-6 -8 M120 108 l8 -12" />
            <path d="M30 186 q2 -20 0 -36 M42 190 q0 -16 0 -28 M24 184 q-2 -8 0 -16 M36 192 q0 -10 0 -16" />
            {[18, 56, 160, 192].map((x) => <path key={x} d={`M${x} 200 l3 -10 l3 10 l3 -12 l3 12`} opacity=".7" />)}
          </Ink>
        </>
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
