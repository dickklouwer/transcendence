"use client";

import { createContext, Dispatch, SetStateAction, useEffect, useState, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchProfile, fetchGet } from './page';
import Link from 'next/link';
import Image from 'next/image';
import './globals.css';
import { User } from '@repo/db';

export const NicknameContext = createContext<NicknameFormProps | undefined>(undefined);

export type NicknameFormProps = {
  nickname: string | undefined; 
  setNickname: Dispatch<SetStateAction<string | undefined>>;
}

function LoadProfile({ setNickname }: { setNickname: Dispatch<SetStateAction<string | undefined>> })
{
  const [user , setUser] = useState<User>();
  const Router = useRouter();
  const searchParams = useSearchParams();
  const nicknameProps : NicknameFormProps | undefined = useContext(NicknameContext);
  
  if (!searchParams)
    throw new Error('SearchParams is undefined');
  
  const token = searchParams.get('token');
  
  if (nicknameProps === undefined)
    throw new Error('useNickname must be used within a NicknameProvider');
  
  useEffect(() => {
    if (token)
      {
        localStorage.setItem('token', token);
      Router.push('/', { scroll: false });
    }
    fetchGet<User>('api/profile')
    .then((res) => {
      setUser(res);
      if (res.nick_name !== null)
        setNickname(res.nick_name);
    })
    .catch((error) => {
      console.log('Error: ', error);
      Router.push('/login', { scroll: false });
    })
  }, [Router, setNickname, nicknameProps.nickname, token]);
  
  if (!user)
    return ;
    
    return (
      <Link href={'/profile'} className="flex items-center justify-between bg-blue-500 px-2 py-1 rounded-lg hover:bg-blue-700 transition-all duration-150">
          <Image className="rounded-full h-8 w-8" src={user.image} alt="Profile Picture" width={100} height={100} />
          {nicknameProps.nickname === undefined ? <span className=" px-1 text-sm">{user.user_name}</span> : <span className=" px-1 text-sm">{nicknameProps.nickname}</span>}
      </Link>
  )
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  
  const [nickname, setNickname] = useState<string>();
  
  return (
    <html lang="en">
        <head>
          <title>ft_transcendence42</title>
        </head>
        <body className='relative flex-grow flex-col min-h-screen w-full'>
          <NicknameContext.Provider value={{nickname, setNickname}}>    
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