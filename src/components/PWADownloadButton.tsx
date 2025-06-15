
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const PWADownloadButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler as any);

    // In case the app is already installed, hide the button
    window.addEventListener('appinstalled', () => {
      setShowButton(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as any);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // Hide button after user makes a choice
    setShowButton(false);
    setDeferredPrompt(null);
  };

  if (!showButton) return null;

  return (
    <div className="flex justify-center mb-4">
      <Button
        onClick={handleInstallClick}
        className="bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] text-white shadow-lg px-6 py-3 rounded-lg flex items-center space-x-2"
      >
        <Download className="w-5 h-5 mr-2" />
        <span>Download App</span>
      </Button>
    </div>
  );
};

export default PWADownloadButton;
