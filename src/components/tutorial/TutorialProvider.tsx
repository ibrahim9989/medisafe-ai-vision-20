
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from "@/contexts/AuthContext";

interface TutorialContextValue {
  isTutorialOpen: boolean;
  currentStep: number;
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  exitTutorial: (completed?: boolean) => void;
  resetTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextValue | undefined>(undefined);

const TUTORIAL_STORAGE_KEY = "medisafeai_tutorial_progress";
const TUTORIAL_NEWUSER_FLAG = "medisafeai_tutorial_newuser";

const TOTAL_STEPS = 6;

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { user, session, loading } = useAuth();
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check for new user registration timestamp
  useEffect(() => {
    if (loading) return;
    // Only check if logged in
    if (!user) return;

    // If tutorial was already completed, never auto-show
    const data = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (data === "completed") return;

    // Get last sign in timestamp & user creation time
    const createdAtString = user?.created_at ?? "";
    // Supabase user.created_at is in ISO8601 string (e.g. "2024-06-01T20:18:46.062185Z")
    const createdAt = createdAtString ? new Date(createdAtString).getTime() : 0;
    const now = Date.now();

    // Check if this user account was created within the last 3 minutes
    const NEW_USER_WINDOW_MS = 3 * 60 * 1000;

    if (
      createdAt &&
      now - createdAt < NEW_USER_WINDOW_MS &&
      !localStorage.getItem(TUTORIAL_NEWUSER_FLAG)
    ) {
      // Mark that we triggered new user tutorial, never again
      localStorage.setItem(TUTORIAL_NEWUSER_FLAG, "shown");
      setIsTutorialOpen(true);
      setCurrentStep(0);
    }
  }, [user, session, loading]);

  const startTutorial = () => {
    setCurrentStep(0);
    setIsTutorialOpen(true);
  };

  const nextStep = () => {
    setCurrentStep((step) => (step < TOTAL_STEPS - 1 ? step + 1 : step));
  };

  const prevStep = () => {
    setCurrentStep((step) => (step > 0 ? step - 1 : step));
  };

  const exitTutorial = (completed = false) => {
    setIsTutorialOpen(false);
    if (completed) {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, "completed");
    }
  };

  const resetTutorial = () => {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    setCurrentStep(0);
    setIsTutorialOpen(true);
  };

  return (
    <TutorialContext.Provider
      value={{
        isTutorialOpen,
        currentStep,
        startTutorial,
        nextStep,
        prevStep,
        exitTutorial,
        resetTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error("useTutorial must be used within TutorialProvider");
  return ctx;
}
