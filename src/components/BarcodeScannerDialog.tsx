
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
import { ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/button";

const BarcodeScannerDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  // No real barcode scan yet - this is just a placeholder UI!

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-[#cb6ce6] to-[#9c4bc7] text-white shadow-lg flex items-center space-x-2"
          variant="default"
          aria-label="Scan Barcode"
        >
          <ScanBarcode className="w-5 h-5" />
          <span className="hidden sm:inline">Scan Barcode</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan Barcode (Coming Soon)</DialogTitle>
          <DialogDescription>
            Barcode and QR scanning will be available here for fast medicine or patient ID lookup.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full flex flex-col items-center py-8">
          <div className="w-52 h-32 bg-gray-200/40 rounded-lg flex items-center justify-center text-gray-400">
            [ Barcode Camera Feed Placeholder ]
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScannerDialog;
