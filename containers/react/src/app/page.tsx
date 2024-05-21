"use client";


import { useState, useEffect } from 'react';

/*  Axios is a simple library for making HTTP requests in Javascript. 
    It connects our frontend to the backend by making us easily fetch data form APIs. 
 */
import axios from 'axios';

import { useRouter } from 'next/navigation';

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

/*  Shows the Menupage. 
 */
function Menu({ navigateToHome }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    axios.get('http://nestjs:4242/')
      .then(response => {
        setItems(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('There was an error fetching the items!', error);
        setError(error);
        setLoading(false);
      });
  }, []);

  const navigateToLogin = () => {
    router.push('/login');  
  };

  return (
  <div className="flex flex-col items-center justify-center flex-grow space-y-4">
  <h2 className="text-2xl font-bold text-center">Choose Your Game Mode</h2>
  <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => alert('Single Player')}>
    Single Player
  </button>
  <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => alert('Multiplayer')}>
    Multiplayer
  </button>
  <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={navigateToLogin}>
    Login
  </button>
  <button className="text-blue-500 mt-4" onClick={navigateToHome}>
    Back to Home
  </button>
</div>
);
}

/* The app function manages the state to determine which function (page) is being rendered. 
 */
export default function App() {
  const [currentView, setCurrentView] = useState('home');

  const navigateToMenu = () => setCurrentView('menu');
  const navigateToHome = () => setCurrentView('home');

  return (
    <div className="flex flex-col min-h-screen">
      <header />
      <main className="flex-grow flex items-center justify-center">
        {currentView === 'home' && <Home navigateToMenu={navigateToMenu} />}
        {currentView === 'menu' && <Menu navigateToHome={navigateToHome} />}
      </main>
      <footer />
    </div>
  );
}