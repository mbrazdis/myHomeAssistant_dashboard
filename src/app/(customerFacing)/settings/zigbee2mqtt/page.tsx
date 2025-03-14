"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ZigbeeSettingsPage() {
  const [iframeHeight, setIframeHeight] = useState("800px");
  
  // Ajustează înălțimea iframe-ului pentru a se adapta la ecran
  useEffect(() => {
    const updateIframeHeight = () => {
      // Calculează înălțimea disponibilă minus header și padding
      const availableHeight = window.innerHeight - 150;
      setIframeHeight(`${availableHeight}px`);
    };
    
    updateIframeHeight();
    window.addEventListener("resize", updateIframeHeight);
    
    return () => {
      window.removeEventListener("resize", updateIframeHeight);
    };
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/settings">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Zigbee2MQTT</h1>
        </div>
        <div className="space-x-2">
          <a 
            href="http://192.168.100.177:8080" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
          >
            Open in New Window
          </a>
        </div>
      </div>
      
      <Card className="border border-[#1B1C1D] overflow-hidden">
        <div className="w-full bg-[#2D2D2C] py-2 px-4 border-b border-[#1B1C1D] flex items-center justify-between">
          <h2 className="font-medium">Zigbee2MQTT Interface</h2>
          <span className="text-sm text-muted-foreground">192.168.100.177:8080</span>
        </div>
        
        <div className="w-full" style={{ height: iframeHeight }}>
          <iframe 
            src="http://192.168.100.177:8080" 
            className="w-full h-full"
            style={{
              border: "none",
              backgroundColor: "#f5f5f5"
            }}
            title="Zigbee2MQTT"
            sandbox="allow-same-origin allow-scripts allow-forms"
            loading="lazy"
          />
        </div>
      </Card>
    </div>
  );
}