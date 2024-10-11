"use client";

import Link from 'next/link';

export default function Menu() {

  function renderInitialOptions() {
    return (
      <>
        <Link
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
          href="/pong/singleplayer_PowerUp"
        >
          Single Player
        </Link>
        <Link
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
          href="/pong/multiplayer"
        >
          Multiplayer
        </Link>
      </>
    );
  }

  return (
    <div className="static space-y-4 w-full">
      <div className="relative flex flex-col items-center justify-center flex-grow space-y-4 min-h-screen">
        <h2 className="text-2xl font-bold text-center mt-8">
          Choose Your Game Mode
        </h2>
        {renderInitialOptions()}
        <Link className="text-blue-500 mt-4" href={'/'}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
