import { useEffect, useState, Dispatch, SetStateAction, useContext } from 'react';
import { fetchGet, fetchPost, fetchDelete } from './fetch_functions';
import { NicknameContext, NicknameFormProps } from './layout';
import Link from 'next/link';
import Image from 'next/image';
import io from 'socket.io-client';
import { ExternalUser, User } from '@repo/db';
import { useSearchParams, useRouter} from 'next/navigation';

export const userSocket = io('http://localhost:4433/user', { path: "/ws/socket.io/user" });


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
        {numberOfRequests > 0 && <span className="absolute right-11 inline-flex items-center justify-center py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{numberOfRequests}</span>}
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

function MatchHistory() {

    return ( 
        <div className='inline-block px-2 py-1 rounded-lg hover:bg-blue-700 transition-all duration-150'>
            <Link href='/match_history'>
                <svg className='w-8 h-8' version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256.000000 256.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,256.000000) scale(0.100000,-0.100000)"fill="#ffffff" stroke="none"><path d="M414 2470 c-126 -18 -232 -98 -291 -218 l-38 -76 -3 -859 c-2 -553 1 -879 8 -914 27 -148 142 -269 295 -309 73 -20 1717 -20 1790 0 77 20 135 54 190 110 58 60 91 121 105 196 14 76 13 1692 -1 1762 -33 159 -162 282 -325 308 -69 12 -1652 11 -1730 0z m786 -630 c0 -437 -1 -480 -16 -480 -108 0 -224 -125 -224 -240 0 -115 116 -240 224 -240 14 0 16 -31 16 -321 l0 -320 -392 3 c-384 3 -394 4 -434 25 -52 28 -111 95 -124 142 -6 23 -10 349 -10 867 0 928 -2 899 67 966 21 20 58 46 83 57 43 20 65 21 428 21 l382 0 0 -480z m976 456 c67 -31 120 -94 134 -160 8 -36 10 -303 8 -891 -3 -803 -4 -842 -22 -870 -30 -49 -68 -85 -111 -108 -39 -21 -52 -22 -432 -25 l-393 -3 0 351 0 351 29 37 c68 88 68 196 0 284 l-29 37 0 510 0 511 383 0 c380 0 382 0 433 -24z m-921 -1121 c16 -15 25 -36 25 -55 0 -19 -9 -40 -25 -55 -15 -16 -36 -25 -55 -25 -19 0 -40 9 -55 25 -16 15 -25 36 -25 55 0 19 9 40 25 55 15 16 36 25 55 25 19 0 40 -9 55 -25z"/> <path d="M445 1266 c-41 -18 -84 -63 -106 -111 -17 -36 -19 -71 -19 -350 0 -178 4 -325 10 -346 15 -53 95 -125 148 -134 78 -13 122 2 178 59 32 33 53 65 57 85 4 19 7 170 7 338 0 331 -2 348 -58 406 -58 62 -148 83 -217 53z m104 -160 c8 -9 11 -100 9 -311 -3 -271 -5 -299 -20 -309 -13 -8 -23 -8 -35 0 -16 10 -18 38 -21 309 -2 307 0 325 38 325 10 0 23 -6 29 -14z"/> <path d="M1965 2226 c-41 -18 -84 -63 -106 -111 -17 -36 -19 -71 -19 -350 0 -178 4 -325 10 -346 15 -53 95 -125 148 -134 78 -13 122 2 178 59 32 33 53 65 57 85 4 19 7 170 7 338 0 331 -2 348 -58 406 -58 62 -148 83 -217 53z m104 -160 c8 -9 11 -100 9 -311 -3 -271 -5 -299 -20 -309 -13 -8 -23 -8 -35 0 -16 10 -18 38 -21 309 -2 307 0 325 38 325 10 0 23 -6 29 -14z"/></g></svg>
            </Link>
        </div>
    )
}



/* -- LoadProfile Component --> */
export default function LoadProfile({ setNickname }: { setNickname: Dispatch<SetStateAction<string | undefined>> })
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
      <div className='flex space-x-2'>
        <MatchHistory />
        <FriendsInbox />
        <Link href={'/profile'} className="flex items-center justify-between bg-blue-500 px-2 py-1 rounded-lg hover:bg-blue-700 transition-all duration-150">
          <Image className="rounded-full h-8 w-8 object-cover" src={user.image} alt="Profile Picture" width={100} height={100} />
          {nicknameProps.nickname === undefined ? <span className=" px-1 text-sm">{user.user_name}</span> : <span className=" px-1 text-sm">{nicknameProps.nickname}</span>}
        </Link>
      </div>
  )
}