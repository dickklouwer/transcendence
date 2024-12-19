"use client"

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { ChatSettings } from '@repo/db';
import { fetchGet, fetchPost } from '../fetch_functions';

export default function GroupViewPage() {
  const searchParams = useSearchParams();
  const chatId = searchParams?.get('chatId');
  let chatSettings: ChatSettings;

  fetchGet<ChatSettings>(`/api/getChatSettings?chatId=${chatId}`)
    .then((data) => {
      chatSettings = data;
    })
    .catch((error) => {
      console.error("Error Getting Chat Settings:", error);
    });

  //NOTE: maybe update Type ChatSettings to contain an number[][] 
  //      so we can store the selectedUsers and their roles
  function UpdateSettings() {
    fetchPost(`/api/updateChatSettings?chatId=${chatId}`, chatSettings)
      .then(() => {
        console.log("Chat Settings Updated");
      })
      .catch((error) => {
        console.error("Error Updating Chat Settings:", error);
      });
  }

  return (
    <div className="flex flex-col w-5/6">

      {/* topBox*/}
      <div className="flex flex-col items-center justify-center flex-grow space-y-4">
        {/* HEADER */}
        <h1>Setup Group Channel</h1>

        <div className="flex flex-row ">

          {/* Friendlist */}
          <div className="flex flex-col ">
            <div className="flex justify-center ">
              <h1>Chat Users</h1>
            </div>
            {/* Pass setSelectedUsers to InviteList */}
            {/* <InviteList selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />*/}
          </div>

          {/* TODO: [x] Title for chat needs to be added
                    [ ] check if all required values are filled in
          /*}

          {/* Option List */}
          <div className="flex flex-col items-center ">
            <div className="flex flex-col w-full m-3">
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex flex-row justify-center ">
            {/* Cancel Button should just go back */}
            <div className="flex justify-center p-4 m-2 w-11/12 bg-slate-800 text-white rounded-lg hover:bg-slate-600 ">
              <Link href="/chats" className=" ">Back</Link>
            </div>
            {/* Create Button should create chat and go back to chats */}
            <div className="flex justify-center p-4 m-2 w-11/12 bg-blue-500 text-white rounded-lg hover:bg-blue-700 ">
              <button onClick={UpdateSettings} >
                Apply
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
