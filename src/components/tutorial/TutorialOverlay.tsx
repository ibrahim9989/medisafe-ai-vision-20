
import React from "react";
import { useTutorial } from "./TutorialProvider";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, FileText, Volume2, Sparkles, Download, CheckCircle } from "lucide-react";

const steps = [
  {
    title: "Welcome to MedVerse!",
    icon: <Sparkles className="mr-1 text-purple-500" />,
    description: (
      <>
        Control the app with your <strong>voice</strong>.<br />
        Let's take a <span className="bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] text-white px-1 rounded">1-minute tour</span>.
      </>
    ),
  },
  {
    title: "Voice AI Ready",
    icon: <MessageCircle className="mr-1 text-blue-500" />,
    description: (
      <>
        See the <b>AI Voice Status</b> at the top right of your screen.
        <br />
        When you see <b>"Voice Ready"</b>, you can speak commands such as <i>"Download PDF"</i>.
      </>
    ),
  },
  {
    title: "Switch Tabs by Voice or Click",
    icon: <FileText className="mr-1 text-green-500" />,
    description: (
      <>
        Quickly switch between <b>Prescription</b> and <b>Patient History</b> —<br />
        just say <i>"Switch to history"</i> or use the buttons above.
      </>
    ),
  },
  {
    title: "Try Out Voice Commands",
    icon: <Volume2 className="mr-1 text-violet-500" />,
    description: (
      <>
        Example:<br />
        <code className="bg-gray-100 rounded px-1">"Fill prescription for John Doe"</code>
        <br />Try it now or press the microphone button below!
      </>
    ),
  },
  {
    title: "Complete Forms Easily",
    icon: <Users className="mr-1 text-fuchsia-500" />,
    description: (
      <>
        Fill out <b>forms</b> with your voice, export PDFs, and manage all patient info on one screen.
      </>
    ),
  },
  {
    title: "You're all set!",
    icon: <CheckCircle className="mr-1 text-green-600" />,
    description: (
      <>
        Ask for help anytime via the <b>Tutorial</b> button at the bottom right.<br />
        <span className="text-green-600 font-semibold">Enjoy using MedVerse!</span>
      </>
    ),
  },
];

export default function TutorialOverlay() {
  const {
    isTutorialOpen,
    currentStep,
    nextStep,
    prevStep,
    exitTutorial,
  } = useTutorial();

  if (!isTutorialOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/30 flex items-center justify-center px-4 transition-opacity animate-fade-in">
      <div className="backdrop-blur-xl bg-white/85 dark:bg-gray-900/80 w-full max-w-md rounded-2xl border shadow-2xl relative p-6">
        <div className="flex items-center mb-1 text-lg font-semibold gap-1 animate-scale-in">
          {step.icon} {step.title}
        </div>
        <div className="mb-6 text-gray-700 dark:text-gray-300 text-base animate-fade-in">{step.description}</div>
        {/* Progress indicator */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <div className="flex-1 mx-2 h-2 flex bg-gray-200 rounded-full overflow-hidden">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-300 h-full ${i <= currentStep ? 'bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7]' : 'bg-gray-200'} flex-1`}
              />
            ))}
          </div>
          {!isLastStep ? (
            <Button
              variant="default"
              size="sm"
              className="rounded-full"
              onClick={nextStep}
              autoFocus
            >
              Next
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="rounded-full"
              onClick={() => exitTutorial(true)}
              autoFocus
            >
              Finish
            </Button>
          )}
        </div>
        {/* Skip/Close */}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-xs"
          onClick={() => exitTutorial(false)}
        >Skip</button>
      </div>
    </div>
  );
}
