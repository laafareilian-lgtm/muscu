"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseRestTimerOptions {
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export function useRestTimer(options: UseRestTimerOptions = {}) {
  const { soundEnabled = true, vibrationEnabled = true } = options;
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);

      // Second beep
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1100;
        osc2.type = "sine";
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.5);
      }, 200);
    } catch {
      // Audio not available
    }
  }, [soundEnabled]);

  const vibrate = useCallback(() => {
    if (!vibrationEnabled) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  }, [vibrationEnabled]);

  const start = useCallback(
    (seconds: number) => {
      clear();
      setTotalSeconds(seconds);
      setSecondsLeft(seconds);
      setIsRunning(true);

      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clear();
            setIsRunning(false);
            playBeep();
            vibrate();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clear, playBeep, vibrate]
  );

  const pause = useCallback(() => {
    clear();
    setIsRunning(false);
  }, [clear]);

  const resume = useCallback(() => {
    if (secondsLeft <= 0 || isRunning) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clear();
          setIsRunning(false);
          playBeep();
          vibrate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [secondsLeft, isRunning, clear, playBeep, vibrate]);

  const stop = useCallback(() => {
    clear();
    setIsRunning(false);
    setSecondsLeft(0);
    setTotalSeconds(0);
  }, [clear]);

  const addTime = useCallback((extra: number) => {
    setSecondsLeft((prev) => Math.max(0, prev + extra));
    setTotalSeconds((prev) => Math.max(0, prev + extra));
  }, []);

  useEffect(() => () => clear(), [clear]);

  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;

  return {
    secondsLeft,
    totalSeconds,
    isRunning,
    isActive: secondsLeft > 0 || isRunning,
    progress,
    start,
    pause,
    resume,
    stop,
    addTime,
  };
}
