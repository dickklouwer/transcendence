"use client";

import { createContext, useState, Dispatch, SetStateAction, useEffect } from 'react';
import LoadProfile from './profile_headers';
import Link from 'next/link';
import './globals.css';

export const NicknameContext = createContext<NicknameFormProps | undefined>(undefined);

export type NicknameFormProps = {
  nickname: string | undefined; 
  setNickname: Dispatch<SetStateAction<string | undefined>>;
  reload: boolean;
  setReload: Dispatch<SetStateAction<boolean>>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

  const [nickname, setNickname] = useState<string>();
  const [reload, setReload] = useState<boolean>(false);

  if (process.env.NEXT_PUBLIC_HOST_NAME === undefined)
    throw new Error('NEXT_PUBLIC_HOSTNAME is undefined');
  
  useEffect(() => {
    if (window && window.location.hostname !== process.env.NEXT_PUBLIC_HOST_NAME) {
      window.location.replace("http://" + process.env.NEXT_PUBLIC_HOST_NAME + ":4433")
    }

    
  });
  
  return (
    <html lang="en">
        <head>
          
          <title>ft_transcendence42</title>
        </head>
        <body className='relative flex-grow flex-col min-h-screen w-full'>
          <NicknameContext.Provider value={{nickname, setNickname, reload, setReload }}>    
            <header className="text-white flex p-2  justify-between">
              <Link href="/menu">
                <h1 className="inline-block text-3xl">PONG!</h1>
              </Link>
              <LoadProfile setNickname={setNickname} />
            </header>
          <main className="flex-grow flex items-center justify-center min-h-[100vh]">
            {children}</main>
          </NicknameContext.Provider>
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