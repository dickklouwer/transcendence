import { ExternalUser } from '@repo/db';

import Image from "next/image";
import { useState, useEffect } from "react";

import { userSocket } from "../profile_headers";
import { DisplayUserStatus } from "../profile/page";
import { fetchGet } from "../fetch_functions";

export const NewInviteList = ({ selectedUsers, setSelectedUsers }: { selectedUsers: number[], setSelectedUsers: React.Dispatch<React.SetStateAction<number[]>> }) => {

    const [friendsList, setFriendsList] = useState<ExternalUser[]>([]);
    const [reload, setReload] = useState<boolean>(false);
  
    useEffect(() => {
      try {
        fetchGet<ExternalUser[]>("/api/getApprovedFriends")
          .then((data) => {
            setFriendsList(data);
          });
          
        userSocket.on('statusChange', () => {
          setReload((prev) => !prev);
        });
      } catch (error) {
        console.error("Error Getting Friends:", error);
      }
  
      return () => {
        userSocket.off('statusChange');
      };
    }, [reload]);
  
    const isInvited = (id: number) => {
      return selectedUsers.includes(id);
    };
  
    const toggleInvite = (id: number) => {
      if (isInvited(id)) {
        // Remove user from the selected list
        setSelectedUsers((prev) => prev.filter((userId) => userId !== id));
      } else {
        // Add user to the selected list
        setSelectedUsers((prev) => [...prev, id]);
      }
    };
  
    return (
      <div className="container mx-auto">
        <div className="flex flex-col gap-4 max-h-100 overflow-y-auto">
          {friendsList.length === 0 && <p className="text-center text-1xl whitespace-nowrap">No friends :(</p>}
          {friendsList.map((user) => (
            <div key={user.intra_user_id}>
              <div className="flex flex-row justify-between items-center w-[30rem] p-2 px-4 space-x-2 bg-slate-950 border-white rounded">
  
                {/* Friend Info */}
                <div className="flex flex-col">
                  <div className="flex items-center space-x-4">
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
                      {user.nick_name === null ? (
                        <h1 className="text-1xl">{user.user_name}</h1>
                      ) : (
                        <h1 className="text-1xl">{user.nick_name}</h1>
                      )}
                    </div>
                  </div>
                </div>
  
                {/* TODO: Add svg to Button */}
                {/* Toggle Button */}
                <button
                  className={`flex size-15 p-5 rounded ${isInvited(user.intra_user_id) ? "bg-green-800": "bg-red-800"}`}
                  onClick={() => toggleInvite(user.intra_user_id)} >
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };