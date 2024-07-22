"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { fetchProfile } from "../page";
import Link from 'next/link';


export default function Profile() {
    const [user, setUser] = useState<any>(null); // This Any needs to be replaced with the correct type that we will get from the backend
    
    useEffect(() => {
        fetchProfile(localStorage.getItem('token'))
        .then((data) => {
            console.log('Retrieved Data: ', data);
            setUser(data);
        })
    }, []);

    if (!user)
        return <div>Loading...</div>;
    return ( 
      <div className="bg-slate-900 shadow-lg rounded-lg p-8 max-w-2xl w-full">
        <div className="flex items-center space-x-4 mb-6">
          <Image src={user.image} alt="Profile Image" width={100} height={100} className="w-24 h-24 rounded-full" />
            <div>
              <h1 className="text-2xl">{user.user_name}</h1>
              <p className="text-blue-400">{user.email}</p>
            </div>
        </div>
        <div className="mb-6">
          <label className="block text-blue-400 mb-2">Custom Nickname</label>
          <input type="text" id="nickname" className="w-full text-black p-2 border rounded" placeholder="Enter your custom nickname" maxLength={10}/>
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
      <Link className="bg-blue-500 text-white flex justify-center px-4 py-4 rounded" href={'/2fa'}> Enable 2FA</Link>
      <Link className="bg-blue-500 text-white flex justify-center px-4 py-4 rounded" href={'/menu'}>
          Back to Menu
        </Link>
    </div>
  );
};