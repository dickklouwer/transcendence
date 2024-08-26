"use client";
import { useState, useEffect, ChangeEvent,SetStateAction, Dispatch } from "react";
import Image from "next/image";
import { fetchGet, fetchPost } from "../fetch_functions";
import type { ExternalUser, Friends } from "@repo/db";
import { userSocket } from "../profile_headers";
import { DisplayUserStatus } from "./page";

/* -- SetNicknameForm Component --> */
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

/* -- AddFriendsForm Component --> */
export const AddFriendsForm = () => {
    const [searchName, setSearchName] = useState<string>("");
    const [externalUsers, setExternalUsers] = useState<ExternalUser[]>([]);
    const [ getApprovedFriends, setGetApprovedFriends] = useState<ExternalUser[]>([]);
    const [friendsList, setFriendsList] = useState<Friends[]>([]);
    const [incomingFriendRequests, setIncomingFriendRequests] = useState<ExternalUser[]>([]);
    const [isSend, setIsSend] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
      try {
          fetchGet<ExternalUser[]>("/api/getExternalUsers")
          .then((data) => {
          setExternalUsers(data);
          });

          fetchGet<Friends[]>("/api/getFriendsNotApproved")
          .then((data) => {
              setFriendsList(data);
          });

          fetchGet<ExternalUser[]>("/api/getApprovedFriends")
          .then((data) => {
              setGetApprovedFriends(data);
          });

          fetchGet<ExternalUser[]>("/api/incomingFriendRequests")
          .then((data) => {
              setIncomingFriendRequests(data);
          });

      } catch (error) {
          console.error("Error Getting Friends:", error);
      }}

      const delayDebounceFn = setTimeout(() => {
        fetchData();
      }, 300); // Delay before fetching the data
  
      return () => clearTimeout(delayDebounceFn);      
    }, [isSend, searchName]);

    const filteredChatFields = externalUsers?.filter((userField) => {
      return userField.user_name.toLowerCase().includes(searchName.toLowerCase());
  }).sort((one, two) => ( one > two ? -1 : 1)) ?? [];

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchName(e.target.value);

    };

    const sendFriendRequest = async (user_intra_id: number) => {
        try {
            await fetchPost<{user_intra_id: number}, boolean>("/api/sendFriendRequest", { user_intra_id: user_intra_id })
            .then(() => {
                console.log("Friend Request Sent");
                setIsSend(prev => !prev);
                userSocket.emit('FriendRequestNotification', user_intra_id);
            })

        } catch (error) {
            console.error("Error Sending Friend Request:", error);
        }
    }

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
            <div className=" overflow-scroll h-[30.5rem]">
                { filteredChatFields.map((user) => (
                    <div key={user.intra_user_id} className=" justify-center">
                      { getApprovedFriends.find((friend) => friend.intra_user_id === user.intra_user_id) || incomingFriendRequests.find((friend) => friend.intra_user_id === user.intra_user_id) ? null :
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
                              {friendsList.find((friend) => friend.user_id_receive === user.intra_user_id && friend.is_approved == false) ? 
                              <svg className="w-13 h-12 pr-2 items-center" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                              <path d="M19 3A1 1 0 1019 5 1 1 0 1019 3zM16 3A1 1 0 1016 5 1 1 0 1016 3zM13 3A1 1 0 1013 5 1 1 0 1013 3zM25 6A1 1 0 1025 8 1 1 0 1025 6zM22 3A1 1 0 1022 5 1 1 0 1022 3zM7 6A1 1 0 107 8 1 1 0 107 6zM10 3A1 1 0 1010 5 1 1 0 1010 3zM28 9A1 1 0 1028 11 1 1 0 1028 9zM4 9A1 1 0 104 11 1 1 0 104 9zM4 12A1 1 0 104 14 1 1 0 104 12zM4 15A1 1 0 104 17 1 1 0 104 15zM4 18A1 1 0 104 20 1 1 0 104 18zM7 24A1 1 0 107 26 1 1 0 107 24zM4 21A1 1 0 104 23 1 1 0 104 21zM25 24A1 1 0 1025 26 1 1 0 1025 24zM28 12A1 1 0 1028 14 1 1 0 1028 12zM28 15A1 1 0 1028 17 1 1 0 1028 15zM28 18A1 1 0 1028 20 1 1 0 1028 18zM28 21A1 1 0 1028 23 1 1 0 1028 21zM22 27A1 1 0 1022 29 1 1 0 1022 27zM10 27A1 1 0 1010 29 1 1 0 1010 27zM19 27A1 1 0 1019 29 1 1 0 1019 27zM16 27A1 1 0 1016 29 1 1 0 1016 27zM16 12A1 1 0 1016 14 1 1 0 1016 12zM16 15A1 1 0 1016 17 1 1 0 1016 15zM19 15A1 1 0 1019 17 1 1 0 1019 15zM22 15A1 1 0 1022 17 1 1 0 1022 15zM16 9A1 1 0 1016 11 1 1 0 1016 9zM13 27A1 1 0 1013 29 1 1 0 1013 27z"></path>
                              </svg>
                            : 
                              <button className=" bg-green-500 hover:bg-green-700 transition-all duration-300 p-2 rounded-md"
                              onClick={() => {sendFriendRequest(user.intra_user_id)}
                              }>
                                  <svg className="pl-2 h-11 w-11 items-center" fill="#ffffff" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <rect y="100.174" width="33.391" height="144.696"></rect> </g> </g> <g> <g> <rect x="311.652" y="100.174" width="33.391" height="144.696"></rect> </g> </g> <g> <g> <rect x="100.174" width="144.696" height="33.391"></rect> </g> </g> <g> <g> <rect x="33.391" y="66.783" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="66.783" y="33.391" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="244.87" y="33.391" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="278.261" y="66.783" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="33.391" y="244.87" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="278.261" y="244.87" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <polygon points="244.87,278.261 244.87,311.652 211.478,311.652 211.478,345.043 278.261,345.043 278.261,278.261 "></polygon> </g> </g> <g> <g> <rect x="33.391" y="345.043" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <polygon points="100.174,311.652 100.174,278.261 66.783,278.261 66.783,345.043 133.565,345.043 133.565,311.652 "></polygon> </g> </g> <g> <g> <polygon points="411.826,378.435 411.826,345.043 378.435,345.043 378.435,378.435 345.043,378.435 345.043,411.826 378.435,411.826 378.435,445.217 411.826,445.217 411.826,411.826 445.217,411.826 445.217,378.435 "></polygon> </g> </g> <g> <g> <rect x="478.609" y="345.043" width="33.391" height="100.174"></rect> </g> </g> <g> <g> <rect x="345.043" y="478.609" width="100.174" height="33.391"></rect> </g> </g> <g> <g> <rect x="345.043" y="278.261" width="100.174" height="33.391"></rect> </g> </g> <g> <g> <polygon points="278.261,345.043 278.261,411.826 33.391,411.826 33.391,378.435 0,378.435 0,445.217 311.652,445.217 311.652,345.043 "></polygon> </g> </g> <g> <g> <rect x="311.652" y="311.652" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="445.217" y="311.652" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="445.217" y="445.217" width="33.391" height="33.391"></rect> </g> </g> <g> <g> <rect x="311.652" y="445.217" width="33.391" height="33.391"></rect> </g> </g> </g></svg>
                              </button>}
                            </div>
                        </div>}
                    </div> 
                ))}
              </div>
        </div>
    );
}


