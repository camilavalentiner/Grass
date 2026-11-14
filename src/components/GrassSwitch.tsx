"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GrassBackground, type GrassMode } from "./GrassBackground";

function Inner() {
  const sp = useSearchParams();
  const mode = (sp.get("grass") === "forward" ? "forward" : "retract") as GrassMode;
  return <GrassBackground mode={mode} />;
}
/** Lets us compare the two stroke directions with ?grass=forward while we decide. */
export function GrassSwitch() {
  return (
    <Suspense fallback={<GrassBackground />}>
      <Inner />
    </Suspense>
  );
}
