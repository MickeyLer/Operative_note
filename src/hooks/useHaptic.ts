"use client";

import { useCallback } from "react";

export function useHaptic() {
  const vibrate = useCallback((duration: number | number[] = 10) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(duration);
    }
  }, []);

  const triggerLight = useCallback(() => vibrate(10), [vibrate]);
  const triggerMedium = useCallback(() => vibrate(20), [vibrate]);
  const triggerHeavy = useCallback(() => vibrate(30), [vibrate]);
  const triggerSuccess = useCallback(() => vibrate([10, 50, 20]), [vibrate]);
  const triggerError = useCallback(() => vibrate([20, 50, 20, 50, 30]), [vibrate]);

  return {
    vibrate,
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSuccess,
    triggerError,
  };
}
