"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, WifiIcon, Gauge, FolderTree, Bug } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const settingsOptions = [
    {
      title: "Zigbee2MQTT",
      description: "Gestionați dispozitivele Zigbee și configurația MQTT",
      icon: <WifiIcon className="h-5 w-5" />,
      link: "/settings/zigbee"
    },
    {
      title: "System Information",
      description: "Vizualizați informații despre sistem și performanță",
      icon: <Cpu className="h-5 w-5" />,
      link: "/settings/system"
    },
    {
      title: "Database",
      description: "Configurați și gestionați baza de date",
      icon: <FolderTree className="h-5 w-5" />,
      link: "/settings/database"
    },
    {
      title: "Performance",
      description: "Monitorizați și optimizați performanța aplicației",
      icon: <Gauge className="h-5 w-5" />,
      link: "/settings/performance"
    },
    {
      title: "Logs",
      description: "Vizualizați jurnalele de sistem și erori",
      icon: <Bug className="h-5 w-5" />,
      link: "/settings/logs"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Gestionați setările aplicației și configurația dispozitivelor
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsOptions.map((option, index) => (
          <Link href={option.link} key={index} className="block">
            <Card className="p-6 border border-[#1B1C1D] hover:border-[#3B3B3A] transition-colors group">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#2D2D2C] p-2 rounded-md">
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{option.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}