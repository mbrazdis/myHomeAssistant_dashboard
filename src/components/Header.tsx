import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-blue-500 text-white p-4 flex justify-between">
      <h1 className="text-lg font-bold">Smart Home Dashboard</h1>
      <nav>
        <Link href="/" className="mx-2 hover:underline">Home</Link>
        <Link href="/settings" className="mx-2 hover:underline">Settings</Link>
      </nav>
    </header>
  );
};

export default Header;
