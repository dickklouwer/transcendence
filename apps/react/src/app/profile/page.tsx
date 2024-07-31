"use client";
import { useEffect, useState } from 'react';
import { fetchProfile } from '../page';
import Link from 'next/link';
import Image from 'next/image';

export default function Profile() {
  const [user, setUser] = useState<any>(null); // Replace 'any' with the correct type

  useEffect(() => {
    fetchProfile(localStorage.getItem('token'))
      .then((data) => {
        console.log('Retrieved Data: ', data);
        setUser(data);
      })
      .catch((error) => {
        console.log('Error: ', error);
        // handle error, e.g., redirect to login
      });
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-w-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 h-full max-h-md">
        <div className="flex items-center space-x-4 mb-6">
          <Image src={user.image_url} alt="Profile Image" width={100} height={100} className="w-24 h-24 rounded-full" />
          <div>
            <h1 className="text-2xl text-black">{user.user_name}</h1>
            <p className="text-blue-400">{user.email}</p>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-blue-400 mb-2">Custom Nickname</label>
          <input type="text" id="nickname" className="w-full text-black p-2 border rounded" placeholder="Enter your custom nickname" maxLength={10} />
        </div>
        <div className="mb-6">
          <h2 className="text-xl text-black mb-4">Achievements</h2>
          <ul className="list-disc list-inside text-black">
            <li>Achievement Speed Demon</li>
            <li>Achievement Skill Shot</li>
            <li>Achievement Streak King</li>
          </ul>
        </div>
        <div className="mb-6">
          <h2 className="text-xl text-black mb-4">Wins and Losses</h2>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg text-black">Wins: 10</span> {/* Replace with actual number of wins */}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg text-black">Losses: 5</span> {/* Replace with actual number of losses */}
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
    </div>
  );
}
