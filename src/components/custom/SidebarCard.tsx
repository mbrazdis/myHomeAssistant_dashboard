import React, { ReactNode } from "react";

interface SidebarCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function SidebarCard({ title, children, className = "" }: SidebarCardProps) {
  return (
    <div className={`bg-black/20 backdrop-blur-sm rounded-lg p-4 mb-4 ${className}`}>
      <h3 className="text-lg font-medium mb-3 text-white">{title}</h3>
      <div>{children}</div>
    </div>
  );
}