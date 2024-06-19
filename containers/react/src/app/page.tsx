"use client";


import { useState, useEffect, use } from 'react';

/*  Axios is a simple library for making HTTP requests in Javascript. 
    It connects our frontend to the backend by making us easily fetch data form APIs. 
 */
import axios from 'axios';

import { useRouter } from 'next/navigation';
import Login from '@/pages/login';
import { SessionProvider } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { profile } from 'console';

/*  Shows the homepage. 
 */
function Home({ navigateToMenu }) {
  
  return (
    <div className="flex justify-center items-center flex-grow">
      <h2
        className="text-4xl font-bold text-center cursor-pointer"
        onClick={navigateToMenu}
      >
        PONG!
      </h2>
    </div>
  );
}

function Logout( navigateToHome : any) {
  localStorage.removeItem('token');
  navigateToHome.call();
}

/*  Shows the Menupage. 
 */
function Menu({ navigateToHome, navigateToLogin }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  return (
  <div className="flex flex-col items-center justify-center flex-grow space-y-4">
  <h2 className="text-2xl font-bold text-center">Choose Your Game Mode</h2>
  <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => alert('Single Player')}>
    Single Player
  </button>
  <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => alert('Multiplayer')}>
    Multiplayer
  </button>
  <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => Logout(navigateToHome)}>
    Logout
  </button>
  <button className="text-blue-500 mt-4" onClick={navigateToHome}>
    Back to Home
  </button>
</div>
);
}

async function fetchProfile(token : string | null): Promise<number> {
    
    try {
      const profile = await fetch('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Profile: ', profile.status);
      if (profile.status === 401)
        throw 'Unauthorized';
      else if (profile.status === 200)
        return 200;
      else
        return profile.status;
    } 
    catch (error : any) {
      console.log('Fetch Error: ', error);
      if (error.message === 'Unauthorized') {
        throw error;
      } else {
        return 500;
      }
    }
}

/* The app function manages the state to determine which function (page) is being rendered. 
 */
export default function App() {
  const [currentView, setCurrentView] = useState('home');

  const navigateToMenu = () => setCurrentView('menu');
  const navigateToHome = () => setCurrentView('home');
  const navigateToLogin = () => setCurrentView('HomeToLogin');

  const Router = useRouter();

  const token = useSearchParams().get('token');

  console.log('Token: ', token);
  
  useEffect(() => {
    if (token)
      localStorage.setItem('token', token);
    Router.push('/', { scroll: false });
    console.log('Token: ', token);
    fetchProfile(localStorage.getItem('token'))
    .then((statusCode) => {
      if (statusCode === 200) {
        setCurrentView('home');
      } else {
        setCurrentView('login');
      }
    })
    .catch((error) => {
      console.log('Error: ', error);
      setCurrentView('login');
    });
  }, []
  );



  return (
    <div className="flex flex-col min-h-screen">
      <header />
      <main className="flex-grow flex items-center justify-center">
        <SessionProvider>
        {currentView === 'home' ? <Home navigateToMenu={navigateToMenu} /> : null}
        {currentView === 'menu' ? <Menu navigateToHome={navigateToHome} navigateToLogin={navigateToLogin} /> : null}
        {currentView === 'login' ? <Home navigateToMenu={navigateToLogin} /> : null}
        {currentView === 'HomeToLogin' ? <Login /> : null}
      </SessionProvider>
      </main>
      <footer />
    </div>
  );
}
