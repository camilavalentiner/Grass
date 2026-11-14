"use client";
import { useEffect } from "react";
import { startSync } from "@/lib/sync";

/** Starts the background sync once the app is open in the browser. */
export function SyncAgent() {
  useEffect(() => { startSync(); }, []);
  return null;
}
