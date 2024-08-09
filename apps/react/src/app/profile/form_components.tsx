"use client";
import { useState, useEffect, ChangeEvent,SetStateAction, Dispatch } from "react";
import Image from "next/image";
import { fetchGet, fetchPost } from "../page";
import type { ExternalUser } from "@repo/db";

export const NicknameForm = ({
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
          const data = await fetchGet<boolean>(`/api/checkNickname?nickname=${tempNickname}`);
  
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
      await fetchPost<{nickname: string}, boolean>("/api/setNickname", { nickname: tempNickname })
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

export const FriendsForm = () => {
    const [searchName, setSearchName] = useState<string>("");
    const [ExternalUsers, setExternalUsers] = useState<ExternalUser[]>([]);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    useEffect(() => {
      try {
          fetchGet<ExternalUser[]>("/api/getExternalUsers")
          .then((data) => {
          setExternalUsers(data);
          });
      } catch (error) {
          console.error("Error Getting Friends:", error);
      }
    }, [searchName]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchName(e.target.value);
    };

    console.log(ExternalUsers);

    return (
        <div>
            <div className="flex w-auto items-center justify-center space-x-4">
                <input
                    type="text" 
                    placeholder="Search..."
                    value={searchName}
                    onChange={handleChange}
                    className="w-72 text-black p-2 border rounded"
                    maxLength={15} />
            </div>
            <p className="flex justify-center m-4 w-auto whitespace-nowrap">&#60;---------------------------------&#62;</p>
            <div>
                {ExternalUsers.map((user) => (
                    <div key={user.intra_user_id} className=" justify-center">
                        <div className="flex bg-slate-950 m-2 rounded-md items-center space-x-4 p-2 px-4 justify-between">
                            <div className="flex items-center space-x-4">
                                <Image
                                    src={user.image}
                                    alt="Profile Image"
                                    className="w-11 h-11 rounded-full"
                                    width={100}
                                    height={100}
                                />
                                <div className="flex-grow min-w-0 mb-4 break-all">
                                    <h1 className="text-1xl">{user.user_name}</h1>
                                    <p className="text-blue-400 break-all">{user.email}</p>
                                </div>
                            </div>
                              <button className=" bg-green-500 p-2 rounded-md">
                                  Add
                              </button>
                        </div>
                    </div>
                ))}
              </div>
        </div>
    );
}

