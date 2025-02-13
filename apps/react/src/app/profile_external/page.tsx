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
  const [blocked, setBlocked] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const externalUserIdString = searchParams?.get('id');
  const Router = useRouter();

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
        setBlocked(res.blocked);
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
    console.log('Direct Message button clicked');
    
    const users: number[] = GetUserIds();

    console.log("users: ", users);

    if (users.length === 0) {
      console.log("Error: user not found");
      return;
    }

    const chatSettings: ChatSettings = {
      isPrivate: true,
      isDirect: true,
      userInfo: parseUserInfo([users[1]]),
      title: "No title",
      password: null,
      image: null,
    };

    // console.log("chatSettings old: ", chatSettings);
    // console.log("chatSettings new: ", { ChatSettings: {
    //   isPrivate: true,
    //   isDirect: true,
    //   userInfo: [users[1]],
    //   title: "No title",
    //   password: null,
    //   image: null,
    // } });
    // console.log("users: ", users);

    fetchGet<number>(`/api/getChatIdOfDm?external_user_id=${users[1]}`)
      .then((chatId) => {
        console.log("ChatId: ", chatId);
        if (chatId > 0) {
          console.log("Chat already exists, chatId: ", chatId);
          Router.push(`/messages?chat_id=${chatId}`);
        } else if (externalUser?.intra_user_id !== undefined) {
          console.log("Chat does not exist, create one");
          fetchPost("/api/createChat", { ChatSettings: {
            isPrivate: true,
            isDirect: true,
            userInfo: parseUserInfo([users[1]]),
            title: "No title",
            password: null,
            image: null,
          }})
            .then((res) => {
              const result = res as { chat_id: number; message: string; };
              if (result.chat_id === undefined) {
                console.log("Error: chat_id is undefined", res);
                Router.push(`/messages?chat_id=-1`);
              } else {
                console.log("Direct Chat Created with chat_id: ", result.chat_id);
                Router.push(`/messages?chat_id=${result.chat_id}`);
              }
            })
            .catch((error) => {
              console.log(`Error Creating Direct Chat`, error);
            });
        }
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  }

  if (loading)
    return <div>Loading...</div>;
  if (!externalUser)
    return <div>Could not load user</div>;

  const setBlockedUser = async () => {
    console.log('Block User');
    await fetchPost("/api/blockUser", { blocked_user_id: externalUser.intra_user_id })
      .then((res) => {
        setBlocked(true);
      })
      .catch((error) => {
        console.log('Error: ', error);
      })
  }

  const removeBlockedUser = async () => {
    console.log('UnBlock User');
    await fetchPost("/api/unblockUser", { blocked_user_id: externalUser.intra_user_id })
      .then((res) => {
        setBlocked(false);
      })
      .catch((error) => {
        console.log('Error: ', error);
      })
  }

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
          {blocked == false ?
          <div>
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
            <div className="flex justify-center items-center  bg-red-500 hover:bg-red-700 transition-all duration-150 px-2 py-1 m-4 rounded-lg">
              <button className="flex justify-center items-center"
                onClick={setBlockedUser}>
              <svg className="flex w-8 h-8" fill="#ffffff" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> 
                <path d="M21,5V4h-1V3h-1V2H5v1H4v1H3v1H2v14h1v1h1v1h1v1h14v-1h1v-1h1v-1h1V5H21z M20,17h-3v-2h-2v-2h-2v-2h-2V9H9V7H7V4h10v1h1v1h1 v1h1V17z M6,19v-1H5v-1H4V7h1v2h2v2h2v2h2v2h2v2h2v2h2v1H7v-1H6z"></path> </g></svg>
                <h1 className="px-5 text-2xl text-white">Block User :(</h1>
            </button>
            </div>
          </div>
          :
          <div>
            <div className="flex justify-center items-center px-2 py-1 m-4 rounded-lg bg-red-500 hover:bg-red-700 transition-all duration-150">
            <button className="flex justify-center items-center"
            disabled={true}>
              <svg className="w-8 h-8 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1v2a1 1 0 0 0 1.707.707L9.414 13H15a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M8.023 17.215c.033-.03.066-.062.098-.094L10.243 15H15a3 3 0 0 0 3-3V8h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1v2a1 1 0 0 1-1.707.707L14.586 18H9a1 1 0 0 1-.977-.785Z" clipRule="evenodd" />
              </svg>
              <h1 className="px-5 text-2xl text-white">Direct Message</h1>
            </button>
          </div>
            <div className="flex justify-center items-center  bg-green-500 hover:bg-green-700 transition-all duration-150 px-2 py-1 m-4 rounded-lg">
            <button className="flex justify-center items-center"
              onClick={removeBlockedUser}>
                <svg className="flex w-8 h-8" fill="#ffffff" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> 
                <path d="M21,5V4h-1V3h-1V2H5v1H4v1H3v1H2v14h1v1h1v1h1v1h14v-1h1v-1h1v-1h1V5H21z M20,17h-3v-2h-2v-2h-2v-2h-2V9H9V7H7V4h10v1h1v1h1 v1h1V17z M6,19v-1H5v-1H4V7h1v2h2v2h2v2h2v2h2v2h2v2h2v1H7v-1H6z"></path> </g></svg>
                <h1 className="px-5 text-2xl text-white">UnBlock User :)</h1>
            </button>
            </div>
          </div>
        }


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
