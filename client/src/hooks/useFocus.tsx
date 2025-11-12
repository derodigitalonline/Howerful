import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { FocusPhase, FocusSession, FocusSettings } from "@shared/schema";
import { useDailySpread } from "./useDailySpread";

const STORAGE_KEY = "howerful-focus-state";
const SETTINGS_KEY = "howerful-focus-settings";

interface FocusState {
  activeItemId: string | null;
  activeItemText: string | null;
  phase: FocusPhase;
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  sessionStartedAt: number | null;
  workSessionsCompleted: number; // For tracking long break intervals
  currentSessionId: string | null;
}

interface FocusContextType {
  // State
  activeItemId: string | null;
  activeItemText: string | null;
  phase: FocusPhase;
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  workSessionsCompleted: number;

  // Settings
  settings: FocusSettings;

  // Computed
  progress: number; // 0-100
  formattedTime: string; // HH:MM:SS

  // Actions
  startTimer: (itemId?: string, itemText?: string, customDuration?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  finishEarly: () => void;
  skipPhase: () => void;
  resetTimer: () => void;
  updateSettings: (settings: Partial<FocusSettings>) => void;

  // Session history
  sessions: FocusSession[];
  getTodaysSessions: () => FocusSession[];
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

const DEFAULT_SETTINGS: FocusSettings = {
  workDuration: 25 * 60, // 25 minutes
  shortBreakDuration: 5 * 60, // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  longBreakInterval: 4, // Long break after 4 work sessions
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
  notificationsEnabled: true,
};

const INITIAL_STATE: FocusState = {
  activeItemId: null,
  activeItemText: null,
  phase: 'work',
  remainingSeconds: DEFAULT_SETTINGS.workDuration,
  totalSeconds: DEFAULT_SETTINGS.workDuration,
  isRunning: false,
  isPaused: false,
  sessionStartedAt: null,
  workSessionsCompleted: 0,
  currentSessionId: null,
};

export function FocusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FocusState>(INITIAL_STATE);
  const [settings, setSettings] = useState<FocusSettings>(DEFAULT_SETTINGS);
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  const { updateItem, items: allItems } = useDailySpread();

  // Helper to get item by ID
  const getItemById = useCallback((id: string) => {
    return allItems.find((item) => item.id === id);
  }, [allItems]);

  // Load state and settings from localStorage on mount
  useEffect(() => {
    const storedState = localStorage.getItem(STORAGE_KEY);
    const storedSettings = localStorage.getItem(SETTINGS_KEY);

    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        console.error("Failed to parse focus settings", e);
      }
    }

    if (storedState) {
      try {
        const parsed = JSON.parse(storedState);

        // If there was a running timer, calculate elapsed time
        if (parsed.isRunning && parsed.sessionStartedAt) {
          const now = Date.now();
          const elapsed = Math.floor((now - parsed.sessionStartedAt) / 1000);
          const newRemaining = Math.max(0, parsed.remainingSeconds - elapsed);

          if (newRemaining > 0) {
            // Timer still has time left, resume it
            setState({
              ...parsed,
              remainingSeconds: newRemaining,
              sessionStartedAt: now - ((parsed.remainingSeconds - newRemaining) * 1000),
            });
          } else {
            // Timer completed while away, reset to initial state
            setState(INITIAL_STATE);
          }
        } else {
          setState(parsed);
        }
      } catch (e) {
        console.error("Failed to parse focus state", e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Timer countdown effect
  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      setState((prev) => {
        const newRemaining = prev.remainingSeconds - 1;

        if (newRemaining <= 0) {
          // Timer completed!
          handleTimerComplete(prev);
          return {
            ...prev,
            remainingSeconds: 0,
            isRunning: false,
          };
        }

        return {
          ...prev,
          remainingSeconds: newRemaining,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning]);

  // Handle timer completion
  const handleTimerComplete = useCallback((currentState: FocusState) => {
    // Play sound if enabled
    if (settings.soundEnabled) {
      playCompletionSound();
    }

    // Show notification if enabled
    if (settings.notificationsEnabled) {
      showNotification(currentState.phase);
    }

    // Save session to history
    if (currentState.currentSessionId) {
      const completedSession: FocusSession = {
        id: currentState.currentSessionId,
        itemId: currentState.activeItemId || undefined,
        itemText: currentState.activeItemText || undefined,
        phase: currentState.phase,
        targetDuration: currentState.totalSeconds,
        actualDuration: currentState.totalSeconds,
        startedAt: currentState.sessionStartedAt || Date.now(),
        completedAt: Date.now(),
        wasInterrupted: false,
        wasCompleted: true,
      };

      setSessions((prev) => [...prev, completedSession]);
    }

    // Auto-complete task if it's a work session with an active item
    if (currentState.phase === 'work' && currentState.activeItemId) {
      const item = getItemById(currentState.activeItemId);
      if (item && item.type === 'task' && !item.completed) {
        // Toggle completion through useDailySpread
        // This will be handled by the parent component that has access to toggleItemCompletion
      }

      // Update focus state on the item
      updateItem(currentState.activeItemId, {
        focusState: 'completed',
        focusCompletedAt: Date.now(),
        pomodorosCompleted: (item?.pomodorosCompleted || 0) + 1,
      });
    }

    // Determine next phase
    let nextPhase: FocusPhase = 'work';
    let nextDuration = settings.workDuration;
    let newWorkSessionsCompleted = currentState.workSessionsCompleted;

    if (currentState.phase === 'work') {
      newWorkSessionsCompleted++;

      // Decide between short break and long break
      if (newWorkSessionsCompleted % settings.longBreakInterval === 0) {
        nextPhase = 'longBreak';
        nextDuration = settings.longBreakDuration;
      } else {
        nextPhase = 'shortBreak';
        nextDuration = settings.shortBreakDuration;
      }

      // Auto-start break if enabled
      if (settings.autoStartBreaks) {
        setState((prev) => ({
          ...prev,
          phase: nextPhase,
          remainingSeconds: nextDuration,
          totalSeconds: nextDuration,
          isRunning: true,
          sessionStartedAt: Date.now(),
          workSessionsCompleted: newWorkSessionsCompleted,
          currentSessionId: crypto.randomUUID(),
        }));
        return;
      }
    } else {
      // Break ended, next is work
      nextPhase = 'work';
      nextDuration = settings.workDuration;

      // Auto-start work if enabled
      if (settings.autoStartWork) {
        setState((prev) => ({
          ...prev,
          phase: nextPhase,
          remainingSeconds: nextDuration,
          totalSeconds: nextDuration,
          isRunning: true,
          sessionStartedAt: Date.now(),
          workSessionsCompleted: newWorkSessionsCompleted,
          currentSessionId: crypto.randomUUID(),
        }));
        return;
      }
    }

    // If not auto-starting, just reset to ready state
    setState((prev) => ({
      ...prev,
      phase: nextPhase,
      remainingSeconds: nextDuration,
      totalSeconds: nextDuration,
      isRunning: false,
      isPaused: false,
      sessionStartedAt: null,
      workSessionsCompleted: newWorkSessionsCompleted,
      activeItemId: nextPhase === 'work' ? prev.activeItemId : null,
      activeItemText: nextPhase === 'work' ? prev.activeItemText : null,
      currentSessionId: null,
    }));
  }, [settings, updateItem, getItemById]);

  // Play completion sound
  const playCompletionSound = () => {
    // TODO: Add audio file and play it
    // const audio = new Audio('/assets/sounds/timer-complete.mp3');
    // audio.play();
  };

  // Show browser notification
  const showNotification = (phase: FocusPhase) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = phase === 'work' ? 'Focus Session Complete!' : 'Break Time Over!';
      const body = phase === 'work'
        ? 'Great work! Time for a break.'
        : 'Break\'s over. Ready to focus?';

      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  };

  // Start timer
  const startTimer = useCallback((itemId?: string, itemText?: string, customDuration?: number) => {
    const duration = customDuration || settings.workDuration;
    const sessionId = crypto.randomUUID();

    setState({
      activeItemId: itemId || null,
      activeItemText: itemText || null,
      phase: 'work',
      remainingSeconds: duration,
      totalSeconds: duration,
      isRunning: true,
      isPaused: false,
      sessionStartedAt: Date.now(),
      workSessionsCompleted: state.workSessionsCompleted,
      currentSessionId: sessionId,
    });

    // Update item's focus state if provided
    if (itemId) {
      updateItem(itemId, {
        focusState: 'active',
        focusStartedAt: Date.now(),
      });
    }

    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [settings, state.workSessionsCompleted, updateItem]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: true,
    }));
  }, []);

  // Resume timer
  const resumeTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      sessionStartedAt: Date.now() - ((prev.totalSeconds - prev.remainingSeconds) * 1000),
    }));
  }, []);

  // Finish early
  const finishEarly = useCallback(() => {
    if (!state.currentSessionId) return;

    // Save session as interrupted
    const interruptedSession: FocusSession = {
      id: state.currentSessionId,
      itemId: state.activeItemId || undefined,
      itemText: state.activeItemText || undefined,
      phase: state.phase,
      targetDuration: state.totalSeconds,
      actualDuration: state.totalSeconds - state.remainingSeconds,
      startedAt: state.sessionStartedAt || Date.now(),
      completedAt: Date.now(),
      wasInterrupted: true,
      wasCompleted: false,
    };

    setSessions((prev) => [...prev, interruptedSession]);

    // Still mark as completed if it's a work session
    if (state.phase === 'work' && state.activeItemId) {
      const item = getItemById(state.activeItemId);

      updateItem(state.activeItemId, {
        focusState: 'completed',
        focusCompletedAt: Date.now(),
        pomodorosCompleted: (item?.pomodorosCompleted || 0) + 1,
      });
    }

    // Reset to initial state
    setState(INITIAL_STATE);
  }, [state, updateItem, getItemById]);

  // Skip phase
  const skipPhase = useCallback(() => {
    handleTimerComplete(state);
  }, [state, handleTimerComplete]);

  // Reset timer
  const resetTimer = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<FocusSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Get today's sessions
  const getTodaysSessions = useCallback(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startTimestamp = startOfDay.getTime();

    return sessions.filter((session) => session.startedAt >= startTimestamp);
  }, [sessions]);

  // Format time as HH:MM:SS or MM:SS
  const formattedTime = formatSeconds(state.remainingSeconds);

  // Calculate progress (0-100)
  const progress = state.totalSeconds > 0
    ? ((state.totalSeconds - state.remainingSeconds) / state.totalSeconds) * 100
    : 0;

  const value: FocusContextType = {
    // State
    activeItemId: state.activeItemId,
    activeItemText: state.activeItemText,
    phase: state.phase,
    remainingSeconds: state.remainingSeconds,
    totalSeconds: state.totalSeconds,
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    workSessionsCompleted: state.workSessionsCompleted,

    // Settings
    settings,

    // Computed
    progress,
    formattedTime,

    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    finishEarly,
    skipPhase,
    resetTimer,
    updateSettings,

    // Session history
    sessions,
    getTodaysSessions,
  };

  return (
    <FocusContext.Provider value={value}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error("useFocus must be used within a FocusProvider");
  }
  return context;
}

// Helper function to format seconds as HH:MM:SS or MM:SS
function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
