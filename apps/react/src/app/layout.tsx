"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchProfile } from './page';
import Link from 'next/link';
import Image from 'next/image';
import './globals.css';

function LoadProfile()
{
  const [user , setUser] = useState<any>(null);
  const Router = useRouter();

  const token = useSearchParams().get('token');

  useEffect(() => {
    if (token)
    {
      localStorage.setItem('token', token);
      Router.push('/');
    }
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
    return ;

  return (
    <Link href={'/profile'} className="flex items-center bg-blue-500 px-2 py-1 rounded-lg hover:bg-blue-700 transition-all duration-150">
          <Image className="rounded-full h-8 w-8" src={user.image} alt="Profile Picture" width={100} height={100} />
          <span className="text-sm">{user.user_name}</span>
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
          <header className="text-white flex p-2  justify-between">
          <h1 className="inline-block text-3xl">PONG!</h1>
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