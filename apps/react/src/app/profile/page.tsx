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
    <div className="flex flex-grow justify-center space-x-12 w-full">
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
    <div className=" bg-slate-900 shadow-lg rounded-lg max-w-2xl p-8 w-full">
      <h2 className="flex justify-center items-center text-2xl p-8">Friends</h2>
      <FriendsForm />
    </div>
  </div>
  )
}
