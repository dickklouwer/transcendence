"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchProfile, FunctionRouter } from '../app/page';

async function Logout( navigateToHome : FunctionRouter) {
    localStorage.removeItem('token');
    navigateToHome();
  }

export default function Menu({ navigateToHome, navigateToProfile, navigateToLogin, navigateToChat }: { navigateToHome: FunctionRouter, navigateToProfile: FunctionRouter, navigateToLogin: FunctionRouter, navigateToChat: FunctionRouter}) {
    const [user , setUser] = useState<any>(null); // This Any needs to be replaced with the correct type that we will get from the backend
    const [error, setError] = useState(null);
  
    useEffect(() => {
      fetchProfile(localStorage.getItem('token'))
      .then((data) => {
        console.log('Retrieved Data: ', data);
        setUser(data);
      })
      .catch((error) => {
        console.log('Error: ', error);
        setError(error);
        navigateToLogin();
      })
    }, []);
    if (!user)
      return <div>Loading...</div>;
  
    console.log('User: ', user);
  
    return ( 
    <div className="static space-y-4 w-full">
      {/* Profile Picture and Username */}
      <div onClick={navigateToProfile} className="absolute flex flex-col right-4 top-1 z-10">
          <Image className="rounded-full" src={user.image} alt="Profile Picture" width={100} height={100} />
          <span className="text-sm mt-2">{user.user_name}</span>
      </div>
    <div className="relative flex flex-col items-center justify-center flex-grow space-y-4 min-h-screen">
      <h2 className="text-2xl font-bold text-center mt-8">Choose Your Game Mode</h2>
      <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => alert('Single Player')}>
        Single Player
      </button>
      <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => alert('Multiplayer')}>
        Multiplayer
      </button>
      <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={navigateToChat}>
      Chat
      </button>
      <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => Logout(navigateToHome)}>
        Logout
      </button>
      <button className="text-blue-500 mt-4" onClick={navigateToHome}>
        Back to Home
      </button>
    </div>
  </div>
  );
  }