
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

const PushNotificationOptInDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);
  const [processing, setProcessing] = useState(false);

  const handleRequest = async () => {
    setProcessing(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch (e) {
      // ignore
    }
    setProcessing(false);
    setOpen(false);
  };

  // Only show the dialog if notifications are supported and not granted
  if (
    typeof Notification === "undefined" ||
    permission === "granted"
  ) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#b84fd9] to-[#9c4bc7] text-white shadow-lg flex items-center space-x-2"
          variant="default"
        >
          <Bell className="w-5 h-5" />
          <span className="hidden sm:inline">Enable Notifications</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enable Push Notifications?</DialogTitle>
          <DialogDescription>
            Stay updated about prescriptions, reminders, and new features.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={processing} onClick={handleRequest}>
            Allow
          </Button>
          <DialogClose asChild>
            <Button variant="ghost" disabled={processing}>
              Maybe Later
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PushNotificationOptInDialog;
