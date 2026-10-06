"use client";

import { useEffect, useRef } from "react";

const LOG_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function formatUptime(ms: number): string {
  const mins = Math.floor(ms / 60_000);
  const hours = Math.floor(mins / 60);
  if (hours > 0) return `${hours}h ${mins % 60}m`;
  return `${mins}m`;
}

export function DevHeartbeat() {
  const startRef = useRef(0);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    startRef.current = Date.now();

    const log = () => {
      const uptime = Date.now() - startRef.current;
      console.log(
        `[CMS heartbeat] session=${formatUptime(uptime)} path=${window.location.pathname} query=${window.location.search || "(none)"}`
      );
    };

    const id = setInterval(log, LOG_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}
