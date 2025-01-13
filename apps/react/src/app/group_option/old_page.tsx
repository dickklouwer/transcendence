"use client"

import Link from 'next/link';
import Image from "next/image";
import { useSearchParams } from 'next/navigation';

import { DisplayUserStatus } from "../profile/page";
import { ChatSettings, ExternalUser } from '@repo/db';
import { fetchGet, fetchPost } from '../fetch_functions';
import { useState, useEffect } from 'react';
import { isAdmin, isOwner } from './functions';

export default function GroupViewPage() {
  const searchParams = useSearchParams();
  const chatId = searchParams?.get('chatId');
  var updatedChatSettings: ChatSettings;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInvalidData, setIsInvalid] = useState<boolean>(true);

  const [chatSettings, setChatSettings] = useState<ChatSettings>();
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

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const settings: ChatSettings = await fetchGet<ChatSettings>(`/api/getChatSettings?chatId=${chatId}`);
        const users: ExternalUser[] = await fetchGet<ExternalUser[]>(`/api/getExternalUsersFromChat?chatId=${chatId}`);

        if (settings === null || users === null) {
          console.error("Error Fetching Chat Settings or Users");
          setIsLoading(false);
          setIsInvalid(false);
          return;
        }
        setChatSettings(settings);
        setChatUsers(users);

        setTitle(settings.title);
        setHasPassword(settings.password !== null);
        setChannelType(settings.isPrivate);
        setShowPassword(hasPassword);
        if (settings.password !== null)
          setPassword(settings.password);
        else
          setPassword("");

      }
      catch (error) {
        console.error("Error Fetching Chat Settings:", error);
      }
      finally {
        setIsLoading(false);
        setIsInvalid(false);
      }
    }
    fetchData();
  }, []);


  //TODO: remove this function
  function toBinary(n: number): string {
    n = Number(n);
    if (n == 0) return '0';
    var r = '';
    while (n != 0) {
      r = ((n & 1) ? '1' : '0') + r;
      n = n >>> 1;
    }
    return r;
  }

  // TODO: change permissions 

  function toggleAdmin(id: number) {
    if (chatSettings === undefined) return;

    const idx: number = chatSettings.userId.indexOf(id);
    // Clone the object and update the permission
    chatSettings.userPermission[idx] =
      chatSettings.userPermission[idx] % 2 == 1
        ? chatSettings.userPermission[idx] - 1
        : chatSettings.userPermission[idx] + 1;

    console.log("perms: ", toBinary(chatSettings.userPermission[idx]));
    console.log("perms >> 0: ", toBinary(chatSettings.userPermission[idx] >> 0));
    console.log("perms >> 0 & 1: ", toBinary(chatSettings.userPermission[idx] >> 0 & 1));
    // isAdmin >> 1 & 1
    // ((isAdmin >> 1) | 1) = 1
    // isOwner >> 2 & 1
    // isOwner >> 2 
    // isBanned >> 3 & 1

    // value | 0010 // second bit true
    // value & 1101 // second bit false
    // value ! 1 >> 1 // secons bit true
    // vlaue & ~(1 >> 1) // second bit false

    // 1110
    // 1010
    // pers = pers & ~(1 << 2)
    // pers >> 2 & 1 = ``
    // 11

    // Update the state
    // Update the state
    setChatSettings(chatSettings);
  }

  function UpdateSettings() {
    if (chatSettings === undefined) return;

    const Settings: ChatSettings = {
      isPrivate: isPrivate,
      isDirect: false,
      userId: chatSettings.userId, // TODO: change the following variables when you want to add people
      userPermission: chatSettings.userPermission,
      title: title,
      password: password === "" ? null : password,
      image: null,
    };

    fetchPost(`/api/updateChatSettings?chatId=${chatId}`, chatSettings)
      .then(() => {
        console.log("Chat Settings Updated");
      })
      .catch((error) => {
        console.error("Error Updating Chat Settings:", error);
      });
  }

  console.log('FE - ChatSettings: ', chatSettings);
  console.log('FE - ExternalUser: ', chatUsers);

  if (isLoading) return <div>Loading...</div>;
  if (isInvalidData || chatSettings === undefined || chatUsers === undefined) {
    return (
      <div> Invalid Data...
        <Link className="flex justify-center p-4 m-2 w-11/12 bg-slate-800 text-white rounded-lg hover:bg-slate-600 " href="/chats">
          Back
        </Link> </div>
    )
  }
  updatedChatSettings = chatSettings;

  return (
    <div className="flex flex-col w-5/6">
      {/* HEADER */}
      <div className="flex flex-col items-center flex-grow space-x-4">
        <h1 >Options Group Channel</h1>
        <div className="flex flex-row justify-center space-x-4">

          {/* Friendlist */}
          {/* TODO: Still need to be able to add user to the chat */}
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
              {chatUsers.length === 0 && <p className="text-center text-1xl whitespace-no-rap">No Users :(</p>}
              {chatUsers.map((user) => (
                <div key={user.intra_user_id}>
                  <div className="flex flex-row justify-between items-center p-2 px-4 space-x-2 bg-slate-950 rounded">
                    {/* Chat User OVerview */}
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

                    {/* {isOwner(permsettings, user.intra_user_id) || isAdmin(permsettings, user.intra_user_id)? */}
                    < div className='flex flex-row justify-around w-2/5 space-x-10'>
                      {isAdmin(chatSettings, user.intra_user_id) ?
                        <button className="flex size-15 p-5 rounded bg-green-800" onClick={() => toggleAdmin(user.intra_user_id)}></button> :
                        <button className="flex size-15 p-5 rounded bg-red-800" onClick={() => toggleAdmin(user.intra_user_id)}></button>}
                    </div>
                    {/* :
                  < div className='flex flex-row justify-around w-2/5 space-x-10'>
                    {isAdmin(updatedChatSettings, user.intra_user_id) ?
                      <div className="flex size-15 p-5 rounded bg-green-800" ></div> :
                      <div className="flex size-15 p-5 rounded bg-red-800"></div>}
                    {isOwner(updatedChatSettings, user.intra_user_id) ?
                      <div className="flex size-15 p-5 rounded bg-green-800"></div> :
                      <div className="flex size-15 p-5 rounded bg-red-800"></div>}
                  </div>
                  */}
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* TODO: [x] Title for chat needs to be added
                    [ ] check if all required values are filled in
          */}
          <div className="flex flex-col items-center justify-center ">
            <div className='flex flex-col w-[25rem] justify-center m-3 '>
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
                </div> :
                < p className="flex justify-right flex-row my-3 ">-</p>
              }

            </div>
            {/* Action Buttons */}
            < div className="flex flex-row justify-center">
              {/* Cancel Button should just go back */}
              <Link className="flex justify-center p-4 m-2 w-11/12 bg-slate-800 text-white rounded-lg hover:bg-slate-600 " href="/chats">
                Back
              </Link>
              <button className="flex justify-center p-4 m-2 w-11/12 bg-blue-500 text-white rounded-lg hover:bg-blue-700 " onClick={() => UpdateSettings()} >
                Apply
              </button>
              {/* Create Button should create chat and go back to chats */}
            </div>
          </div>
        </div >
      </div >

      {/* Debug Box
      */}
      <div className="flex flex-col text-left justify-center">
        <p>Selected Users: {chatSettings.userId.join(", ")}</p>
        <p>Permissions: {chatSettings.userPermission.join(", ")}</p>
        <p>Title: {title}</p>
        <p>password: {password}</p>
        <p>Has Password: {hasPassword ? "True" : "False"}</p>
        <p>Show Password : {showPassword ? "True" : "False"}</p>
      </div>

    </div >
  );
}
