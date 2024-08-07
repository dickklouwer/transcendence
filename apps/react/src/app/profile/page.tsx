"use client";
import Image from "next/image";
import { useState, useEffect, ChangeEvent, useContext, SetStateAction, Dispatch } from "react";
import { fetchGet, fetchPost } from "../page";
import Link from "next/link";
import { NicknameContext, NicknameFormProps } from "../layout";
import { User } from "@repo/db"

type ApiResponse = boolean;

const NicknameForm = ({
  setNickname,
  tempNickname,
  setTempNickname,
}: {
  setNickname: Dispatch<SetStateAction<string | undefined>>;
  tempNickname: string;
  setTempNickname: Dispatch<SetStateAction<string>>;
}) => {
  const [isUnique, setIsUnique] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  useEffect(() => {
    const checkNickname = async () => {
      if (tempNickname.trim() === "") {
        setIsUnique(true);
        return;
      }

      setIsLoaded(false);

      try {
        const data = await fetchGet<ApiResponse>(`/api/checkNickname?nickname=${tempNickname}`);

        setIsUnique(data);
      } catch (error) {
        console.error("Error Checking Nickname:", error);
        setIsUnique(false);
      } finally {
        setIsLoaded(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      checkNickname();
    }, 300); // Delay before checking the nickname

    return () => clearTimeout(delayDebounceFn);
  }, [tempNickname]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTempNickname(e.target.value);
  };

  async function dbSetNickname() {
    if (!isUnique) {
      return;
    }
    await fetchPost<{nickname: string}, ApiResponse>("/api/setNickname", { nickname: tempNickname })
    .then(() => {
        setNickname(tempNickname);
        setIsConfirmed(true);
        setTempNickname("");
      })
    .catch((error) => {
      setIsConfirmed(false);
      console.error("Error Setting Nickname:", error);
    });
  }

  return (
    <div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={tempNickname}
          onChange={handleChange}
          placeholder="Enter your nickname"
          onKeyUp={(e) => {e.code == "Enter" && dbSetNickname()}}
          className={`w-full text-black p-2 border rounded  ${
            isUnique ? "border-green-500" : "border-red-500"
          }`}
          maxLength={15}
        />
        <button
          className={` bg-green-500 hover:bg-green-700 disabled:bg-red-500 disabled:hover:bg-red-700 text-white px-2 py-2 rounded  transition-all duration-150`}
          onClick={dbSetNickname}
          disabled={!isUnique || tempNickname.trim() === ""}
        >
          Save
        </button>
      </div>
      {isLoaded && <p>Checking...</p>}
      {!isLoaded && !isUnique && (
        <p className="text-red-500">Nickname is already been taken</p>
      )}
      {!isLoaded && isUnique && isConfirmed && (
        <p className="text-green-500">Nickname has been set</p>
      )}
    </div>
  );
};

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
    <div className="flex flex-grow mx-14 space-x-12">
      <div className="bg-slate-900 shadow-lg rounded-lg p-8 max-w-2xl w-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Image
            src={user.image}
            alt="Profile Image"
            width={100}
            height={100}
            className="w-24 h-24 rounded-full"
          />
          <div>
            {nicknameContext.nickname === undefined ? (
              <h1 className="text-2xl">{user.user_name}</h1>
            ) : (
              <h1 className="text-2xl">
                {nicknameContext.nickname} aka ({user.user_name})
              </h1>
            )}
            <p className="text-blue-400">{user.email}</p>
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
        {user.is_two_factor_enabled ? (
            <button className="bg-green-500 text-white flex justify-center px-4 py-4 rounded" disabled>
              2FA Enabled
            </button>
          ) : (
            <Link className="bg-blue-500 text-white flex justify-center px-4 py-4 rounded hover:bg-blue-600 transition duration-300" href={'/2fa/enable'}>
              Enable 2FA
            </Link>
          )}
          <Link className="bg-blue-500 text-white flex justify-center px-4 py-4 rounded" href={'/menu'}>
            Back to Menu
          </Link>
        </div>
        <div className="flex bg-slate-900 shadow-lg rounded-lg w-auto">
          <h2 className="text-2xl p-8">Friends</h2>

        </div>
      </div>
  )
}
