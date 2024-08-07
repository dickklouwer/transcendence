"use client";

import { useRouter } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { NewUser, UserChats } from '../../../nestjs/src/auth/auth.service';

export async function fetchProfile(token : string | null): Promise<NewUser> {
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

export async function fetchGet<T> (url: string): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  
    if (response.status !== 200)
      throw `Unauthorized ${response.status}`;
    const data : T = await response.json();
    return data;
  } catch (error) {
    throw `Fetch Error ${error}`;
  }
}

export async function fetchPost<B, T> (url: string, body: B): Promise<T> {
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(body),
    })

    if(response.status !== 200)
      throw `Unauthorized ${response.status}`;

    const data = await response.json();
    return data;
  } catch (error) {
    throw `Fetch Error ${error}`;
  }
}

export async function fetchChats(token : string | null): Promise<UserChats[]> {
  const messages = await fetch('api/chats', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  .catch((error) => {
    throw `Unauthorized ${error}`;
  });
  const chats = await messages.json();
  if (chats.statusCode !== 401)
    return chats;
  throw `Unauthorized ${chats.statusCode}`;
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
