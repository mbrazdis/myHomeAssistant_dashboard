import { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css"
import { cn } from "@/lib/utils";
import { Nav, NavLink } from "@/components/Nav";


export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <Nav>
        <NavLink href="/"></NavLink>
        <NavLink href="/">Dashboard</NavLink>
        <NavLink href="/rooms">Rooms</NavLink>
        <NavLink href="/devices">Devices</NavLink>
        <NavLink href="/orders">Settings</NavLink>
      </Nav>
      <main className="flex-1 ml-64"> 
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}