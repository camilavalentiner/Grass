"use client";
import Image from "next/image";
import readingBooks from "../../../public/illustrations/reading-books.png";
import readingChair from "../../../public/illustrations/reading-chair.png";
import relaxed from "../../../public/illustrations/relaxed.png";
import celebrate from "../../../public/illustrations/celebrate.png";
import overwhelmed from "../../../public/illustrations/overwhelmed.png";

export type SceneKind = "reading-books" | "reading-chair" | "relaxed" | "celebrate" | "overwhelmed";

const SCENES: Record<SceneKind, { src: typeof readingBooks; alt: string }> = {
  "reading-books": { src: readingBooks, alt: "A girl reading on a pile of books" },
  "reading-chair": { src: readingChair, alt: "A girl reading in a big green armchair" },
  relaxed: { src: relaxed, alt: "A girl lying back on a bed, arms out" },
  celebrate: { src: celebrate, alt: "Two figures leaping through the air among flying sweets" },
  overwhelmed: { src: overwhelmed, alt: "A girl tumbling through tall grass, plaits flying" },
};

/** One of the five illustrations, shown as supplied. */
export function Scene({ kind, className, priority }: { kind: SceneKind; className?: string; priority?: boolean }) {
  const s = SCENES[kind];
  return (
    <div className={className}>
      <Image src={s.src} alt={s.alt} priority={priority} sizes="(max-width: 480px) 90vw, 420px" className="w-full h-auto" />
    </div>
  );
}

/**
 * Picks a scene by how much work is left (0..1 of total effort).
 * Two reading scenes exist; they alternate by day so the home page does not feel static.
 */
export function sceneForLoad(load: number, day = new Date()): SceneKind {
  if (load < 0.25) return "relaxed";
  if (load < 0.6) return day.getDate() % 2 ? "reading-books" : "reading-chair";
  return "overwhelmed";
}

export function MoodScene({ load, className, day }: { load: number; className?: string; day?: Date }) {
  return <Scene kind={sceneForLoad(load, day)} className={className} priority />;
}
