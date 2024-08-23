"use client";

import { createContext, Dispatch, SetStateAction, useEffect, useState, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchDelete, fetchGet, fetchPost } from './fetch_functions';
import Link from 'next/link';
import Image from 'next/image';
import './globals.css';
import io from 'socket.io-client';
import { User, ExternalUser } from '@repo/db';

export const NicknameContext = createContext<NicknameFormProps | undefined>(undefined);

export const userSocket = io('http://localhost:4433/user', { path: "/ws/socket.io/user" });

export type NicknameFormProps = {
  nickname: string | undefined; 
  setNickname: Dispatch<SetStateAction<string | undefined>>;
}

function FriendsInbox() {
  const [friendsRequests, setFriendsRequests] = useState<ExternalUser[]>();
  const [reload, setReload] = useState<boolean>(false);
  const [numberOfRequests, setNumberOfRequests] = useState<number>(0);

  useEffect(() => {
    fetchGet<ExternalUser[]>('api/incomingFriendRequests')
    .then((res) => {
      setFriendsRequests(res);
      setNumberOfRequests(res.length);
    })

    userSocket.on('sendFriendRequest', handleFriendRequest);
    
    // Cleanup the previous event listener on unmount or re-render
    // This is to prevent multiple event listeners from being created
    return () => {
      userSocket.off('sendFriendRequest', handleFriendRequest);
    };
    
  }, [reload]);
  
  const handleFriendRequest = (msg: string) => {
    console.log(msg);
    console.log('FriendRequestNotification received');
    setReload(prev => !prev);
  };
  
  const toggleFriendsInbox = () => {
    const dropdownNotification = document.getElementById('dropdownNotification');
    dropdownNotification?.classList.toggle('hidden');
    setReload(prev => !prev);
  }
  
  const acceptFriendRequest = (friend_id: number) => {
    fetchPost<{friend_id : number}, boolean>('api/acceptFriendRequest', { friend_id: friend_id })
    .then((res) => {
      console.log(res);
      setReload(prev => !prev);
    })
  }
  
  const declineFriendRequest = (friend_id: number) => {
    fetchDelete(`api/declineFriendRequest/?friend_id=${friend_id}`)
    .then((res) => {
      console.log(res);
      setReload(prev => !prev);
    })
  }
  
  return (
    <div className='relative inline-block'>
      { /* -- Notification Button --> */}
      <button id='dropdownNotificationButton' onClick={toggleFriendsInbox} className=' px-2 py-1 rounded-lg hover:bg-blue-700 transition-all duration-150'>
        <svg className="w-8 h-8" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 14 20">
          <path d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z"/>
        </svg>
        {numberOfRequests > 0 && <span className="absolute right-11 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{numberOfRequests}</span>}
      </button>

      { /* -- Notification Dropdown --> */}
      <div id="dropdownNotification" className="z-20 hidden absolute left-1/2 transform -translate-x-1/2 mt-1" aria-labelledby="dropdownNotificationButton">
        <div className="p-2 whitespace-nowrap text-center text-xs text-white bg-slate-600 rounded-t-lg" >
          Friend Requests
        </div>
        <div className="bg-slate-900 p-2 rounded-b-lg"> 
          {friendsRequests?.length === 0 && <p className="text-center text-xs whitespace-nowrap">No friend requests</p>}
          {friendsRequests?.map((friend) => {
            return (
              <div key={friend.intra_user_id} className="flex flex-col items-center justify-between border-slate-600 border-b-2 p-2 underline-offset-1 ">
                <div className='flex flex-grow-0 justify-center items-center py-1 px-2 mb-2'>
                  <Image className="rounded-full h-8 w-8" src={friend.image} alt="Profile Picture" width={100} height={100} />
                  <p className=" px-1 text-sm">{friend.user_name}</p>
                </div>
                <div className='flex space-x-4'>
                  <button onClick={() => acceptFriendRequest(friend.intra_user_id)} className="bg-blue-500 px-2 py-1 rounded-lg hover:bg-blue-700 transition-all duration-150">Accept</button>
                  <button onClick={() => declineFriendRequest(friend.intra_user_id)} className="bg-red-500 px-2 py-1 rounded-lg hover:bg-red-700 transition-all duration-150">Decline</button>     
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}


/* -- LoadProfile Component --> */
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
  
  
  /**
   * Fetch the user profile and set the user state
   * If the user has a nickname set in the database, set the nickname state to the nickname
  */
 useEffect(() => {
   if (token)
    {
      localStorage.setItem('token', token);
      Router.push('/', { scroll: false });
    }
    fetchGet<User>('api/profile')
    .then((res) => {
      setUser(res);
      if (res.nick_name !== nicknameProps.nickname && res.nick_name !== null)
        setNickname(res.nick_name);
      if(userSocket.disconnected)
        userSocket.connect();
      userSocket.emit('registerUserId', res.intra_user_id);
      
    })
    .catch((error) => {
      console.log('Error: ', error);
      Router.push('/login', { scroll: false });
    })
  }, [Router, setNickname, nicknameProps.nickname, token]);
  
  if (!user)
    return ;
  
  
  return (
      <div className='flex space-x-4'>
        <FriendsInbox />
        <Link href={'/profile'} className="flex items-center justify-between bg-blue-500 px-2 py-1 rounded-lg hover:bg-blue-700 transition-all duration-150">
          <Image className="rounded-full h-8 w-8 object-cover" src={user.image} alt="Profile Picture" width={100} height={100} />
          {nicknameProps.nickname === undefined ? <span className=" px-1 text-sm">{user.user_name}</span> : <span className=" px-1 text-sm">{nicknameProps.nickname}</span>}
        </Link>
      </div>
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