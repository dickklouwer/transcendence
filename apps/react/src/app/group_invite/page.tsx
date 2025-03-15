"use client"

import Link from "next/link";
import { useState } from "react";
import { useRouter } from 'next/navigation';

import { fetchPost } from "../fetch_functions";

import { ChatSettings, ChatsUsers } from "@repo/db";
import { NewInviteList } from "./functions"
import { chatSocket } from "../chat_componens";

export default function GroupInvite() {
  const Router = useRouter();

  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isPrivate, setChannelType] = useState<boolean>(true);
  const [hasPassword, setHasPassword] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update the state with the selected value
    setChannelType(event.target.value === "true" ? true : false);
  };

  function parseUserInfo(users: number[]): ChatsUsers[] {
    let list: ChatsUsers[] = [];

    for (const user of users) {
      const hit: ChatsUsers = {
        intra_user_id: user,
        chat_id: 0,
        chat_user_id: 0,
        is_owner: false,
        is_admin: false,
        is_banned: false,
        mute_untill: null,
        joined: false,
        joined_at: null,
      };
      list.push(hit);
    }
    return list;
  }

  function CreateGroupChat() {

    const Settings: ChatSettings = {
      isPrivate: isPrivate,
      isDirect: false,
      userInfo: parseUserInfo(selectedUsers),
      title: title,
      password: password === "" ? null : password,
      image: null,
    };

    if (Settings.title === "") {
      alert("Chat needs a title");
      return;
    }
    if (Settings.title.length > 30) {
      alert("Title is too long");
      return;
    }
    if (Settings.userInfo.length === 0) {
      alert("Chat needs at least one member");
      return;
    }
    if (hasPassword && Settings.password === null) {
      alert("Private Chat needs a password");
      return;
    }

    fetchPost("/api/createChat", { ChatSettings: Settings })
      .then(() => { { } })
      .catch((error) => {
        console.log("Error Creating Group Chat", error);
      });
    Router.push("/chats");
    chatSocket.emit('messageUpdate');
  }

  {/* TODO: Add collor and filler up spaces */ }
  return (
    <div className="flex flex-col w-5/6">

      <div className="flex flex-col items-center justify-center flex-grow space-y-4">
        {/* HEADER */}
        <h1>Setup Group Channel</h1>

        <div className="flex flex-row ">

          {/* Friendlist */}
          <div className="flex flex-col ">
            <div className="flex justify-center ">
              <h1>Friendlist</h1>
            </div>
            {/* Pass setSelectedUsers to InviteList */}
            <NewInviteList selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />
          </div>

          {/* TODO: [x] Title for chat needs to be added
                    [ ] check if all required values are filled in
          /*}

          {/* Option List */}
          <div className="flex flex-col items-center ">
            <div className="flex flex-col w-full m-3">

              {/* option Title */}
              <div className="flex flex-row justify-between m-3">
                <p>Title:</p>
                <input
                  className="bg-slate-600 rounded"
                  type="text"
                  id="TitleField"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder=" Title"
                />
              </div>

              {/* option Public/Private */}
              <div className="flex flex-row items-center m-3 ">
                <p className="flex flex-grow justify-start">Private:</p>
                <input type="radio" name="channelType" value="true"
                  checked={isPrivate}
                  onChange={handleRadioChange}
                  className="flex items-center w-5 h-5 " />
              </div>
              <div className="flex flex-row items-center m-3">
                <p className="flex flex-grow justify-start">Public:</p>
                <input type="radio" name="channelType" value="false"
                  checked={!isPrivate}
                  onChange={handleRadioChange}
                  className="flex items-center w-5 h-5 " />
              </div>

              {/* Option Password */}
              <div className="flex flex-col m-3">
                <div className="flex flex-row justify-between">
                  <p>Password: </p>
                  <input type="checkbox" name="hasPassword"
                    checked={hasPassword}
                    onChange={() => setHasPassword(!hasPassword)}
                    className="flex justify-end w-5 h-5" />
                </div>
                {hasPassword ?
                  <div className="flex justify-between flex-row">
                    <div onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "hide" : "show"}
                    </div>
                    <input
                      className="bg-slate-600 rounded"
                      type={showPassword ? "text" : "password"}
                      id="passwordField"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=" Password"
                    />
                  </div> : null}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row justify-center ">
              {/* Cancel Button should just go back */}
              <div className="flex justify-center p-4 m-2 w-11/12 bg-slate-800 text-white rounded-lg hover:bg-slate-600 ">
                <Link href="/chats" className=" ">Cancel</Link>
              </div>
              {/* Create Button should create chat and go back to chats */}
              <div className="flex justify-center p-4 m-2 w-11/12 bg-blue-500 text-white rounded-lg hover:bg-blue-700 ">
                <button onClick={CreateGroupChat} >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Box
      <div className="flex flex-col items-center justify-center">
        <p>Selected Users: {selectedUsers.join(", ")}</p>

        <p>Title: {title}</p>
        <p>password: {password}</p>

        <p>Has Password: {hasPassword ? "True" : "False"}</p>
        <p>Show Password : {showPassword ? "True" : "False"}</p>
      </div>*/}

    </div>
  );
}
