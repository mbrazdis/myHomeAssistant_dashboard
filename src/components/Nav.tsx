"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode, useState } from "react";

export function Nav({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#3B3B3A] text-[#9A9C9D] shadow-md h-full w-64 fixed">
      <div className="px-6 py-4 flex-row ">
        <div className="text-2xl font-bold">
          <Link href="/" className=" text-[#9A9C9D] hover:text-[#6C6C6A]">
            HOME
          </Link>
        </div>
        <div className="hidden md:flex flex-col space-y-6">{children}</div>
        <button
          className="md:hidden text-[#6C6C6A] bg-[#6C6C6A] hover:text-[#B6B6B4]"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
            ></path>
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="">
          {React.Children.map(children, (child) =>
            React.cloneElement(child as React.ReactElement, {
              onClick: () => setIsOpen(false),
            })
          )}
        </div>
      )}
    </nav>
  );
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
  const pathname = usePathname();

  return (
    <Link
      {...props}
      className={cn(
        "relative p-2 text-[#9A9C9D] text-lg font-medium transition-all duration-300 hover:text-[#B6B6B4] focus-visible:text-[#3B3B3A]",
        pathname === props.href
          ? "text-[#9A9C9D] border-b-2 border-[#9A9C9D]"
          : "text-[#9A9C9D] hover:text-[#6C6C6A]"
          
      )}
    >
      {props.children}
      {pathname === props.href && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6C6C6A]"></span>
      )}
    </Link>
  );
}
