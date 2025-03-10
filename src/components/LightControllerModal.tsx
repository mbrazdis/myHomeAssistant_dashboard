
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import LightController from "@/components/LightController";
import { cn } from "@/lib/utils";

interface Room {
  id: string;
  name: string;
  devices: { id: string; name: string }[];
}

interface LightControllerModalProps {
  room: Room;
  areAllDevicesOn: boolean;
}

export function LightControllerModal({ room, areAllDevicesOn }: LightControllerModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-8 w-8",
            areAllDevicesOn && "text-amber-400"
          )}
          title="Light Controls"
        >
          <Lightbulb className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#2D2D2C] border-[#1B1C1D]">
        <DialogHeader>
          <DialogTitle className="text-[#9A9C9D]">Light Controls - {room.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <LightController room={room} />
        </div>
      </DialogContent>
    </Dialog>
  );
}