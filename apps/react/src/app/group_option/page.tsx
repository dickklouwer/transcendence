"use client"

import { ChatSettings, ExternalUser, ChatsUsers, User } from '@repo/db';
import { useSearchParams } from 'next/navigation';

import Link from 'next/link';
import Image from "next/image";
import { DisplayUserStatus } from "../profile/page";
import { fetchGet, fetchPost } from '../fetch_functions';
import { useState, useEffect } from 'react';
import { isAdmin, isOwner, findChatsUsers} from './functions';

export default function GroupOptionPage() {

  const searchParams = useSearchParams();
  const chatId = searchParams?.get('chatId');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reload, setReload] = useState<boolean>(false);

  const [updatedChatSettings, setUpdatedChatSettings] = useState<ChatSettings>();
  const [chatUsers, setChatUsers] = useState<ExternalUser[]>();

  const [isPrivate, setChannelType] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("");
  const [hasPassword, setHasPassword] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update the state with the selected value
    setChannelType(event.target.value === "true" ? true : false);
  };
  var pageUser: User;

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const settings: ChatSettings = await fetchGet<ChatSettings>(`/api/getChatSettings?chatId=${chatId}`);
        const users: ExternalUser[] = await fetchGet<ExternalUser[]>(`/api/getExternalUsersFromChat?chatId=${chatId}`);  
        fetchGet<User>('/api/getProfile')
        .then((data) => {pageUser = data})
        .catch((error) => {
          console.log('Error: ', error);
        });

        if (users === null) {
          console.error("Error Fetching Chat Settings or Users");
          setIsLoading(false);
          return;
        }

        setUpdatedChatSettings(settings);
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
  if (updatedChatSettings === undefined || chatUsers === undefined) {
    return (
      <div>
        <p>Invalid Data</p>
        <Link className="flex justify-center p-4 m-2 w-11/12 bg-slate-800 text-white rounded-lg hover:bg-slate-600 " href="/chats">
          Back
        </Link>
      </div>
    );
  }
  const pageSettings = {... updatedChatSettings};

  /*
    function toggleOwner(id: number) {
      if (updatedChatSettings === undefined) return;
  
      const idx: number = updatedChatSettings.userId.indexOf(id);
      // Clone the object and update the permission
  
      updatedChatSettings.userPermission[idx] >> (Permissions.OWNER) & 1 ?
        updatedChatSettings.userPermission[idx] = updatedChatSettings.userPermission[idx] & ~(1 << Permissions.OWNER) :
        updatedChatSettings.userPermission[idx] = updatedChatSettings.userPermission[idx] | 1 << Permissions.OWNER;
  
      setUpdatedChatSettings(updatedChatSettings);
      forceReload();
    }
  */

  function toggleAdmin(id: number) {
    if (updatedChatSettings === undefined) return;
    const settings: ChatSettings = { ...updatedChatSettings };
    const user : ChatsUsers = findChatsUsers(settings, id);
    // Clone the object and update the permission

    user.is_admin = !user.is_admin;

    setUpdatedChatSettings(settings);
  }

  return (
    <div className="flex flex-col w-5/6">
      {/* HEADER */}
      <div className="flex flex-col items-center flex-grow space-x-4">
        <h1 >Options Group Channel</h1>
        <div className="flex flex-row justify-center space-x-4">

          {/* Friendlist */}
          {/* TODO: Still need to be able to add, kick and ban user to the chat */}
          <div className="flex flex-col">
            <h1 className="flex justify-center" >Chat Users</h1>
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
                          {user.nick_name === null ? (
                            <h1 className="text-1xl">{user.user_name}</h1>
                          ) : (
                            <h1 className="text-1xl">{user.nick_name}</h1>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* WARNING: before implementing this ternary find a way to get 
                                 the intra_user_id of the person using the page
                        NOTE: Can this be done in a function? 
                              Make sure an Admin can't change ownership
                        */}

                    {isOwner(pageSettings, pageUser.intra_user_id) || isAdmin(pageSettings, user.intra_user_id) ?
                      < div className='flex flex-row justify-around w-2/5 space-x-10'>
                        {isAdmin(updatedChatSettings, user.intra_user_id) ?
                          <button className="flex size-15 p-5 rounded bg-green-800" onClick={
                            () => toggleAdmin(user.intra_user_id)}></button> :
                          <button className="flex size-15 p-5 rounded bg-red-800" onClick={
                            () => toggleAdmin(user.intra_user_id)}></button>
                        }
                        {/* 
                        {isOwner(updatedChatSettings, user.intra_user_id) ?
                          <button className="flex size-15 p-5 rounded bg-green-800" onClick={
                            () => toggleOwner(user.intra_user_id)}></button> :
                          <button className="flex size-15 p-5 rounded bg-red-800" onClick={
                            () => toggleOwner(user.intra_user_id)}></button>
                        }
                        */}
                      </div>
                      :
                      < div className='flex flex-row justify-around w-2/5 space-x-10'>
                        {isAdmin(updatedChatSettings, user.intra_user_id) ?
                          <div className="flex size-15 p-5 rounded bg-green-800" ></div> :
                          <div className="flex size-15 p-5 rounded bg-red-800"></div>}
                        {/* 
                        {isOwner(updatedChatSettings, user.intra_user_id) ?
                          <div className="flex size-15 p-5 rounded bg-green-800"></div> :
                          <div className="flex size-15 p-5 rounded bg-red-800"></div>}
                        */}
                      </div>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div className="flex flex-col items-center justify-center">
            {/* TODO: [x] Title for chat needs to be added
                    [ ] check if all required values are filled in
            */}

            <div className='flex flex-col w-[25rem] justify-center m-3 bg-slate-800 rounded '>
              <div className="flex flex-row justify-between m-2 my-3">
                <p>Title:</p>
                <input
                  className="bg-slate-600 rounded w-4/5"
                  type="text"
                  id="TitleField"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-row items-center m-2 my-3 ">
                <p className="flex flex-grow justify-start">Private:</p>
                <input type="radio" name="channelType" value="true"
                  checked={isPrivate}
                  onChange={handleRadioChange}
                  className="flex items-center w-5 h-5 " />
              </div>
              <div className="flex flex-row items-center m-2 my-3">
                <p className="flex flex-grow justify-start">Public:</p>
                <input type="radio" name="channelType" value="false"
                  checked={!isPrivate}
                  onChange={handleRadioChange}
                  className="flex items-center w-5 h-5 " />
              </div>

              <div className="flex flex-row justify-between items-center m-2 my-3">
                <p>Password:</p>
                <input type="checkbox" name="hasPassword"
                  checked={hasPassword}
                  onChange={() => setHasPassword(!hasPassword)}
                  className="flex w-5 h-5" />
              </div>
              {hasPassword ?
                <div className="flex flex-col justify-between m-2 my-3">
                  <div className="flex justify-between flex-row m-2 my-3">
                    <div onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "hide" : "show"}
                    </div>
                    <input
                      className="bg-slate-600 rounded w-4/5"
                      type={showPassword ? "text" : "password"}
                      id="passwordField"
                      defaultValue={password}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between flex-row m-2 my-3">
                    <div onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "hide" : "show"}
                    </div>
                    <input
                      className="bg-slate-600 rounded w-4/5"
                      type={showPassword ? "text" : "password"}
                      id="passwordField"
                      defaultValue={password}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div> :
                < p className="flex justify-right flex-row my-3 "></p>
              }
            </div>

            {/* Action Buttons */}
            < div className="flex flex-row justify-center">
              {/* Cancel Button should just go back
              <Link className="flex justify-center p-4 m-2 w-11/12 bg-slate-800 text-white rounded-lg hover:bg-slate-600 " href="/chats">
                Back
              </Link>
              <Link className="flex justify-center p-4 m-2 w-11/12 bg-blue-500 text-white rounded-lg hover:bg-blue-700 " onClick={() => UpdateSettings()} href="/chats">
                Apply
              </Link>
              */}
              {/* Create Button should create chat and go back to chats */}
            </div>
          </div>
        </div >
      </div >

      {/* Debug Box
      */}
      < div className="flex flex-col text-left justify-center" >
        <p>PageSettings:</p>
        <p>| Title: {title}</p>
        <p>| password: {password}</p>
        <p>| Has Password: {hasPassword ? "True" : "False"}</p>
        <p>| Show Password : {showPassword ? "True" : "False"}</p>
        <p>| Selected Users: {joinUserID(pageSettings?.userInfo).join(", ")}</p>
        <p>| Permissions: {joinPerms(pageSettings?.userInfo).join(", ")}</p>
        <p>_________ </p>
        <p>| Updated:</p>
        <p>| Selected Users: {joinUserID(updatedChatSettings?.userInfo).join(", ")}</p>
        <p>| Permissions: {joinPerms(updatedChatSettings?.userInfo).join(", ")}</p>
      </div >
    </div >
  );

  function joinPerms(list: ChatsUsers[])
  {
    var arr: number[] = [];
    for (const user of list)
    {
      const perm:number = 0 +
      (user.is_owner ? 1 : 0) +
      (user.is_admin ? 2 : 0) +
      (user.is_banned ? 3 : 0);
      arr.push(perm);
    }
    return (arr);
  }

  function joinUserID(list: ChatsUsers[])
  {
    var arr: number[] = [];
    for (const user of list)
    {
      if (user.intra_user_id == null) continue;
      arr.push(user.intra_user_id);
    }
    return (arr);
  }
}
