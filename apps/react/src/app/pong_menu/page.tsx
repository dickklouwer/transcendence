"use client";

import { useState } from 'react';
import Link from 'next/link';
import { userSocket } from '../layout';

export default function Menu() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  function renderInitialOptions() {
    return (
      <>
        <Link
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
          href="#"
          onClick={() => setSelectedMode('singleplayer')}
        >
          Single Player
        </Link>
        <Link
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
          href="#"
          onClick={() => setSelectedMode('multiplayer')}
        >
          Multiplayer
        </Link>
      </>
    );
  }

  function renderPowerUpOptions() {
    const baseHref = selectedMode === 'singleplayer' ? '/pong/singleplayer' : '/pong/multiplayer';

    return (
      <>
        <Link
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
          href={`${baseHref}`}
        >
          Play without Power Ups
        </Link>
        <Link
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
          href={`${baseHref}_PowerUp`}
        >
          Play with Power Ups
        </Link>
        <button
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
          onClick={() => setSelectedMode(null)}
        >
          Back
        </button>
      </>
    );
  }

  return (
    <div className="static space-y-4 w-full">
      <div className="relative flex flex-col items-center justify-center flex-grow space-y-4 min-h-screen">
        <h2 className="text-2xl font-bold text-center mt-8">
          {selectedMode ? `Choose Power-Up Option for ${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}` : 'Choose Your Game Mode'}
        </h2>
        {selectedMode ? renderPowerUpOptions() : renderInitialOptions()}
        <Link className="text-blue-500 mt-4" href={'/'}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
