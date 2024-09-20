"use client";
import Image from "next/image";
import { AddFriendsForm, NicknameForm, FriendsList } from "./form_components";
import { useState, useEffect, useContext, useRef, MutableRefObject, Dispatch, SetStateAction } from "react";
import { fetchGet, fetchPost, fetchPostImage } from "../fetch_functions";
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

      {state === 'In-Game' &&  (<div className={`absolute bottom-[-1px] right-[-1px] bg-yellow-500 rounded-full border-2 border-white`}
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
  const [reload, setReload] = useState<boolean>(false);

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
  }, [reload]);

  if (!user) 
    return <div>Loading...</div>;

  return (
    <div>
    <div className="flex flex-col justify-center items-center bg-slate-900 nm-inset-slate-900 border-slate-800 border-4 rounded-lg ml-12 p-6 w-[83rem]">
      <h1 className="text-2xl">Friends</h1>
      <p className="w-auto whitespace-nowrap pb-4 ">&#60;-------------------------------&#62;</p>
      <FriendsList />
    </div>
    <div className="flex flex-grow justify-center space-x-12 p-12 w-full">
      <div className="bg-slate-900 nm-inset-slate-900 border-slate-800 border-4 rounded-lg p-8 max-w-2xl ">
        <div className="flex items-center space-x-4 w-[35rem]">
          <div className="relative">
            <Image
              src={user.image}
              alt="Profile Image"
              width={100}
              height={100}
              className="min-w-24 min-h-24 max-w-24 max-h-24 rounded-full object-cover"
              />
              <ImageUpload setReload={setReload} nicknameContext={nicknameContext} />          
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
              <span className="text-lg">Wins: {user.wins}</span>{" "}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">Losses: {user.losses}</span>{" "}
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
    <div className=" bg-slate-900 nm-inset-slate-900 border-slate-800 border-4 rounded-lg p-8">
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

const ImageUpload = ({ setReload , nicknameContext} : {setReload: Dispatch<SetStateAction<boolean>>, nicknameContext: NicknameFormProps | undefined}) => {

  const fileinputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    if (fileinputRef.current)
      fileinputRef.current.click();
  }

  async function UploadImage(e: React.ChangeEvent<HTMLInputElement>) {

    const image = e.target.files?.[0];

    if (!image)
      return;
    console.log("Image: ", image);
    let formData = new FormData();
    formData.append("name", "Profile Image");
    formData.append("file", image);
    if (image.type.startsWith("image/")) {
      console.log("formData: ", formData);
      await fetchPostImage("api/UploadImage", formData)
      .then((res) => {
        console.log("Response: ", res);
        setReload(prev => !prev);
        nicknameContext?.setReload(prev => !prev);
      })
    } else {
      alert("Invalid file type");
    }  
  };

return (
  <div>
    <input 
    type="file"
    ref={fileinputRef}
    className="hidden"
    accept="image/*"
    onChange={UploadImage}
    />
    <svg className="h-7 w-7 absolute bottom-[-4px] right-[-15px] cursor-pointer" onClick={handleClick} viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>plus_circle [#1427]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-179.000000, -600.000000)" fill="#ffffff"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M137.7,450 C137.7,450.552 137.2296,451 136.65,451 L134.55,451 L134.55,453 C134.55,453.552 134.0796,454 133.5,454 C132.9204,454 132.45,453.552 132.45,453 L132.45,451 L130.35,451 C129.7704,451 129.3,450.552 129.3,450 C129.3,449.448 129.7704,449 130.35,449 L132.45,449 L132.45,447 C132.45,446.448 132.9204,446 133.5,446 C134.0796,446 134.55,446.448 134.55,447 L134.55,449 L136.65,449 C137.2296,449 137.7,449.448 137.7,450 M133.5,458 C128.86845,458 125.1,454.411 125.1,450 C125.1,445.589 128.86845,442 133.5,442 C138.13155,442 141.9,445.589 141.9,450 C141.9,454.411 138.13155,458 133.5,458 M133.5,440 C127.70085,440 123,444.477 123,450 C123,455.523 127.70085,460 133.5,460 C139.29915,460 144,455.523 144,450 C144,444.477 139.29915,440 133.5,440" id="plus_circle-[#1427]"> </path> </g> </g> </g> </g></svg> 
  </div> )
}
