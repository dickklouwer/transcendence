"use client"

import { ChatSettings, ExternalUser, ChatsUsers, User } from '@repo/db';
import { useSearchParams, useRouter } from 'next/navigation';

import Link from 'next/link';
import Image from "next/image";
import { DisplayUserStatus } from "../profile/page";
import { fetchGet, fetchPost } from '../fetch_functions';
import { useState, useEffect } from 'react';
import { isAdmin, hasAdmin, isOwner, hasOwner, isBanned, isEditor, findChatsUsers, OptionInviteList } from './functions';

export default function GroupOptionPage() {

  const Router = useRouter();
  const searchParams = useSearchParams();
  const chatId: number = searchParams?.get('chatId');

  const [isLoading, setIsLoading] = useState<boolean>(true);

  {/* Settings that should be set */ }
  const [pageUser, setPageUser] = useState<User>();
  const [updatedChatSettings, setUpdatedChatSettings] = useState<ChatSettings>();
  const [pageSettings, setPageChatSettings] = useState<ChatSettings>();
  const [chatUsers, setChatUsers] = useState<ExternalUser[]>();

  const [title, setTitle] = useState<string>("");
  const [isPrivate, setChannelType] = useState<boolean>(true);
  const [hasPassword, setHasPassword] = useState<boolean>(false);

  {/* Settings we don't want to set from  */ }
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [addedUsers, setAddedUsers] = useState<number[]>([]);
  const [removedUsers, setRemovedUsers] = useState<number[]>([]);
  const [muted, setMuted] = useState<number[]>([]);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update the state with the selected value
    setChannelType(event.target.value === "true" ? true : false);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const settings: ChatSettings = await fetchGet<ChatSettings>(`/api/getChatSettings?chatId=${chatId}`);
        const users: ExternalUser[] = await fetchGet<ExternalUser[]>(`/api/getExternalUsersFromChat?chatId=${chatId}`);
        fetchGet<User>('api/profile')
          .then((user) => { setPageUser(user); })
          .catch((error) => {
            console.log('Error: ', error);
          });

        setUpdatedChatSettings(settings);
        setPageChatSettings(JSON.parse(JSON.stringify(settings)));
        setTitle(settings.title);
        setChannelType(settings.isPrivate);
        setHasPassword(settings.password !== null);

        setChatUsers(users);
      }
      catch (error) {
        console.error("Error Fetching Chat Settings:", error);
      }
      finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [chatId]);

  if (isLoading) return <p>Loading...</p>
  if (updatedChatSettings === undefined || chatUsers === undefined || pageUser === undefined) {
    return (
      <div>
        <p>Invalid Data</p>
        <Link className="flex justify-center p-4 m-2 w-11/12 bg-slate-800 text-white rounded-lg hover:bg-slate-600 " href="/chats">
          Back
        </Link>
      </div>
    );
  }

  function toggleOwner(id: number) {
    if (updatedChatSettings === undefined) return;
    const settings: ChatSettings = { ...updatedChatSettings };

    const user: ChatsUsers = findChatsUsers(settings, id);
    user.is_owner = !user.is_owner;

    setUpdatedChatSettings(settings);
  }

  function toggleAdmin(id: number) {
    if (updatedChatSettings === undefined) return;
    const settings: ChatSettings = { ...updatedChatSettings };

    const user: ChatsUsers = findChatsUsers(settings, id);
    user.is_admin = !user.is_admin;

    setUpdatedChatSettings(settings);
  }

  //TODO: check when user gets banned they can be reinvited or unbanned
  function toggleBanned(id: number) {
    if (updatedChatSettings === undefined) return;
    const settings: ChatSettings = { ...updatedChatSettings };

    const user: ChatsUsers = findChatsUsers(settings, id);
    user.is_banned = !user.is_banned;

    setUpdatedChatSettings(settings);
  }

  const isKicked = (id: number) => {
    return removedUsers.includes(id);
  };

  const toggleKick = (id: number) => {
    if (isKicked(id)) {
      // Remove user from the selected list
      setRemovedUsers((prev) => prev.filter((userId) => userId !== id));
    } else {
      // Add user to the selected list
      setRemovedUsers((prev) => [...prev, id]);
    }
  };

  const mutePlayer = (intraID: number) => {

    if (!muted.includes(intraID))
      setMuted((prevMuted) => [...prevMuted, intraID]);

    fetchPost("api/muteOneDay", {
      chatID: chatId,
      intraID: intraID,
    })
      .then(() => { { } })
      .catch((error) => {
        console.log("Error Creating Group Chat", error);
      });
  }

  function LeaveChat() {
    fetchPost("api/removeChatUser", {
      chatID: chatId,
      userID: pageUser?.intra_user_id,
    })
      .then(() => { { } })
      .catch((error) => {
        console.log("Error Creating Group Chat", error);
      });
  }

  function UpdateSettings() {
    if (!updatedChatSettings) return;
    
    const sendChatSettings: ChatSettings = {
      title: title,
      isDirect: false,
      isPrivate: isPrivate,
      userInfo: updatedChatSettings?.userInfo,
      password: null,
      image: null,
    };
    if (!hasOwner(sendChatSettings.userInfo)) {
      alert("Chat needs to have atleast one Owner");
      return;
    }
    if (!hasAdmin(sendChatSettings.userInfo)) {
      alert("Chat needs to have atleast one Admin");
      return;
    }

    fetchPost("api/updateChatSettings", {
      chatId: chatId,
      oldPWD: oldPassword,
      newPWD: newPassword,
      updatedChatSettings: sendChatSettings,
      addedUsers: addedUsers,
      removedUsers: removedUsers,
    })
      .then(() => { { } })
      .catch((error) => {
        console.log("Error Creating Group Chat", error);
      });
    Router.push(`/messages?chat_id=${chatId}`);
  }

  return (
    <div className="flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col items-center flex-grow space-x-4">
        <h1 >Options Group Channel</h1>
        <div className="flex flex-row justify-center space-x-4">

          <div className="flex flex-col">
            <div className="flex flex-col bg-slate-900 w-[50rem] rounded p-2">
              {/* ChatUsers List */}
              <h1 className="flex justify-center">Chat Users</h1>
              <div className="flex flex-col gap-4 overflow-y-auto">
                <div className="flex flex-row justify-between items-center p-2 px-4 space-x-2 bg-blue-950 rounded">
                  <p className="flex justify-center text-1xl w-2/5">User</p>
                  <div className='flex justify-between w-3/5'>
                    <p className="text-xs">Admin</p>
                    <p className="text-xs">Owner</p>
                    <p className="text-xs">Kick</p>
                    <p className="text-xs">Ban</p>
                    <p className="text-xs">
                      <span className="block">1 day</span>
                      <span className="block">Mute</span>
                    </p>
                  </div>
                </div>
                {chatUsers.length === 0 && <p className="text-center text-1xl whitespace-no-rap">No Users</p>}
                {chatUsers.map((user) => (
                  <div key={user.intra_user_id}>
                    <div className="flex flex-row justify-between items-center p-2 px-4 space-x-2 bg-slate-950 rounded">
                      <div className="flex flex-col w-2/5">
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
                            {user.nick_name === null ?
                              (<h1 className="text-1xl">{user.user_name}</h1>) :
                              (<h1 className="text-1xl">{user.nick_name}</h1>)
                            }
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-row justify-around w-3/5 space-x-10'>
                        <button // Admin
                          className={`flex size-15 p-5 w-1/10 rounded ${isAdmin(updatedChatSettings, user.intra_user_id) ? "bg-green-800" : "bg-red-800"}`}
                          onClick={() => toggleAdmin(user.intra_user_id)}
                          disabled={!isEditor(pageSettings, pageUser.intra_user_id)} >
                        </button>
                        <button // Owner
                          className={`flex size-15 p-5 w-1/10 rounded ${isOwner(updatedChatSettings, user.intra_user_id) ? "bg-green-800" : "bg-red-800"}`}
                          onClick={() => toggleOwner(user.intra_user_id)}
                          disabled={!isOwner(pageSettings, pageUser.intra_user_id)} >
                        </button>
                        <button // Kick
                          className={`flex size-15 p-5 w-1/10 rounded ${isKicked(user.intra_user_id) ? "bg-green-800" : "bg-red-800"}`}
                          onClick={() => toggleKick(user.intra_user_id)}
                          disabled={!isEditor(updatedChatSettings, pageUser.intra_user_id)}
                          style={{ visibility: user.intra_user_id !== pageUser.intra_user_id ? "visible" : "hidden" }}>
                        </button>
                        <button // Ban
                          className={`flex size-15 p-5 w-1/10 rounded ${isBanned(updatedChatSettings, user.intra_user_id) ? "bg-green-800" : "bg-red-800"}`}
                          onClick={() => toggleBanned(user.intra_user_id)}
                          disabled={!isEditor(updatedChatSettings, pageUser.intra_user_id)}
                          style={{ visibility: user.intra_user_id !== pageUser.intra_user_id ? "visible" : "hidden" }}>
                        </button>
                        <button // mute
                          className={`flex size-15 p-5 w-1/10 rounded ${muted.includes(user.intra_user_id) ? "bg-teal-800" : "bg-blue-800"}`}
                          onClick={() => mutePlayer(user.intra_user_id)}
                          disabled={!isEditor(updatedChatSettings, pageUser.intra_user_id)}
                          style={{ visibility: user.intra_user_id !== pageUser.intra_user_id ? "visible" : "hidden" }}>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isEditor(pageSettings, pageUser.intra_user_id) &&
              <div className="flex flex-col bg-slate-900 rounded p-2 my-3">
                <h1 className="flex justify-center">Invite List</h1>
                <div className="flex flex-col gap-4 overflow-y-auto">
                  <div className="flex flex-row justify-between items-center p-2 px-4 space-x-2 bg-blue-950 rounded">
                    <p className="flex justify-center text-1xl w-3/5">User</p>
                    <div className='flex justify-around w-1/5'>
                      <p className="text-xs">Add User</p>
                    </div>
                  </div>
                  {/* Invite Users List */}
                  <OptionInviteList selectedUsers={addedUsers} chatUsers={joinUserID(pageSettings?.userInfo)} setSelectedUsers={setAddedUsers} />
                </div>
              </div>
            }
          </div>
          <div className="flex flex-col items-center justify-center">

            {/* Chat Title */}
            <div className='flex flex-col w-[25rem] justify-center bg-slate-800 rounded p-1'>
              <div className="flex flex-row justify-between">
                <p className="p-1">Title:</p>
                <input
                  className="bg-slate-600 rounded w-4/5 p-1"
                  type="text"
                  id="TitleField"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  readOnly={!isEditor(pageSettings, pageUser.intra_user_id)}
                />
              </div>

              {/* Chat Type - Radio Button - public/private */}
              <div className="flex flex-row items-center p-1">
                <p className="flex flex-grow justify-start p-1">Private:</p>
                <input type="radio" name="channelType" value="true"
                  checked={isPrivate}
                  onChange={handleRadioChange}
                  className="flex items-center w-5 h-5 "
                  readOnly={!isEditor(pageSettings, pageUser.intra_user_id)}
                />
              </div>
              <div className="flex flex-row items-center ">
                <p className="flex flex-grow justify-start p-1">Public:</p>
                <input type="radio" name="channelType" value="false"
                  checked={!isPrivate}
                  onChange={handleRadioChange}
                  className="flex items-center w-5 h-5 "
                  readOnly={!isEditor(pageSettings, pageUser.intra_user_id)}
                />
              </div>

              {/* Password */}
              <div className="flex flex-row justify-between items-center">
                <p className="p-1">Password:</p>
                <input type="checkbox" name="hasPassword"
                  checked={hasPassword}
                  onChange={() => setHasPassword(!hasPassword)}
                  className="flex w-5 h-5"
                  readOnly={!isEditor(pageSettings, pageUser.intra_user_id)}
                />
              </div>
              <div className="flex flex-col justify-between"
                style={{ visibility: hasPassword ? "visible" : "hidden" }}>
                {
                  pageSettings?.password?.length &&  // only show oldpwd when required
                  <div className="flex justify-between flex-row items-center">
                    <div className=" p-1" onClick={() => setShowOldPassword(!showOldPassword)}>
                      {showOldPassword ? "hide" : "show"}
                    </div>
                    <input
                      className="bg-slate-600 rounded w-4/5 p-1"
                      type={showOldPassword ? "text" : "password"}
                      id="OldPasswordField"
                      placeholder=" Old Password"
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>
                }
                <div className="flex justify-between flex-row items-center">
                  <div className=" p-1" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? "hide" : "show"}
                  </div>
                  <input
                    className="bg-slate-600 rounded w-4/5 p-1"
                    type={showNewPassword ? "text" : "password"}
                    id="NewPasswordField"
                    placeholder=" New Password"
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <Link className="flex justify-center p-4 m-2 w-1/2 bg-red-800 text-white rounded-lg hover:bg-red-600"
              onClick={() => LeaveChat()} href={'/chats'}>
              Leave Chat
            </Link>
            < div className="flex flex-row justify-center">
              {/* Cancel Button should just go back */}
              <Link className="flex justify-center p-4 m-2 w-11/12 bg-slate-800 text-white rounded-lg hover:bg-slate-600 "
                href={`/messages?chat_id=${chatId}`}>
                Back
              </Link>
              {/* Create Button should update chat and go back to the messages */}
              {isEditor(pageSettings, pageUser.intra_user_id) &&
                <div className="flex justify-center p-4 m-2 w-11/12 bg-blue-500 text-white rounded-lg hover:bg-blue-700 " >
                  <button onClick={UpdateSettings} >
                    Apply
                  </button>
                </div>
              }
            </div>

          </div>
        </div >
      </div >

      {/* Debug Box
      < div className="flex flex-col text-left justify-center" >
        <p>PageSettings:</p>
        <p>| ChatUsers: {joinUserID(pageSettings?.userInfo).join(", ")}</p>
        <p>| Permissions: {joinPerms(pageSettings?.userInfo).join(", ")}</p>
        <p>_</p>
        <p>Updated:</p>
        <p>| Title: {title}</p>
        <p>| isPrivate: {isPrivate}</p>
        <p>| Has Password: {hasPassword ? "True" : "False"}</p>
        <p>| Old Password: {showOldPassword ? "Show" : "Hide"} {oldPassword}</p>
        <p>| New Password: {showNewPassword ? "Show" : "Hide"} {newPassword}</p>
        <p>| Selected Users: {joinUserID(updatedChatSettings?.userInfo).join(", ")}</p>
        <p>| Added Users: {addedUsers.join(", ")}</p>
        <p>| Removed Users: {removedUsers.join(", ")}</p>
        <p>| Permissions: {joinPerms(updatedChatSettings?.userInfo).join(", ")}</p>
      </div >
      */}
    </div >
  ); // End of return

  {/* Debug Functions */ }
  function joinPerms(list: ChatsUsers[]): number[] {
    var arr: number[] = [];
    for (const user of list) {
      const perm: number = 0 +
        (user.is_owner ? 1 : 0) +
        (user.is_admin ? 2 : 0) +
        (user.is_banned ? 3 : 0);
      arr.push(perm);
    }
    return (arr);
  }

  function joinUserID(list: ChatsUsers[]): number[] {
    var arr: number[] = [];
    for (const user of list) {
      if (user.intra_user_id == null) continue;
      arr.push(user.intra_user_id);
    }
    return (arr);
  }
}
