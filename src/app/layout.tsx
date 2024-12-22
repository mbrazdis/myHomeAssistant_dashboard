"use client";

import React, { useState } from "react";
import "../styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <html lang="en" className={isDarkMode ? "dark" : ""}>
      <body className="bg-gray-900 text-white dark:bg-gray-900 dark:text-white">
        <div className="flex">
          <aside className="w-64 bg-gray-800 text-white h-screen flex-shrink-0">
            <nav className="flex flex-col p-4 space-y-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 bg-gray-700 rounded text-white"
              >
                Toggle Theme
              </button>
              <a href="/" className="p-2 hover:bg-gray-700 rounded">Devices</a>
              <a href="/groups" className="p-2 hover:bg-gray-700 rounded">Groups</a>
              <a href="/settings" className="p-2 hover:bg-gray-700 rounded">Settings</a>
            </nav>
          </aside>
          <main className="flex-grow p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
