import { ChatSettings, ChatsUsers, ExternalUser } from '@repo/db';

import Image from "next/image";
import { useState, useEffect } from "react";

import { userSocket } from "../profile_headers";
import { DisplayUserStatus } from "../profile/page";
import { fetchGet } from "../fetch_functions";

enum Shifts {
  ADMIN = 0,
  OWNER = 1,
  BANNED = 3,
};

// find the correct ChatsUsers in from the ChatSettings
export function findChatsUsers(settings: ChatSettings, id: number): ChatsUsers {
  let chatUser: ChatsUsers = settings.userInfo[0];

  for (let i: number = 0; i < settings.userInfo.length; i++) {
    chatUser = settings.userInfo[i];
    if (chatUser.intra_user_id === id) break;
  }
  return chatUser;
}

// check if user is owner
export function isOwner(settings: ChatSettings, id: number): boolean {
  const user: ChatsUsers = findChatsUsers(settings, id);
  return (user.is_owner);
}

// check if user is admin
export function isAdmin(settings: ChatSettings, id: number): boolean {
  const user: ChatsUsers = findChatsUsers(settings, id);
  return (user.is_admin);
}

// Check if user is allowed to edit group
export function isEditor(settings: ChatSettings, id: number): boolean {
  if (isOwner(settings, id) || isAdmin(settings, id)) return true;
  return false;
}

export const OptionInviteList = (
  { selectedUsers, chatUsers, setSelectedUsers }:
    { selectedUsers: number[], chatUsers: number[], setSelectedUsers: React.Dispatch<React.SetStateAction<number[]>> }) => {

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
        {friendsList
          .filter(friend => !chatUsers.includes(friend.intra_user_id))
          .map((friend) => (
            <div key={friend.intra_user_id}>
              <div className="flex flex-row justify-between items-center p-2 px-4 space-x-2 bg-slate-950 border-white rounded">

                {/* Friend Info */}
                <div className="flex flex-col">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Image
                        src={friend.image}
                        alt="Profile Image"
                        className="w-11 h-11 rounded-full"
                        width={100}
                        height={100}
                      />
                      <DisplayUserStatus state={friend.state} width={15} height={15} />
                    </div>
                    <div className="min-w-0 p-1 break-all">
                      {friend.nick_name === null ? (
                        <h1 className="text-1xl">{friend.user_name}</h1>
                      ) : (
                        <h1 className="text-1xl">{friend.nick_name}</h1>
                      )}
                    </div>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  className={`flex size-15 p-5 w-1/5 rounded ${isInvited(friend.intra_user_id) ? "bg-green-800" : "bg-red-800"}`}
                  onClick={() => toggleInvite(friend.intra_user_id)} >
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
