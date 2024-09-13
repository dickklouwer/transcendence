"use client";

import { createContext, useState, Dispatch, SetStateAction } from 'react';
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

function MessageInbox() {
  const [numberOfMessages, setNumberOfMessages] = useState<number>(2);
  return (
    <div className='relative inline-block'>
      <Link href={'/chats'} className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-blue-700 transition-all duration-150">
        <svg className="w-8 h-8 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M4 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1v2a1 1 0 0 0 1.707.707L9.414 13H15a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4Z" clipRule="evenodd"/>
          <path fillRule="evenodd" d="M8.023 17.215c.033-.03.066-.062.098-.094L10.243 15H15a3 3 0 0 0 3-3V8h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1v2a1 1 0 0 1-1.707.707L14.586 18H9a1 1 0 0 1-.977-.785Z" clipRule="evenodd"/>
        </svg>
        {numberOfMessages > 0 && <span className="absolute right-5 bottom-[-5px] inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{numberOfMessages}</span>}
      </Link>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  
  const [nickname, setNickname] = useState<string>();
  const [reload, setReload] = useState<boolean>(false);
  
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
              <MessageInbox/>
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