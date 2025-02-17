"use client";

import Link from 'next/link';

export default function gameover() {
  
    return ( 
    <div className="static space-y-4 w-full">
    <div className="relative flex flex-col items-center justify-center flex-grow space-y-4 min-h-screen">
      <h2 className="text-2xl font-bold text-center mt-8">Game over!</h2>
      <Link className="text-blue-500 mt-4" href={'/'}>
        Back to Home
      </Link>
    </div>
  </div>
  );
  }