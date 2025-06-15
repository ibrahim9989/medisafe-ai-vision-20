
import React from "react";
import { useTutorial } from "./TutorialProvider";
import { Sparkles } from "lucide-react";

export default function TutorialHelpButton() {
  const { startTutorial, resetTutorial } = useTutorial();

  return (
    <div className="fixed bottom-6 right-6 z-[1010]">
      <button
        onClick={startTutorial}
        aria-label="Show tutorial"
        className="bg-gradient-to-br from-[#cb6ce6] to-[#9c4bc7] hover:from-[#b84fd9] hover:to-[#9c4bc7] text-white shadow-xl rounded-full p-3 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    </div>
  );
}
