"use client";
import Image from "next/image";
import { useState, useEffect, ChangeEvent } from "react";
import { fetchPost, fetchProfile } from "../page";
import Link from 'next/link';
import { Dispatch, SetStateAction } from "react";

type ApiResponse = boolean;

const NicknameForm = ({setNickname, tempNickname, setTempNickname} : {setNickname: Dispatch<SetStateAction<string>>, tempNickname : string, setTempNickname: Dispatch<SetStateAction<string>>}) => {
  const [isUnique, setIsUnique] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  useEffect(() => {
    const checkNickname = async () => {
      if (tempNickname.trim() === '') {
        setIsUnique(true);
        return;
      }

      setIsLoaded(false);

      try{
        const response = await fetch(`/api/checkNickname?nickname=${tempNickname}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }},
        );
        const data : ApiResponse = await response.json();
        setIsUnique(data);
      } catch (error) {
        console.error('Error Checking Nickname:', error);
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

  const handleChange = (e : ChangeEvent<HTMLInputElement>) => {
    setTempNickname(e.target.value);
  };

  async function dbSetNickname() {
    if (!isUnique) {
      return;
    }
    try {
      const response = await fetch(`/api/setNickname?nickname=${tempNickname}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setNickname(tempNickname);
      setIsConfirmed(true);
      setTempNickname('');
    } catch (error) {
      console.error('Error Setting Nickname:', error);
    }
  }

  return ( 
    <div>
      <div className="flex space-x-2">
        <input
        type="text"
        value={tempNickname}
        onChange={handleChange}
        placeholder="Enter your nickname"
        className={`w-full text-black p-2 border rounded  ${isUnique ? 'border-green-500' : 'border-red-500'}`}
        maxLength={20}/>
        <button className={` ${isUnique ? 'bg-green-500 hover:bg-green-700' : 'bg-red-500 hover:bg-red-700'} text-white px-2 py-2 rounded  transition-all duration-150`} onClick={dbSetNickname} disabled={!isUnique || tempNickname.trim() === ''}> Save </button>
      </div>
        {isLoaded && <p>Checking...</p>}
        {!isLoaded && !isUnique && <p className="text-red-500">Nickname is already been taken</p>}
        {!isLoaded && isUnique && isConfirmed && <p className="text-green-500">Nickname has been set</p>}
    </div>
  );
}

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

export default function Profile() {
    const [user, setUser] = useState<any>(null); // This Any needs to be replaced with the correct type that we will get from the backend
    const [nickname, setNickname] = useState<string>('');
    const [tempNickname, setTempNickname] = useState<string>('');

  

    useEffect(() => {
        fetchProfile(localStorage.getItem('token'))
        .then((data) => {
            console.log('Retrieved Data: ', data);
            setUser(data);
            if (data.nick_name !== null && data.nick_name !== undefined)
              setNickname(data.nick_name);
        })
        .catch((error) => {
            console.log('Error: ', error);
        });
    }, []);

    if (!user)
        return <div>Loading...</div>;
    return ( 
      <div className="bg-slate-900 shadow-lg rounded-lg p-8 max-w-2xl w-full">
        <div className="flex items-center space-x-4 mb-6">
          <Image src={user.image} alt="Profile Image" width={100} height={100} className="w-24 h-24 rounded-full" />
            <div>
              {nickname === '' ? <h1 className="text-2xl">{user.user_name}</h1> : <h1 className="text-2xl">{nickname} aka ({user.user_name})</h1>}
              <p className="text-blue-400">{user.email}</p>
            </div>
        </div>
        <div className="mb-6">
          <label className="block text-blue-400 mb-2">Custom Nickname</label>
          <div className="flex space-x-2">
            <NicknameForm nickname={nickname} setNickname={setNickname} tempNickname={tempNickname} setTempNickname={setTempNickname}/>
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
              <span className="text-lg">Wins: 10</span> {/* This 10 should be replaced with the actual number of wins */}
            </div>
            <div className="flex items-center space-x-2">
             <span className="text-lg">Losses: 5</span> {/* This 5 should be replaced with the actual number of losses */}
            </div>
          </div>
        </div>
        <div className="flex justify-between w-full">
          <Link className="bg-blue-500 text-white flex justify-center px-4 py-4 rounded flex-grow mr-8" href={'/menu'}>
            Back to Menu
          </Link>
          <button className="bg-blue-500 text-white flex justify-center px-4 py-4 rounded flex-grow" onClick={() => createMockData()}>
            Create mock data
          </button>
        </div>
    </div>
  );
};