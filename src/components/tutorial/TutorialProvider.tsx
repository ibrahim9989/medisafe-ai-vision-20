
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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

const TOTAL_STEPS = 6;

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check localStorage for completion
  useEffect(() => {
    const data = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!data) setIsTutorialOpen(true); // first visit = show tutorial
  }, []);

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
