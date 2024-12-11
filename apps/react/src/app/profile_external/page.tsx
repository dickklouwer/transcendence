"use client"

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { fetchGet } from "../fetch_functions";
import { ExternalUser } from "@repo/db"
//import { FriendsList } from "../profile/form_components";
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

  /*
   *
   */
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

