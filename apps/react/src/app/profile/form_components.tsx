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

    const filteredChatFields = ExternalUsers?.filter((userField) => {
      return userField.user_name.toLowerCase().includes(searchName.toLowerCase());
  }) ?? [];

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
            <div className=" overflow-scroll h-96">
                {filteredChatFields.map((user) => (
                    <div key={user.intra_user_id} className=" justify-center">
                        <div className="flex bg-slate-950 border-white m-2 rounded-md items-center space-x-4 p-2 px-4 justify-between">
                            <div className="flex items-center space-x-4">
                                <Image
                                    src={user.image}
                                    alt="Profile Image"
                                    className="w-11 h-11 rounded-full"
                                    width={100}
                                    height={100}
                                />
                                <div className="min-w-0 p-1 break-all">
                                  {user.nick_name === null ? 
                                    <h1 className="text-1xl">{user.user_name}</h1> :
                                    <div>
                                      <h1 className="text-1xl">{user.nick_name}</h1>
                                      <p className="text-gray-600">{user.user_name}</p>
                                    </div>
                                    }
                                    <p className="text-blue-400 break-all">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex">
                              <button className=" bg-green-500 hover:bg-green-700 transition-all duration-300 p-2 rounded-md">
                                  <svg className="pl-2 h-11 w-11 items-center" fill="#ffffff" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <rect y="100.174" width="33.391" height="144.696"></rect> </g> </g> <g> <g> <rect x="311.652" y="100.174" width="33.391" height="144.696"></rect> </g> </g> <g> <g> <rect x="100.174" width="144.696" height="33.391"></rect> </g> </g> <g> <g> <rect x="33.391" y="66.783" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="66.783" y="33.391" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="244.87" y="33.391" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="278.261" y="66.783" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="33.391" y="244.87" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="278.261" y="244.87" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <polygon points="244.87,278.261 244.87,311.652 211.478,311.652 211.478,345.043 278.261,345.043 278.261,278.261 "></polygon> </g> </g> <g> <g> <rect x="33.391" y="345.043" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <polygon points="100.174,311.652 100.174,278.261 66.783,278.261 66.783,345.043 133.565,345.043 133.565,311.652 "></polygon> </g> </g> <g> <g> <polygon points="411.826,378.435 411.826,345.043 378.435,345.043 378.435,378.435 345.043,378.435 345.043,411.826 378.435,411.826 378.435,445.217 411.826,445.217 411.826,411.826 445.217,411.826 445.217,378.435 "></polygon> </g> </g> <g> <g> <rect x="478.609" y="345.043" width="33.391" height="100.174"></rect> </g> </g> <g> <g> <rect x="345.043" y="478.609" width="100.174" height="33.391"></rect> </g> </g> <g> <g> <rect x="345.043" y="278.261" width="100.174" height="33.391"></rect> </g> </g> <g> <g> <polygon points="278.261,345.043 278.261,411.826 33.391,411.826 33.391,378.435 0,378.435 0,445.217 311.652,445.217 311.652,345.043 "></polygon> </g> </g> <g> <g> <rect x="311.652" y="311.652" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="445.217" y="311.652" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="445.217" y="445.217" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="311.652" y="445.217" width="33.391" height="33.391"></rect> </g> </g> </g></svg>
                              </button>
                            </div>
                        </div>
                    </div>
                ))}
              </div>
        </div>
    );
}

