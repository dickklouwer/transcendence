"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProfile } from './page';
import Link from 'next/link';
import Image from 'next/image';
import './globals.css';

function LoadProfile()
{
  const [user , setUser] = useState<any>(null);
  const Router = useRouter();

  useEffect(() => {
    fetchProfile(localStorage.getItem('token'))
    .then((data) => {
      console.log('Retrieved Data: ', data);
      setUser(data);
    })
    .catch((error) => {
      console.log('Error: ', error);
      Router.push('/login', { scroll: false });
    })
  }, []);

  if (!user)
    return <div>Loading...</div>;

  return (
    <Link href={'/profile'} className="absolute flex flex-col right-4 top-1 z-10">
          <Image className="rounded-full" src={user.image} alt="Profile Picture" width={100} height={100} />
          <span className="text-sm mt-2">{user.user_name}</span>
      </Link>
  )
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en">
        <head>
          <title>ft_transcendence42</title>
        </head>
        <body className='relative flex-grow flex-col min-h-screen w-full'>
          <header className="bg-blue-600 text-white p-4">
          <h1 className="inline-block text-white text-3xl">PONG!</h1>
          <LoadProfile />
          </header>
          <main className="flex-grow flex items-center justify-center min-h-[100vh]">
            {children}</main>
          <Footer></Footer>
        </body>
      </html>
  );
}



function Footer() {
  const subtextStyle = {
    color: 'white',
    textAlign: 'left',
    fontSize: '12px',
  };

  return (
    <div className='w-full'>
      <footer className=' bg-blue-600 text-white p-4 mt-auto'>
      <p>ft_transcendence42 a Codam project.
      <br />
      Created and styled by: tklouwer, bprovoos, jmeruma, vbrouwer, mweverli.
      </p>
      </footer>
    </div>
);
}