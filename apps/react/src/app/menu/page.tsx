"use client";

import Link from 'next/link';
import { userSocket } from '../profile_headers';
import { chatSocket } from '../chat_componens';

export default function Menu() {
  
    function Logout() {
      localStorage.removeItem('token');
      userSocket.disconnect();
      chatSocket.disconnect();
      window.location.replace('/login');
    }
  
    return ( 
    <div className="static space-y-4 w-full">
    <div className="relative flex flex-col items-center justify-center flex-grow space-y-4 min-h-screen">
      <h2 className="text-2xl font-bold text-center mt-8">Choose Your Game Mode</h2>
      <Link className="bg-blue-500 text-white font-bold py-2 px-4 rounded" href={'/pong_menu'}>
        Play
      </Link>
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