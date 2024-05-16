"use client";


import { useState } from 'react';

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
  return (
  <div className="flex flex-col items-center justify-center flex-grow space-y-4">
  <h2 className="text-2xl font-bold text-center">Choose Your Game Mode</h2>
  <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => alert('Single Player')}>
    Single Player
  </button>
  <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => alert('Multiplayer')}>
    Multiplayer
  </button>
  <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => alert('Login')}>
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