
import React, { useEffect, useRef } from "react";
import { toast } from "@/components/ui/use-toast";

const OfflineDetector: React.FC = () => {
  const toastShown = useRef(false);

  useEffect(() => {
    function handleOffline() {
      toastShown.current = true;
      toast({
        title: "You're Offline",
        description:
          "You have lost your internet connection. Some app features may not work.",
        variant: "destructive",
      });
    }
    function handleOnline() {
      if (toastShown.current) {
        toast({
          title: "Back Online",
          description: "You are connected to the internet.",
          variant: "default",
        });
        toastShown.current = false;
      }
    }
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);
  return null;
};
export default OfflineDetector;
