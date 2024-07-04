"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Menu() {
    const Router = useRouter();
  
    function Logout() {
      localStorage.removeItem('token');
      Router.push('/', { scroll: false });
    }
  
    return ( 
    <div className="static space-y-4 w-full">
    <div className="relative flex flex-col items-center justify-center flex-grow space-y-4 min-h-screen">
      <h2 className="text-2xl font-bold text-center mt-8">Choose Your Game Mode</h2>
      <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => alert('Single Player')}>
        Single Player
      </button>
      <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => alert('Multiplayer')}>
        Multiplayer
      </button>
      <Link className="bg-blue-500 text-white font-bold py-2 px-4 rounded" href={'/chats'}>
      Chat
      </Link>
      <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => Logout()}>
        Logout
      </button>
      <Link className="text-blue-500 mt-4" href={'/'}>
        Back to Home
      </Link>
    </div>
  </div>
  );
  }