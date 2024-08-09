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
        <div className="flex items-center space-x-4">
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
            <p className="text-blue-400 break-all">{user.email}</p>
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
      <div className="flex justify-center items-center p-2">
        <h2 className="text-2xl">Friends</h2>
        <svg className="h-20 w-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="#ffffff" d="M135.832 140.848h-70.9c-2.9 0-5.6-1.6-7.4-4.5-1.4-2.3-1.4-5.7 0-8.6l4-8.2c2.8-5.6 9.7-9.1 14.9-9.5 1.7-.1 5.1-.8 8.5-1.6 2.5-.6 3.9-1 4.7-1.3-.2-.7-.6-1.5-1.1-2.2-6-4.7-9.6-12.6-9.6-21.1 0-14 9.6-25.3 21.5-25.3s21.5 11.4 21.5 25.3c0 8.5-3.6 16.4-9.6 21.1-.5.7-.9 1.4-1.1 2.1.8.3 2.2.7 4.6 1.3 3 .7 6.6 1.3 8.4 1.5 5.3.5 12.1 3.8 14.9 9.4l3.9 7.9c1.5 3 1.5 6.8 0 9.1-1.6 2.9-4.4 4.6-7.2 4.6zm-35.4-78.2c-9.7 0-17.5 9.6-17.5 21.3 0 7.4 3.1 14.1 8.2 18.1.1.1.3.2.4.4 1.4 1.8 2.2 3.8 2.2 5.9 0 .6-.2 1.2-.7 1.6-.4.3-1.4 1.2-7.2 2.6-2.7.6-6.8 1.4-9.1 1.6-4.1.4-9.6 3.2-11.6 7.3l-3.9 8.2c-.8 1.7-.9 3.7-.2 4.8.8 1.3 2.3 2.6 4 2.6h70.9c1.7 0 3.2-1.3 4-2.6.6-1 .7-3.4-.2-5.2l-3.9-7.9c-2-4-7.5-6.8-11.6-7.2-2-.2-5.8-.8-9-1.6-5.8-1.4-6.8-2.3-7.2-2.5-.4-.4-.7-1-.7-1.6 0-2.1.8-4.1 2.2-5.9.1-.1.2-.3.4-.4 5.1-3.9 8.2-10.7 8.2-18-.2-11.9-8-21.5-17.7-21.5z"/></svg>
      </div>
      <FriendsForm />
    </div>
  </div>
  )
}
