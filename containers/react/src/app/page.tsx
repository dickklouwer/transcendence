"use client";

import { useRouter } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';

export type FunctionRouter = () => void;

export async function fetchProfile(token : string | null): Promise<any> {    
  const profile = await fetch('api/profile', {
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

async function SetNickname( name: string ): Promise<any> {
  const nickname = await fetch('/auth/setNickname', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  .catch((error) => {
    throw `Unauthorized ${error}`;
  });
  const user = await nickname.json();
  if (user.statusCode !== 401)
    return user;
  throw `Unauthorized ${user.statusCode}`;
}

/* The app function manages the state to determine which function (page) is being rendered. 
 */

// NickName set flow is {fetchProfile -> check if nickname is set -> if not set navigate to set nickname page return to menu}
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
