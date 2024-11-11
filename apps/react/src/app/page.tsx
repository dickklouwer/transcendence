"use client";
import { useRouter } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';

export default function Home() {

  
  const Router = useRouter();

  return (
    <div className="flex flex-col min-h-screen w-full h-full">
      <SessionProvider>
        <div className="flex justify-center items-center flex-grow">
          <h2 className="text-4xl font-bold text-center cursor-pointer">
            <button onClick={() => Router.push('/menu')}> PONG! </button>
          </h2>
        </div>
      </SessionProvider>
    </div>
  );
}
