"use client"

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import { userSocket } from "../profile_headers";
import { useRouter } from 'next/navigation';
import { fetchGet, fetchPost } from "../fetch_functions";
import { DisplayUserStatus } from "../profile/page";
import { ChatSettings, ExternalUser, User } from "@repo/db";

const InviteList = ({ selectedUsers, setSelectedUsers }: { selectedUsers: number[], setSelectedUsers: React.Dispatch<React.SetStateAction<number[]>> }) => {

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
              <button onClick={() => toggleInvite(user.intra_user_id)}>
                <div className="flex items-center justify-center w-11 h-11 rounded border border-t-white">
                  <p className="font-bold">
                    {isInvited(user.intra_user_id) ? "-" : "+"}
                  </p>
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


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

  function CreateGroupChat() {

    const Settings: ChatSettings = {
      isPrivate: isPrivate,
      isDirect: false,
      userInfo: [],
      title: title,
      password: password === "" ? null : password,
      image: null,
    };

    // TODO: Find Alternative to alert
    if (Settings.title === "") {
      alert("Chat needs a title");
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

    console.log("FE - ChatSettings: ", Settings);

    fetchPost("/api/createChat", { ChatSettings: Settings })
      .then(() => {
        {/*
        NOTE: figure out why this log shows up in client console
              |
              POST http://f1r3s17.codam.nl:4433/api/createChat
              500 | Internal Server Error | 23ms
      */}
      })
      .catch((error) => {
        console.log("Error Creating Group Chat", error);

      });
    Router.push("/chats"); //NOTE: maybe move this to then on createChat
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
            <InviteList selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />
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
                  {/* TODO: check if all required values are filled in */}
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Box*/}
      <div className="flex flex-col items-center justify-center">
        <p>Selected Users: {selectedUsers.join(", ")}</p>

        <p>Title: {title}</p>
        <p>password: {password}</p>

        <p>Has Password: {hasPassword ? "True" : "False"}</p>
        <p>Show Password : {showPassword ? "True" : "False"}</p>
      </div>

    </div>
  );
}
