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
import Image from 'next/image';

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


function LoadProfile() {

  const [user , setUser] = useState<any>(null); // This Any needs to be replaced with the correct type that we will get from the backend

  useEffect(() => {
    fetchProfile(localStorage.getItem('token'))
    .then((data) => {
      setUser(data);
    })
    .catch((error) => {
      console.log('Error: ', error);
    });
  }, []);

  if (!user)
    return ;
  return ( <div className="flex gap-1 mr-3 m-1 px-2.5 hover:bg-blue-300 duration-200 transition-all hover:scale-[0.9] bg-blue-500 p-1 rounded-full justify-center items-center">
    <Image className="rounded-full h-10 w-10" src={user.image} alt="Profile Picture" width={100} height={100} />
    <span className="text-xs">{user.user_name}</span>
  </div>
)
}

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [profilepicture, setProfilePicture] = useState(null); // This Any needs to be replaced with the correct type that we will get from the backend
  const Router = useRouter();
  const [user , setUser] = useState<any>(null); // This Any needs to be replaced with the correct type that we will get from the backend


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
      setUser(data);
      setCurrentView('home');
    })
    .catch((error) => {
      console.log('Error: ', error);
      setCurrentView('login');
    });
  }, []
  );
  


  return (
    <div className="flex flex-col min-h-screen  h-full">
      <header className="flex justify-between w-[100vw] h-16">

      <h1 className="text-white mt-1 text-3xl">PONG!</h1>
      <div onClick={navigateToProfile}>
        <LoadProfile />
      </div>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <SessionProvider>
        {currentView === 'home' ? <Home navigateToMenu={navigateToMenu} /> : null}
        {currentView === 'menu' ? <Menu navigateToHome={navigateToHome} navigateToLogin={navigateToLogin} navigateToChat={navigateToChat} navigateToProfile={navigateToProfile} /> : null}
        {currentView === 'login' ? <Home navigateToMenu={navigateToLogin} /> : null}
        {currentView === 'chat' ? <Chats navigateToMenu={navigateToMenu} /> : null}
        {currentView === 'HomeToLogin' ? <Login /> : null}
        {currentView === 'profile' ? <Profile navigateToMenu={navigateToMenu}/> : null}
        {currentView === 'setNickname' ? <Profile navigateToMenu={navigateToMenu}/> : null}
      </SessionProvider>
      </main>
    </div>
  );
}
