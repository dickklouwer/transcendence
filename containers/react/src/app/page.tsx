"use client";


import { useState, useEffect, use } from 'react';

/*  Axios is a simple library for making HTTP requests in Javascript. 
    It connects our frontend to the backend by making us easily fetch data form APIs. 
 */
import { useRouter } from 'next/navigation';
import Login from '@/pages/login';
import { SessionProvider } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
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

async function Logout( navigateToHome : any) {

  navigateToHome.call();
}

/*  Shows the Menupage. 
 */
function Menu({ navigateToHome, navigateToLogin }) {
  const [user , setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfile(localStorage.getItem('token'))
    .then((data) => {
      console.log('Retrieved Data: ', data);
      setUser(data);
    })
    .catch((error) => {
      console.log('Error: ', error);
      setError(error);
    })
  }, []);
  if (!user)
    return <div>Loading...</div>;

  console.log('User: ', user);

  return ( 
  <div className="absolute space-y-4 w-full">
    {/* Profile Picture and Username */}
    <div className="absolute right-4 top-1">
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

async function fetchProfile(token : string | null): Promise<any> {
    
  const profile = await fetch('/auth/profile', {
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

/* The app function manages the state to determine which function (page) is being rendered. 
 */
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const Router = useRouter();

  const navigateToMenu = () => setCurrentView('menu');
  const navigateToHome = () => setCurrentView('home');
  const navigateToLogin = () => setCurrentView('HomeToLogin');

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
        {currentView === 'menu' ? <Menu navigateToHome={navigateToHome} navigateToLogin={navigateToLogin} /> : null}
        {currentView === 'login' ? <Home navigateToMenu={navigateToLogin} /> : null}
        {currentView === 'HomeToLogin' ? <Login /> : null}
      </SessionProvider>
      </main>
    </div>
  );
}
