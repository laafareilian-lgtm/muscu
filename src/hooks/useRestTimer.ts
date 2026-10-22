"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ensureNotificationPermission,
  showRestDoneNotification,
} from "@/lib/notify";

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
    { at: 1.0, freq: 1175, dur: 0.4 },
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
    gain.gain.exponentialRampToValueAtTime(0.5, t0 + 0.02);
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
  const keepAliveRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const endsAtRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const soundEnabledRef = useRef(soundEnabled);
  const vibrationEnabledRef = useRef(vibrationEnabled);
  const isRunningRef = useRef(false);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    vibrationEnabledRef.current = vibrationEnabled;
  }, [vibrationEnabled]);

  const clearIntervalOnly = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      try {
        keepAliveRef.current.osc.stop();
      } catch {
        // already stopped
      }
      try {
        keepAliveRef.current.osc.disconnect();
        keepAliveRef.current.gain.disconnect();
      } catch {
        // ignore
      }
      keepAliveRef.current = null;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    const lock = wakeLockRef.current;
    wakeLockRef.current = null;
    if (lock) {
      try {
        await lock.release();
      } catch {
        // ignore
      }
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    try {
      await releaseWakeLock();
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      wakeLockRef.current.addEventListener("release", () => {
        wakeLockRef.current = null;
      });
    } catch {
      // Permission / battery / unsupported
    }
  }, [releaseWakeLock]);

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
        // ignore
      }
    }
    return ctx;
  }, []);

  const startKeepAlive = useCallback(async () => {
    stopKeepAlive();
    const ctx = await ensureAudio();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      // Quasi inaudible : garde la session audio active (Android / certains iOS)
      gain.gain.value = 0.00001;
      osc.frequency.value = 40;
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      keepAliveRef.current = { osc, gain };
    } catch {
      // ignore
    }
  }, [ensureAudio, stopKeepAlive]);

  const unlockAudio = useCallback(() => {
    void ensureAudio();
  }, [ensureAudio]);

  const playBeep = useCallback(async () => {
    if (!soundEnabledRef.current) return;
    try {
      const ctx = await ensureAudio();
      if (!ctx) return;
      if (ctx.state === "suspended") await ctx.resume();
      scheduleAlarm(ctx);
    } catch {
      // ignore
    }
  }, [ensureAudio]);

  const vibrate = useCallback(() => {
    if (!vibrationEnabledRef.current) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  }, []);

  const finishCountdown = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearIntervalOnly();
    stopKeepAlive();
    void releaseWakeLock();
    endsAtRef.current = null;
    isRunningRef.current = false;
    setSecondsLeft(0);
    setIsRunning(false);
    void playBeep();
    vibrate();
    void showRestDoneNotification();
  }, [clearIntervalOnly, stopKeepAlive, releaseWakeLock, playBeep, vibrate]);

  const syncFromClock = useCallback(() => {
    if (endsAtRef.current == null || finishedRef.current) return;
    const left = Math.ceil((endsAtRef.current - Date.now()) / 1000);
    if (left <= 0) {
      finishCountdown();
      return;
    }
    setSecondsLeft(left);
  }, [finishCountdown]);

  const startTicking = useCallback(() => {
    clearIntervalOnly();
    syncFromClock();
    intervalRef.current = setInterval(syncFromClock, 250);
  }, [clearIntervalOnly, syncFromClock]);

  const start = useCallback(
    (seconds: number) => {
      finishedRef.current = false;
      unlockAudio();
      void ensureNotificationPermission();
      void requestWakeLock();
      void startKeepAlive();

      clearIntervalOnly();
      endsAtRef.current = Date.now() + seconds * 1000;
      isRunningRef.current = true;
      setTotalSeconds(seconds);
      setSecondsLeft(seconds);
      setIsRunning(true);
      startTicking();
    },
    [
      unlockAudio,
      requestWakeLock,
      startKeepAlive,
      clearIntervalOnly,
      startTicking,
    ]
  );

  const pause = useCallback(() => {
    if (endsAtRef.current != null) {
      const left = Math.max(0, Math.ceil((endsAtRef.current - Date.now()) / 1000));
      endsAtRef.current = null;
      setSecondsLeft(left);
    }
    clearIntervalOnly();
    stopKeepAlive();
    void releaseWakeLock();
    isRunningRef.current = false;
    setIsRunning(false);
  }, [clearIntervalOnly, stopKeepAlive, releaseWakeLock]);

  const resume = useCallback(() => {
    if (isRunningRef.current || secondsLeft <= 0) return;
    finishedRef.current = false;
    unlockAudio();
    void requestWakeLock();
    void startKeepAlive();
    endsAtRef.current = Date.now() + secondsLeft * 1000;
    isRunningRef.current = true;
    setIsRunning(true);
    startTicking();
  }, [secondsLeft, unlockAudio, requestWakeLock, startKeepAlive, startTicking]);

  const stop = useCallback(() => {
    finishedRef.current = true;
    clearIntervalOnly();
    stopKeepAlive();
    void releaseWakeLock();
    endsAtRef.current = null;
    isRunningRef.current = false;
    setIsRunning(false);
    setSecondsLeft(0);
    setTotalSeconds(0);
  }, [clearIntervalOnly, stopKeepAlive, releaseWakeLock]);

  const addTime = useCallback((extra: number) => {
    if (endsAtRef.current != null) {
      endsAtRef.current += extra * 1000;
      const left = Math.max(0, Math.ceil((endsAtRef.current - Date.now()) / 1000));
      setSecondsLeft(left);
    } else {
      setSecondsLeft((prev) => Math.max(0, prev + extra));
    }
    setTotalSeconds((prev) => Math.max(0, prev + extra));
  }, []);

  // Reprendre le wake lock + rattraper le timer à la sortie de veille / retour sur l'app
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (endsAtRef.current != null && !finishedRef.current) {
        syncFromClock();
        if (isRunningRef.current) {
          void requestWakeLock();
          void startKeepAlive();
        }
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("pageshow", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("pageshow", onVisible);
    };
  }, [syncFromClock, requestWakeLock, startKeepAlive]);

  useEffect(
    () => () => {
      clearIntervalOnly();
      stopKeepAlive();
      void releaseWakeLock();
    },
    [clearIntervalOnly, stopKeepAlive, releaseWakeLock]
  );

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
