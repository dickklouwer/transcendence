
"use client"

import Image from "next/image";
import { useState, useEffect } from "react";

import { userSocket } from "../profile_headers";
import { fetchGet } from "../fetch_functions";
import { DisplayUserStatus } from "../profile/page";
import { ExternalUser } from "@repo/db";



export const ExternalFriendsList = ({ userId }: { userId: number }) => {
  const [friendsList, setFriendsList] = useState<ExternalUser[]>([]);
  const [reload, setReload] = useState<boolean>(false);

  useEffect(() => {
    try {
      fetchGet<ExternalUser[]>(`/api/getApprovedFriendsById?id=${userId}`)
        .then((data) => {
          setFriendsList(data);
        });

      userSocket.on('statusChange', () => {
        setReload(prev => !prev);
      });

    } catch (error) {
      console.error("Error Getting Friends:", error);
    }

    return () => {
      userSocket.off('statusChange');
    };
  }, [reload, userId])

  return (
    <div className="container mx-auto">
      <div className="flex flex-wrap gap-4 max-h-60 overflow-x-scroll justify-center items-center">
        {friendsList.length === 0 && <p className="text-center text-1xl whitespace-nowrap">No friends :(</p>}
        {friendsList.map((user) => (
          <div key={user.intra_user_id} className="">
            <div className="flex flex-col w-[38rem] p-2 px-4 space-x-2 bg-slate-950 border-white rounded ">
              <div className="flex items-center space-x-4">
                {/* TODO: Image ratio isn't adjusted propperly */}
                <div className="relative">
                  <Image
                    src={user.image}
                    alt="Profile Image"
                    className="w-11 h-11 rounded-full"
                    width={100}
                    height={100}
                  />
                  <DisplayUserStatus state={user.state} width={15} height={15} />
                </div>
                <div className="min-w-0 p-1 break-all">
                  {user.nick_name === null ?
                    <h1 className="text-1xl">{user.user_name}</h1> :
                    <div>
                      <h1 className="text-1xl">{user.nick_name}</h1>
                    </div>
                  }
                  <p className="text-blue-400 break-all">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

}
