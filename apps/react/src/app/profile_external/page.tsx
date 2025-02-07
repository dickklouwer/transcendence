"use client"

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";

import { fetchGet, fetchPost } from "../fetch_functions";
import { User, ExternalUser, ChatSettings, ChatsUsers } from "@repo/db"
import { ExternalFriendsList } from "./form_components";
import { DisplayUserStatus } from "../profile/page";
import { useRouter } from 'next/navigation';

export default function ProfileExternalPage() {
  const [user, setUser] = useState<User>();
  const [externalUser, setExternalUser] = useState<ExternalUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const externalUserIdString = searchParams?.get('id');

  useEffect(() => {
      fetchGet<User>('api/profile')
        .then((user) => {
            setUser(user);
        })
        .catch((error) => {
            console.log('Error: ', error);
        });
    fetchGet<ExternalUser>(`/api/getExternalUser?id=${externalUserIdString}`)
      .then((res) => {
        console.log('FE - ExternalUser: ', res);
        setExternalUser(res);
        setLoading(false);
      })
      .catch((error) => {
        console.log('Error: ', error);
        setLoading(false);
      })
  }, [externalUserIdString]);

  function parseUserInfo(users: number[]) : ChatsUsers[]
  {
    let list: ChatsUsers[] = [];

    for (const user of users) {
      const hit : ChatsUsers = {
        intra_user_id: user,
        chat_id: 0,
        chat_user_id: 0,
        is_owner: false,
        is_admin: false,
        is_banned: false,
        mute_untill: null,
        joined: false,
        joined_at: null,
      };
      list.push(hit);
    }
    return list;
  }

  function GetUserIds() : number[] {
    let ownUserId: number | undefined = undefined;
    let externalUserId: number | undefined = undefined;

    ownUserId = user?.intra_user_id;
    externalUserId = externalUser?.intra_user_id;

    if (ownUserId === undefined) {
      console.log("Error: ownUserId is undefined");
      return [];
    }

    if (externalUserId === undefined) {
      console.log("Error: externalUserId is undefined");
      return [];
    }

    const users: number[] = [
      ownUserId,
      externalUserId
    ];

    return users;
  }

  function GoToDirectMessage() {
    // const Router = useRouter();
    
    const users: number[] = GetUserIds();

    if (users.length === 0) {
      console.log("Error: user not found");
      return;
    }

    // TODO: check if chat already exists

    if (false) { // if chat not exists
      console.log('ChatSettings: ', chatSettings);
  
      fetchPost("/api/createChat", { ChatSettings: chatSettings })
        .then(() => {
          console.log("Group Chat Created");
        })
        .catch((error) => {
          console.log("Error Creating Group Chat", error);
  
        });

      const chatSettings: ChatSettings = {
        isPrivate: true,
        isDirect: true,
        userInfo: parseUserInfo(users),
        title: "No title",
        password: null,
        image: null,
      };
    }


    // Router.push("/messages?chat_id=");

    console.log('Direct Message button clicked');
  }

  if (loading)
    return <div>Loading...</div>;
  if (!externalUser)
    return <div>Could not load user</div>;

  //NOTE: Need to see if i can get normal FriendsList working withtout reworking the entire function get @jmeruma
  //      see ./form_components.tsx for ExternalFriendlist component
  //      PS: The DisplayUserStatus component is not working as intended, or i'm not sure what is up.
  return (
    <div>
      <div className="flex flex-grow justify-center space-x-12 ">
        <div className="bg-slate-900 rounded-lg py-4 max-w-2xl ">
          <div>
            <h1 className="text-2xl tracking-tight text-center text-white">Profile</h1>
            <p className="w-auto text-center whitespace-nowrap pb-4 ">&#60;--------------&#62;</p>
          </div>

          <div className="flex justify-start items-center space-x-4 p-4 m-2 w-[35rem]">
            <div className="relative">
              <Image
                src={externalUser.image}
                alt="Profile Image"
                width={100}
                height={100}
                className="min-w-24 min-h-24 max-w-24 max-h-24 rounded-full object-cover"
              />
              <DisplayUserStatus state={'Online'} width={20} height={20} />
            </div>
            <div className="">
              {externalUser.nick_name !== null ?
                <h1 className="text-2xl break-words w-auto">
                  {externalUser.nick_name} aka ({externalUser.user_name})
                </h1>
                :
                <h1 className="text-2xl break-words w-auto">
                  {externalUser.user_name}
                </h1>
              }
              <p className="text-blue-400 break-all ">{externalUser.email}</p>
            </div>
          </div>

          {/* TODO:
              [] Button Direct Message
                [] Different location.
                [] Link to message?chat_id={id}
          */}
          <div className="flex justify-center items-center px-2 py-1 m-4 rounded-lg bg-blue-500 hover:bg-blue-700 transition-all duration-150">
            <button className="flex justify-center items-center"
            onClick={() => GoToDirectMessage()}>
              <svg className="w-8 h-8 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1v2a1 1 0 0 0 1.707.707L9.414 13H15a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M8.023 17.215c.033-.03.066-.062.098-.094L10.243 15H15a3 3 0 0 0 3-3V8h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1v2a1 1 0 0 1-1.707.707L14.586 18H9a1 1 0 0 1-.977-.785Z" clipRule="evenodd" />
              </svg>
              <h1 className="px-5 text-2xl text-white">Direct Message</h1>
            </button>
          </div>
          {/* TODO:
              [] Button Block User 
                [] Different location.
                [] if user is blocked, show unblock button.
          */}
          <div className="flex justify-center items-center  bg-red-500 hover:bg-red-700 transition-all duration-150 px-2 py-1 m-4 rounded-lg">
            <button className="flex justify-center items-center"
              onClick={() => console.log('Block User')}>
            <svg className="flex w-8 h-8" fill="#ffffff" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> 
              <path d="M21,5V4h-1V3h-1V2H5v1H4v1H3v1H2v14h1v1h1v1h1v1h14v-1h1v-1h1v-1h1V5H21z M20,17h-3v-2h-2v-2h-2v-2h-2V9H9V7H7V4h10v1h1v1h1 v1h1V17z M6,19v-1H5v-1H4V7h1v2h2v2h2v2h2v2h2v2h2v2h2v1H7v-1H6z"></path> </g></svg>
              <h1 className="px-5 text-2xl text-white">Block User :(</h1>
          </button>
          </div>


          <div className="flex justify-center items-center ">
            <div className="p-4 m-2 bg-slate-800 rounded-lg w-23">
              <h1 className="text-2xl text-center text-white">Friends</h1>
              <p className="w-auto text-center whitespace-nowrap pb-4 ">&#60;--------------&#62;</p>
              <ExternalFriendsList userId={externalUser.intra_user_id} />
            </div>
          </div>

          <div className="flex justify-center ">
            <div className="flex justify-center p-4 m-2 w-11/12 text-white rounded-lg bg-blue-500 hover:bg-blue-600 ">
              <Link href="/menu">Back to Menu</Link>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-8 max-w-2xl  w-1/2">
          <h1 className="text-2xl text-center">Match History</h1>
          <p className="w-auto text-center whitespace-nowrap pb-4 ">&#60;--------------&#62;</p>
        </div>

      </div>
    </div>
  );
}

/*
 <div className="">
 </div>


<div className="flex-grow min-w-0 mb-4">
  {nicknameContext.nickname === undefined ? (
  <h1 className="text-2xl">{user.user_name}</h1>
  ) : (
  <h1 className="text-2xl break-words w-auto">
    {nicknameContext.nickname} aka ({user.user_name}
    )
  </h1>
  )}
  <p className="text-blue-400 break-all ">{user.email}</p>
</div>
*/