export const FriendsList = () => {
    const [friendsList, setFriendsList] = useState<ExternalUser[]>([]);
    const [reload, setReload] = useState<boolean>(false);

    useEffect(() => {
        try {
            fetchGet<ExternalUser[]>("/api/getApprovedFriends")
            .then((data) => {
                setFriendsList(data);
            });
            
            userSocket.on('statusChange', () => {
                setReload(prev => !prev);
            });

        } catch (error) {
            console.error("Error Getting Friends:", error);
        }

        return () => {
            userSocket.off('statusChange');
        };
       }, [reload]);

    return (
      <div className="container mx-auto">
        <div className="flex flex-wrap gap-4 max-h-60 overflow-x-scroll justify-center items-center">
          {friendsList.length === 0 && <p className="text-center text-1xl whitespace-nowrap">No friends :(</p>}
                  {friendsList.map((user) => (
                      <div key={user.intra_user_id} className="">
                        <div className="flex flex-col w-[38rem] p-2 px-4 space-x-2 bg-slate-950 border-white rounded-md">
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
                                {user.nick_name === null ? 
                                  <h1 className="text-1xl">{user.user_name}</h1> :
                                  <div>
                                    <h1 className="text-1xl">{user.nick_name}</h1>
                                  </div>
                                  }
                                  <p className="text-blue-400 break-all">{user.email}</p>
                              </div>
                            </div> 
                          </div>
                      </div>
                  ))}      
          </div>
      </div>
    )

}

