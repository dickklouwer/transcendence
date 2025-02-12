"use client"

import { ChatSettings, ExternalUser, ChatsUsers, User } from '@repo/db';
import { useSearchParams } from 'next/navigation';

import Link from 'next/link';
import Image from "next/image";
import { DisplayUserStatus } from "../profile/page";
import { fetchGet, fetchPost } from '../fetch_functions';
import { useState, useEffect } from 'react';
import { isAdmin, isOwner, isEditor, findChatsUsers } from './functions';

export default function GroupOptionPage() {

  const searchParams = useSearchParams();
  const chatId = searchParams?.get('chatId');

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [pageUser, setPageUser] = useState<User>();
  const [updatedChatSettings, setUpdatedChatSettings] = useState<ChatSettings>();
  const [pageSettings, setPageChatSettings] = useState<ChatSettings>();
  const [chatUsers, setChatUsers] = useState<ExternalUser[]>();

  const [title, setTitle] = useState<string>("");
  const [isPrivate, setChannelType] = useState<boolean>(true);
  const [hasPassword, setHasPassword] = useState<boolean>(false);
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");

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

  function UpdateSettings() {
    //TODO: validate given input.

    const addedUsers: number[] = [1, 2, 3];

    fetchPost("api/updateChat", {
        updatedChatSettings : updatedChatSettings,
        addedUsers : addedUsers ,
        oldPWD: oldPassword,
        newPWD: newPassword,
      })
    .then(() => {{}})
    .catch((error) => {
      console.log("Error Creating Group Chat", error);
    });
  }

  return (
    <div className="flex flex-col w-5/6">
      {/* HEADER */}
      <div className="flex flex-col items-center flex-grow space-x-4">
        <h1 >Options Group Channel</h1>
        <div className="flex flex-row justify-center space-x-4">

          {/* Friendlist */}
          {/* TODO: Still need to be able to add, kick and ban user to the chat */}
          <div className="flex flex-col bg-slate-900 rounded p-2">
            <h1 className="flex justify-center">Chat Users</h1>
            <div className="flex flex-col gap-4 max-h-100 w-[40rem] overflow-y-auto">
              <div className="flex flex-row justify-between items-center p-2 px-4 space-x-2 bg-blue-950 rounded">
                <p className="flex justify-center text-1xl w-3/5">User</p>
                <div className='flex justify-around w-2/5'>
                  <p className="text-xs">Admin</p>
                  <p className="text-xs">Owner</p>
                </div>
              </div>
              {chatUsers.length === 0 && <p className="text-center text-1xl whitespace-no-rap">No Users</p>}
              {chatUsers.map((user) => (
                <div key={user.intra_user_id}>
                  <div className="flex flex-row justify-between items-center p-2 px-4 space-x-2 bg-slate-950 rounded">
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
                          {user.nick_name === null ? 
                            ( <h1 className="text-1xl">{user.user_name}</h1> ) :
                            ( <h1 className="text-1xl">{user.nick_name}</h1> )
                          }
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-row justify-around w-2/5 space-x-10'>
                        <button
                          className={`flex size-15 p-5 rounded ${isAdmin(updatedChatSettings, user.intra_user_id) ? "bg-green-800": "bg-red-800"}`}
                          onClick={() => toggleAdmin(user.intra_user_id)}
                          disabled={!isEditor(updatedChatSettings, pageUser.intra_user_id)} >
                        </button>
                        <button
                          className={`flex size-15 p-5 rounded ${isOwner(updatedChatSettings, user.intra_user_id) ? "bg-green-800": "bg-red-800"}`}
                          onClick={() => toggleOwner(user.intra_user_id)}
                          disabled={!isOwner(updatedChatSettings, pageUser.intra_user_id)} >
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              <div className="flex flex-col justify-between">
                <div className="flex justify-between flex-row items-center" style={{ visibility: hasPassword ? "visible" : "hidden" }}>
                  <div className=" p-1" onClick={() => setShowOldPassword(!showOldPassword)}>
                    {showOldPassword ? "hide" : "show"}
                  </div>
                  <input
                    className="bg-slate-600 rounded w-4/5 p-1"
                    type={showOldPassword ? "text" : "password"}
                    id="OldPasswordField"
                    placeholder=" Old Password"
                    onChange={(e) => setOldPassword(e.target.value)}
                    style={{ visibility: hasPassword ? "visible" : "hidden" }}
                  />
                </div>
                <div className="flex justify-between flex-row items-center" style={{ visibility: hasPassword ? "visible" : "hidden" }}>
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
            < div className="flex flex-row justify-center">
              {/* Cancel Button should just go back */}
              <Link className="flex justify-center p-4 m-2 w-11/12 bg-slate-800 text-white rounded-lg hover:bg-slate-600 " href="/chats">
                Back
              </Link>
              {/* Create Button should update chat and go back to the messages */}
              { isEditor(pageSettings, pageUser.intra_user_id) &&
                <Link className="flex justify-center p-4 m-2 w-11/12 bg-blue-500 text-white rounded-lg hover:bg-blue-700 "
                      onClick={() => UpdateSettings()} href={`/messages?chat_id=${chatId}`}>
                  Apply
                </Link>
              }
            </div>
          </div>
        </div >
      </div >

      {/* Debug Box */}
      < div className="flex flex-col text-left justify-center" >
        <p>PageSettings:</p>
        <p>| ChatUsers: {joinUserID(pageSettings?.userInfo).join(", ")}</p>
        <p>| Permissions: {joinPerms(pageSettings?.userInfo).join(", ")}</p>
        <p>_________ </p>
        <p>| Updated:</p>
        <p>| Title: {title}</p>
        <p>| Has Password: {hasPassword ? "True" : "False"}</p>
        <p>| Old Password: {showOldPassword ? "Show" : "Hide"} {oldPassword}</p>
        <p>| Old Password: {showNewPassword ? "Show" : "Hide"} {newPassword}</p>
        <p>| Selected Users: {joinUserID(updatedChatSettings?.userInfo).join(", ")}</p>
        <p>| Permissions: {joinPerms(updatedChatSettings?.userInfo).join(", ")}</p>
      </div >
    </div >
  ); // End of return

  {/* Debug Functions */}
    function joinPerms(list: ChatsUsers[]) {
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

    function joinUserID(list: ChatsUsers[]) {
      var arr: number[] = [];
      for (const user of list) {
        if (user.intra_user_id == null) continue;
        arr.push(user.intra_user_id);
      }
      return (arr);
    }
}
