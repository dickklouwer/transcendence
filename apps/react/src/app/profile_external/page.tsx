"use client"

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";

import { fetchGet } from "../fetch_functions";
import { ExternalUser } from "@repo/db"
import { ExternalFriendsList } from "./form_components";
import { DisplayUserStatus } from "../profile/page";

export default function ProfileExternalPage() {
  const [externalUser, setExternalUser] = useState<ExternalUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const userId = searchParams?.get('id');

  useEffect(() => {
    fetchGet<ExternalUser>(`/api/getExternalUser?id=${userId}`)
      .then((res) => {
        setExternalUser(res);
        setLoading(false);
        console.log('ExternalUser: ', res);
      })
      .catch((error) => {
        console.log('Error: ', error);
        setLoading(false);
      })
  }, [userId]);


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
              <h1 className="text-2xl break-words w-auto">
                {externalUser.nick_name} aka ({externalUser.user_name})
              </h1>
              <p className="text-blue-400 break-all ">{externalUser.email}</p>
            </div>
          </div>

          {/* TODO:
              [] Button Direct Message
                [] Different location.
                [] Link to message?chat_id={id}
          */}
          <div>
            <Link href={'/chats'} className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-blue-700 transition-all duration-150">
              <button className="flex justify-center item-center bg-slate-500 rounded-lg hover:bg-blue-600 ">
                <svg className="w-8 h-8 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M4 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1v2a1 1 0 0 0 1.707.707L9.414 13H15a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M8.023 17.215c.033-.03.066-.062.098-.094L10.243 15H15a3 3 0 0 0 3-3V8h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1v2a1 1 0 0 1-1.707.707L14.586 18H9a1 1 0 0 1-.977-.785Z" clipRule="evenodd" />
                </svg>
              </button>
            </Link>
          </div>

          {/* TODO:
              [] Button Block User 
                [] Different location.
                [] if user is blocked, show unblock button.
          */}
          <div>
            <Link href={'/chats'} className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-blue-700 transition-all duration-150">
              <button className="flex justify-center item-center bg-slate-500 rounded-lg hover:bg-blue-600 ">
                <svg className="w-8 h-8 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 40 40">
                  <path id="XMLID_783_" d="M223,116.75c-34.488,0-65.144,16.716-84.297,42.47c-7.763-1.628-15.695-2.47-23.703-2.47 c-63.411,0-115,51.589-115,115c0,8.284,6.716,15,15,15h125.596c19.247,24.348,49.031,40,82.404,40c57.897,0,105-47.103,105-105 S280.897,116.75,223,116.75z M31.325,256.75c7.106-39.739,41.923-70,83.675-70c2.965,0,5.914,0.165,8.841,0.467 c-3.779,10.82-5.841,22.44-5.841,34.533c0,12.268,2.122,24.047,6.006,35H31.325z M223,296.75c-41.355,0-75-33.645-75-75 s33.645-75,75-75s75,33.645,75,75S264.355,296.75,223,296.75z" />
                  <path id="XMLID_787_" d="M253,206.75h-60c-8.284,0-15,6.716-15,15c0,8.284,6.716,15,15,15h60c8.284,0,15-6.716,15-15 C268,213.466,261.284,206.75,253,206.75z" />
                  <path id="XMLID_788_" d="M115,126.75c34.601,0,62.751-28.149,62.751-62.749C177.751,29.4,149.601,1.25,115,1.25 c-34.601,0-62.75,28.15-62.75,62.751C52.25,98.601,80.399,126.75,115,126.75z M115,31.25c18.059,0,32.751,14.692,32.751,32.751 c0,18.058-14.692,32.749-32.751,32.749c-18.059,0-32.75-14.691-32.75-32.749C82.25,45.942,96.941,31.25,115,31.25z" />
                </svg>
              </button>
            </Link>
          </div>

          <div className="flex justify-center items-center ">
            <div className="p-4 m-2 bg-slate-800 rounded-lg w-11/12">
              <h1 className="text-2xl text-center text-white">Friends</h1>
              <p className="w-auto text-center whitespace-nowrap pb-4 ">&#60;--------------&#62;</p>
              <ExternalFriendsList userId={externalUser.intra_user_id} />
            </div>
          </div>

          <div className="flex justify-center ">
            <div className="flex justify-center p-4 m-2 w-11/12 bg-slate-500 text-white rounded-lg hover:bg-blue-600 ">
              <Link href="/menu" className=" ">Back to Menu</Link>
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

