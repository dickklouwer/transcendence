"use client";
import { useState, useEffect, ChangeEvent,SetStateAction, Dispatch } from "react";
import { fetchGet, fetchPost } from "../page";

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
    const [tempFriend, setTempFriend] = useState<string>("");
    const [friends, setFriends] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    useEffect(() => {
        const fetchFriends = async () => {
            setIsLoaded(true);
            try {
                const data = await fetchGet<any>("/api/friends"); // type needs to be changed!
                setFriends(data);
            } catch (error) {
                console.error("Error Fetching Friends:", error);
            } finally {
                setIsLoaded(false);
            }
        };

        fetchFriends();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTempFriend(e.target.value);
    };

    return (
        <div>

            <div className="flex w-auto items-center space-x-4">
                <input
                    type="text" 
                    placeholder="Enter your friend's name"
                    value={tempFriend}
                    onChange={handleChange}
                    className="w-full text-black p-2 border rounded"
                    maxLength={15} />
                    <button
                        className={`flex bg-blue-500 hover:bg-blue-700 disabled:bg-red-500 disabled:hover:bg-red-700 text-white px-2 py-2 rounded  transition-all duration-150`}>
                    <svg className="w-6 m-1 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                    </button>
                    
            </div>
            <div>
                <ul className="list-disc list-inside">
                    <li>Friend 1</li>
                    <li>Friend 2</li>
                    <li>Friend 3</li>
                </ul>
            </div>
        </div>
    );
}

