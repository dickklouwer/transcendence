"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Login from '@/pages/login';
import Chats from '@/pages/chat/chats';
import { SessionProvider } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Menu from '@/pages/menu';
import Home from '@/pages/home';
import Profile from '@/pages/profile';

export type FunctionRouter = () => void;

export async function fetchProfile(token : string | null): Promise<any> {    
  const profile = await fetch('api/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  .catch((error) => {
    throw `Unauthorized ${error}`;
  });
  const user = await profile.json();
  if (user.statusCode !== 401)
    return user;
  throw `Unauthorized ${user.statusCode}`;
}

async function SetNickname( name: string ): Promise<any> {
  const nickname = await fetch('/auth/setNickname', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  .catch((error) => {
    throw `Unauthorized ${error}`;
  });
  const user = await nickname.json();
  if (user.statusCode !== 401)
    return user;
  throw `Unauthorized ${user.statusCode}`;
}

/* The app function manages the state to determine which function (page) is being rendered. 
 */

// NickName set flow is {fetchProfile -> check if nickname is set -> if not set navigate to set nickname page return to menu}
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const Router = useRouter();

  const navigateToMenu: FunctionRouter = () => setCurrentView('menu');
  const navigateToHome: FunctionRouter = () => setCurrentView('home');
  const navigateToLogin: FunctionRouter = () => setCurrentView('HomeToLogin');
  const navigateToProfile: FunctionRouter = () => setCurrentView('profile');
  const navigateToNickname: FunctionRouter = () => setCurrentView('setNickname');
  const navigateToChat: FunctionRouter = () => setCurrentView('chat');

  const token = useSearchParams().get('token');
  
  useEffect(() => {
    if (token)
      localStorage.setItem('token', token);
    Router.push('/', { scroll: false });
    fetchProfile(localStorage.getItem('token'))
    .then((data) => {
      console.log('Retrieved Data: ', data);
      setCurrentView('home');
    })
    .catch((error) => {
      console.log('Error: ', error);
      setCurrentView('login');
    });
  }, []
  );

  return (
    <div className="flex flex-col min-h-screen w-full h-full">
      <h1 className="inline-block text-white text-3xl">PONG!</h1>
      <main className="flex-grow flex items-center justify-center">
        <SessionProvider>
        {currentView === 'home' ? <Home navigateToMenu={navigateToMenu} /> : null}
        {currentView === 'menu' ? <Menu navigateToHome={navigateToHome} navigateToLogin={navigateToLogin} navigateToChat={navigateToChat} navigateToProfile={navigateToProfile} /> : null}
        {currentView === 'login' ? <Home navigateToMenu={navigateToLogin} /> : null}
        {currentView === 'chat' ? <Chats navigateToMenu={navigateToMenu} /> : null}
        {currentView === 'HomeToLogin' ? <Login /> : null}
        {currentView === 'profile' ? <Profile navigateToMenu={navigateToMenu}/> : null}
        {currentView === 'setNickname' ? <Profile navigateToMenu={navigateToMenu}/> : null}
        {currentView === 'pongSingle' && <PongGame gameType="single" />}
        {currentView === 'pongMulti' && <PongGame gameType="multi" />}
      </SessionProvider>
      </main>
    </div>
  );
}
