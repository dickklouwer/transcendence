"use client"

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import { userSocket } from "../profile_headers";
import { useRouter } from 'next/navigation';
import { fetchGet, fetchPost } from "../fetch_functions";
import { DisplayUserStatus } from "../profile/page";
import { ExternalUser, GroupChatInfo } from "@repo/db";

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
                <div className="flex w-11 h-11 rounded border border-t-white">
                  {isInvited(user.intra_user_id) ? "-" : "+"}
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
  const [isInputVisible, setIsInputVisible] = useState<boolean>(false);
  const [password, setInputValue] = useState<string>("");

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update the state with the selected value
    setChannelType(event.target.value === "true" ? true : false);
  };

  function CreateGroupChat() {

    const GroupchatInfo: GroupChatInfo = {
      title: "Text Title",
      image: null,
      intra_user_id: selectedUsers,
      password: password === "" ? null : password,
      isPrivate: isPrivate,
    };

    // TODO: Check if all required values are filled in

    console.log("info of the info: ", GroupchatInfo);

    fetchPost("/api/CreateGroupChat", { GroupchatInfo: GroupchatInfo })
      .then(() => {
        console.log("Group Chat Created");
        Router.push("/chats");
      })
      .catch((error) => {
        console.log("Error Creating Group Chat", error);

      });
  }

  {/* TODO: Add collor and filler up spaces */ }
  return (
    <div className="flex flex-col w-5/6 border">

      {/* topBox*/}
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

          {/* Spacing */}
          <div className="flex flex-col w-10">
          </div>

          {/* TODO: Title for chat needs to be added
                    check if all required values are filled in
          /*}
            
          {/* Option List */}
          <div className="flex flex-col items-center border ">
            <div className="flex flex-col w-full">

              {/* option Public/Private */}
              <div className="flex flex-row items-center space-x-4 p-2">
                <div className="flex-grow justify-start">
                  <p>Private:</p>
                </div>
                <input type="radio" name="channelType" value="true"
                  checked={isPrivate}
                  onChange={handleRadioChange}
                  className="flex items-center w-5 h-5 " />
              </div>
              <div className="flex flex-row items-center space-x-4 p-2">
                <div className="flex-grow justify-start">
                  <p>Public:</p>
                </div>
                <input type="radio" name="channelType" value="false"
                  checked={!isPrivate}
                  onChange={handleRadioChange}
                  className="flex items-center w-5 h-5 " />
              </div>

              {/* Option Password */}
              <div className="flex flex-col">
                <div className="flex flex-row">
                  <div className="flex justify-start">
                    <p>Password: </p>
                  </div>
                  <input type="checkbox" name="hasPassword"
                    checked={hasPassword}
                    onChange={() => setHasPassword(!hasPassword)}
                    className="flex justify-end w-5 h-5 " />
                </div>

                {hasPassword ?
                  <div className="flex flex-row space-x-4">
                    <div className="items-start" onClick={() => setIsInputVisible(!isInputVisible)}>
                      {isInputVisible ? "hide" : "show"}
                    </div>
                    <input
                      className="bg-slate-900 rounded"
                      type={isInputVisible ? "text" : "password"}
                      id="passwordField"
                      value={password}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Password"
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
        <p>Private Chat: {isPrivate ? "True" : "False"} </p>
        <p>Has Password: {hasPassword ? "True" : "False"}</p>
        <p>password: {password}</p>
        <p>Input Visible: {isInputVisible ? "True" : "False"}</p>
      </div>

    </div>
  );
}
