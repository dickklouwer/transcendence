"use client";
import Image from "next/image";
import { AddFriendsForm, NicknameForm, FriendsList } from "./form_components";
import { useState, useEffect, useContext } from "react";
import { fetchGet } from "../fetch_functions";
import Link from "next/link";
import { NicknameContext, NicknameFormProps } from "../layout";
import { User } from "@repo/db"

function createMockData() {
  fetch('/api/createMockData', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  .then((response) => {
    console.log('Response: ', response);
    alert('Mock data created');
  })
  .catch((error) => {
    console.log('Error: ', error);
    alert('Error creating mock data');
  });
}

export function DisplayUserStatus({ state, width, height }: { state: 'Online' | 'Offline' | 'In-Game', width: number, height: number }) {

  return (
    <div>
      {state === 'Offline' && (<div className={`absolute bottom-[-1px] right-[-1px] bg-gray-500 rounded-full border-2 border-white`}
      style={{ width: `${width}px`, height: `${height}px` }}></div>)}
      
      {state === 'Online' &&  (<div className={`absolute bottom-[-1px] right-[-1px] bg-green-500 rounded-full border-2 border-white`}
      style={{ width: `${width}px`, height: `${height}px` }}></div>)} 
    </div>
  );
}

/**
 * This is the Profile page where the user can see their profile information
 * for example their username, email, image, achievements, wins and losses.
 * The user can also enable 2FA, create mock data setnickname.
 * You also can add friends and see your friends list.
 */



export default function Profile() {
  const [user, setUser] = useState<User>();
  const [tempNickname, setTempNickname] = useState<string>("");
  const nicknameContext: NicknameFormProps | undefined = useContext(NicknameContext);

  if (nicknameContext == undefined)
    throw new Error("Cannot find NicknameContext");

  useEffect(() => {
    fetchGet<User>("api/profile")
      .then((res) => {
        setUser(res);
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  }, []);

  if (!user) 
    return <div>Loading...</div>;

  return (
    <div>
    <div className="flex flex-col justify-center items-center bg-slate-900 shadow-lg rounded-lg ml-11 p-6 w-[84rem]">
      <h1 className="text-2xl">Friends</h1>
      <p className="w-auto whitespace-nowrap pb-4 ">&#60;-------------------------------&#62;</p>
      <FriendsList />
    </div>
    <div className="flex flex-grow justify-center space-x-12 p-12 w-full">
      <div className="bg-slate-900 shadow-lg rounded-lg p-8 max-w-2xl ">
        <div className="flex items-center space-x-4 w-[35rem]">
          <div className="relative">
            <Image
              src={user.image}
              alt="Profile Image"
              width={100}
              height={100}
              className="min-w-24 min-h-24 max-w-24 max-h-24 rounded-full object-cover"
              />
          <DisplayUserStatus state={'Online'} width={20} height={20} />
          </div>
          <div className="flex-grow min-w-0 mb-4">
            {nicknameContext.nickname === undefined ? (
              <h1 className="text-2xl">{user.user_name}</h1>
            ) : (
              <h1 className="text-2xl break-words w-auto">
                {nicknameContext.nickname} aka ({user.user_name})
              </h1>
            )}
            <p className="text-blue-400 break-all ">{user.email}</p>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-blue-400 mb-2">Custom Nickname</label>
          <div className="flex space-x-2">
            <NicknameForm
              setNickname={nicknameContext.setNickname}
              tempNickname={tempNickname}
              setTempNickname={setTempNickname}
              />
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-xl mb-4">Achievements</h2>
          <ul className="list-disc list-inside">
            <li>Achievement Speed Deamon</li>
            <li>Achievement Skill Shot</li>
            <li>Achievement Streak King</li>
          </ul>
        </div>
        <div className="mb-6">
          <h2 className="text-xl mb-4">Wins and Losses</h2>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">Wins: 10</span>{" "}
              {/* This 10 should be replaced with the actual number of wins */}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">Losses: 5</span>{" "}
              {/* This 5 should be replaced with the actual number of losses */}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {user.is_two_factor_enabled ? (
            <button className="bg-green-500 text-white flex justify-center px-4 py-4 rounded w-full" disabled>
                2FA Enabled
              </button>
            ) : (
              <Link className="bg-blue-500 text-white flex justify-center px-4 py-4 rounded hover:bg-blue-600 transition duration-300 w-full" href={'/2fa/enable'}>
                Enable 2FA
              </Link>
            )}
            <button className="bg-blue-500 text-white flex justify-center px-4 py-4 rounded hover:bg-blue-600 transition duration-300 w-full" onClick={() => createMockData()}>
              Create Mock Data
            </button>
            <Link className="bg-blue-500 text-white flex justify-center px-4 py-4 rounded hover:bg-blue-600 transition duration-300 w-full" href={'/menu'}>
              Back to Menu
            </Link>

          </div>
        </div>
    <div className=" bg-slate-900 shadow-lg rounded-lg p-8">
      <div className="flex justify-center items-center space-x-4 pb-5">
        <h2 className="text-2xl">Add Friends</h2>
        <svg className="h-10 w-10" fill="#ffffff" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <rect x="122.435" y="161.391" width="33.391" height="144.696"></rect> </g> </g> <g> <g> <rect x="356.174" y="161.391" width="33.391" height="144.696"></rect> </g> </g> <g> <g> <rect x="189.217" y="94.609" width="133.565" height="33.391"></rect> </g> </g> <g> <g> <rect x="155.826" y="128" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="322.783" y="128" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <polygon points="322.783,306.087 322.783,339.478 289.391,339.478 289.391,372.87 356.174,372.87 356.174,306.087 "></polygon> </g> </g> <g> <g> <polygon points="189.217,339.478 189.217,306.087 155.826,306.087 155.826,372.87 222.609,372.87 222.609,339.478 "></polygon> </g> </g> <g> <g> <rect y="128" width="33.391" height="144.696"></rect> </g> </g> <g> <g> <rect x="66.783" y="61.217" width="122.435" height="33.391"></rect> </g> </g> <g> <g> <rect x="33.391" y="94.609" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <polygon points="66.783,306.087 66.783,272.696 33.391,272.696 33.391,339.478 89.044,339.478 89.044,306.087 "></polygon> </g> </g> <g> <g> <rect x="478.609" y="128" width="33.391" height="144.696"></rect> </g> </g> <g> <g> <rect x="445.217" y="94.609" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="322.783" y="61.217" width="122.435" height="33.391"></rect> </g> </g> <g> <g> <polygon points="445.217,272.696 445.217,306.087 411.826,306.087 411.826,339.478 478.609,339.478 478.609,272.696 "></polygon> </g> </g> <g> <g> <polygon points="478.609,339.478 478.609,372.87 356.174,372.87 356.174,417.391 155.826,417.391 155.826,372.87 33.391,372.87 33.391,339.478 0,339.478 0,406.261 122.435,406.261 122.435,450.783 389.565,450.783 389.565,406.261 512,406.261 512,339.478 "></polygon> </g> </g> </g></svg>
      </div>
      <AddFriendsForm />
    </div>
    </div>
    </div>
  )
}
