"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';

const Menu = () => {
  const [pSock, setPSock] = useState<Socket | null>(null);
  const router = useRouter(); // Get the router object

  const connectToSocket = (url: string) => {
    // console.log(`pSock: ${pSock ? pSock.toString() : 'null'}`);
    let sock = io(url, {
      transports: ['websocket'],
      query: {
        currentPath: window.location.pathname,
      },
      withCredentials: true,
    });
    setPSock(sock);
    // console.log(`sock: ${sock.id ? sock.toString() : 'null'}`);
  };

  const handleSinglePlayerClick = () => {
    const url = `http://${process.env.NEXT_PUBLIC_HOST_NAME}:4433/power-up`;
    connectToSocket(url);
    router.push('/pong/singleplayer_PowerUp'); // Navigate to single player page
  };

  const handleMultiplayerClick = () => {
    // const url = `http://${process.env.NEXT_PUBLIC_HOST_NAME}:4433/multiplayer`;
    // connectToSocket(url);
    router.push('/pong/multiplayer'); // Navigate to multiplayer page
  };

  const renderInitialOptions = () => {
    return (
      <>
        <button
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
          onClick={handleSinglePlayerClick}
        >
          Single Player
        </button>
        <button
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
          onClick={handleMultiplayerClick}
        >
          Multiplayer
        </button>
      </>
    );
  };

  return (
    <div className="static space-y-4 w-full">
      <div className="relative flex flex-col items-center justify-center flex-grow space-y-4 min-h-screen">
        <h2 className="text-2xl font-bold text-center mt-8">
          Choose Your Game Mode
        </h2>
        {renderInitialOptions()}
        <button
          className="text-blue-500 mt-4"
          onClick={() => router.push('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Menu;