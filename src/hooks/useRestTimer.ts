"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseRestTimerOptions {
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

function getAudioContextClass(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ||
    null
  );
}

/** Triple bip net, pensé pour passer dans les écouteurs. */
function scheduleAlarm(ctx: AudioContext) {
  const now = ctx.currentTime;
  const pattern = [
    { at: 0, freq: 880, dur: 0.18 },
    { at: 0.28, freq: 880, dur: 0.18 },
    { at: 0.56, freq: 1175, dur: 0.35 },
  ];

  for (const { at, freq, dur } of pattern) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);

    const t0 = now + at;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.45, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
}

export function useRestTimer(options: UseRestTimerOptions = {}) {
  const { soundEnabled = true, vibrationEnabled = true } = options;
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const remainingRef = useRef(0);
  const soundEnabledRef = useRef(soundEnabled);
  const vibrationEnabledRef = useRef(vibrationEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    vibrationEnabledRef.current = vibrationEnabled;
  }, [vibrationEnabled]);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const ensureAudio = useCallback(async (): Promise<AudioContext | null> => {
    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // Ignore — will retry on play
      }
    }
    return ctx;
  }, []);

  /** Pendant le geste utilisateur (coche) pour autoriser le son iOS/Android. */
  const unlockAudio = useCallback(() => {
    void ensureAudio();
  }, [ensureAudio]);

  const playBeep = useCallback(async () => {
    if (!soundEnabledRef.current) return;
    try {
      const ctx = await ensureAudio();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      scheduleAlarm(ctx);
    } catch {
      // Audio not available
    }
  }, [ensureAudio]);

  const vibrate = useCallback(() => {
    if (!vibrationEnabledRef.current) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  }, []);

  const finishCountdown = useCallback(() => {
    clear();
    remainingRef.current = 0;
    setSecondsLeft(0);
    setIsRunning(false);
    void playBeep();
    vibrate();
  }, [clear, playBeep, vibrate]);

  const tick = useCallback(() => {
    if (remainingRef.current <= 1) {
      finishCountdown();
      return;
    }
    remainingRef.current -= 1;
    setSecondsLeft(remainingRef.current);
  }, [finishCountdown]);

  const start = useCallback(
    (seconds: number) => {
      unlockAudio();
      clear();
      remainingRef.current = seconds;
      setTotalSeconds(seconds);
      setSecondsLeft(seconds);
      setIsRunning(true);
      intervalRef.current = setInterval(tick, 1000);
    },
    [clear, unlockAudio, tick]
  );

  const pause = useCallback(() => {
    clear();
    setIsRunning(false);
  }, [clear]);

  const resume = useCallback(() => {
    if (remainingRef.current <= 0 || isRunning) return;
    unlockAudio();
    setIsRunning(true);
    intervalRef.current = setInterval(tick, 1000);
  }, [isRunning, unlockAudio, tick]);

  const stop = useCallback(() => {
    clear();
    remainingRef.current = 0;
    setIsRunning(false);
    setSecondsLeft(0);
    setTotalSeconds(0);
  }, [clear]);

  const addTime = useCallback((extra: number) => {
    remainingRef.current = Math.max(0, remainingRef.current + extra);
    setSecondsLeft(remainingRef.current);
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
