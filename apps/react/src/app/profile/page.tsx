"use client";
import Image from "next/image";
import { FriendsForm, NicknameForm } from "./form_components";
import { useState, useEffect, useContext } from "react";
import { fetchGet } from "../page";
import Link from "next/link";
import { NicknameContext, NicknameFormProps } from "../layout";
import { User } from "@repo/db"

export default function Profile() {
  const [user, setUser] = useState<User>(); // This Any needs to be replaced with the correct type that we will get from the backend
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
    <div className="flex flex-grow justify-center space-x-12 p-12 w-full">
      <div className="bg-slate-900 shadow-lg rounded-lg p-8 max-w-2xl ">
        <div className="flex items-center space-x-4 w-[35rem]">
          <Image
            src={user.image}
            alt="Profile Image"
            width={100}
            height={100}
            className="w-24 h-24 rounded-full"
          />
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
              <button className="bg-green-500 text-white flex justify-center px-4 py-4 rounded" disabled>
                2FA Enabled
              </button>
            ) : (
              <Link className="bg-blue-500 text-white flex justify-center px-4 py-4 rounded hover:bg-blue-600 transition duration-300" href={'/2fa/enable'}>
                Enable 2FA
              </Link>
            )}
            <Link className="bg-blue-500 text-white flex justify-center px-4 py-4 rounded hover:bg-blue-600 transition duration-300" href={'/menu'}>
              Back to Menu
            </Link>
          </div>
        </div>
    <div className=" bg-slate-900 shadow-lg rounded-lg p-8">
      <div className="flex justify-center items-center space-x-4 pb-5">
        <h2 className="text-2xl">Add Friends</h2>
        <svg className="h-10 w-10" fill="#ffffff" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <rect x="122.435" y="161.391" width="33.391" height="144.696"></rect> </g> </g> <g> <g> <rect x="356.174" y="161.391" width="33.391" height="144.696"></rect> </g> </g> <g> <g> <rect x="189.217" y="94.609" width="133.565" height="33.391"></rect> </g> </g> <g> <g> <rect x="155.826" y="128" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="322.783" y="128" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <polygon points="322.783,306.087 322.783,339.478 289.391,339.478 289.391,372.87 356.174,372.87 356.174,306.087 "></polygon> </g> </g> <g> <g> <polygon points="189.217,339.478 189.217,306.087 155.826,306.087 155.826,372.87 222.609,372.87 222.609,339.478 "></polygon> </g> </g> <g> <g> <rect y="128" width="33.391" height="144.696"></rect> </g> </g> <g> <g> <rect x="66.783" y="61.217" width="122.435" height="33.391"></rect> </g> </g> <g> <g> <rect x="33.391" y="94.609" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <polygon points="66.783,306.087 66.783,272.696 33.391,272.696 33.391,339.478 89.044,339.478 89.044,306.087 "></polygon> </g> </g> <g> <g> <rect x="478.609" y="128" width="33.391" height="144.696"></rect> </g> </g> <g> <g> <rect x="445.217" y="94.609" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="322.783" y="61.217" width="122.435" height="33.391"></rect> </g> </g> <g> <g> <polygon points="445.217,272.696 445.217,306.087 411.826,306.087 411.826,339.478 478.609,339.478 478.609,272.696 "></polygon> </g> </g> <g> <g> <polygon points="478.609,339.478 478.609,372.87 356.174,372.87 356.174,417.391 155.826,417.391 155.826,372.87 33.391,372.87 33.391,339.478 0,339.478 0,406.261 122.435,406.261 122.435,450.783 389.565,450.783 389.565,406.261 512,406.261 512,339.478 "></polygon> </g> </g> </g></svg>
      </div>
      <FriendsForm />
    </div>
  </div>
  )
}
