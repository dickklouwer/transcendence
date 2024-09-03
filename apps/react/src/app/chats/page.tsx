"use client";

import { fetchProfile, fetchGet, fetchChats } from '@/app/fetch_functions';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from "next/image";
import defaultUserImage from '@/app/images/defaltUserImage.jpg';
<<<<<<< HEAD
import { UserChats } from '@repo/db';
=======
import {UserChats} from '@repo/db';
>>>>>>> 3ed459c39c31e771a39c2dccc13af487a500fef9

function SearchBar({ searchTerm, setSearchTerm }: { searchTerm: string, setSearchTerm: React.Dispatch<React.SetStateAction<string>> }) {
	return (
		<div className="relative text-gray-600 focus-within:text-gray-400">
			<input
				type="search"
				name="q"
				className="py-2 text-sm text-white bg-gray-900 rounded-md pl-3 pr-3 focus:outline-none focus:bg-white focus:text-gray-900"
				placeholder="Search..."
				autoComplete="off"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>
		</div>
	);
}

function ChatField({ chatField }: { chatField: UserChats }) {
	const userImage = chatField.image ? chatField.image : defaultUserImage;

<<<<<<< HEAD
	return (
		<div className="border border-gray-300 w-256 rounded-lg overflow-hidden">
			<div className="flex items-center space-x-4 p-4 justify-between">
				<button onClick={() => alert('Showing profile of ' + chatField.title)}>
					<Image src={userImage} alt="User or Group" width={48} height={48} className="w-12 h-12 rounded-full" />
				</button>
				<Link className="flex-grow" href={'/messages'}>
					<div className="flex justify-between w-full">
						<div>
							<h3 className="font-bold text-left">{chatField.title}</h3>
							<p className="max-w-xs overflow-ellipsis overflow-hidden whitespace-nowrap text-gray-500">{chatField.lastMessage}</p>
						</div>
						<div className="text-right">
							<p>{chatField.time.toString().slice(11, 16)}</p>
						</div>
					</div>
				</Link>
			</div>
		</div>
	);
=======
    return (
        <div className="border border-gray-300 w-256 rounded-lg overflow-hidden">
            <div className="flex items-center space-x-4 p-4 justify-between">
                <button onClick={() => alert('Showing profile of ' + chatField.title)}>
                    <Image src={userImage} alt="User or Group" width={48} height={48} className="w-12 h-12 rounded-full" />
                </button>
                {/* Use nextjs dynamic app routing */}
                <Link className="flex-grow" href={`/messages`
                }>
                    <div className="flex justify-between w-full">
                        <div>
                            <h3 className="font-bold text-left">{chatField.title}</h3>
                            <p className="max-w-xs overflow-ellipsis overflow-hidden whitespace-nowrap text-gray-500">{chatField.lastMessage}</p>
                        </div>
                        <div className="text-right">
                            <p>{chatField.time.toString().slice(11,16)}</p>
                            {chatField.unreadMessages ? <p className="text-blue-500">{chatField.unreadMessages}</p> : <br />}
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
>>>>>>> 3ed459c39c31e771a39c2dccc13af487a500fef9
}

export default function Chats() {
	const [user, setUser] = useState<any>(null); // This Any needs to be replaced with the correct type that we will get from the backend
	const [userChats, setUserChats] = useState<UserChats[]>();
	const [searchTerm, setSearchTerm] = useState('');

	useEffect(() => {
		// load user data
		fetchProfile(localStorage.getItem('token'))
			.then((data) => {
				console.log('Retrieved Profile Data: ');
				setUser(data);
			})

		fetchGet<UserChats[]>('/api/chats')
			.then((data) => {
				console.log(data);
				setUserChats(data);
			})
	}, []);

	console.log('Get user data');
	if (!user)
		console.log('User: none');
	else
		console.log('User: availeble');
	console.log('Get user chats');
	if (!userChats)
		console.log('User Chats: none');
	else
		console.log('User Chats: ', userChats);

	const filteredChatFields = userChats?.filter((chatField) => {
		return chatField.title.toLowerCase().includes(searchTerm.toLowerCase());
	}) ?? [];

	return (
		<div className="flex flex-col items-center justify-center flex-grow space-y-4">
			<h2 className="text-2xl font-bold text-center">Chats</h2>
			<SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
			<div className="h-64 overflow-auto">
				{filteredChatFields.map((chatField, index) => (
					<ChatField key={index} chatField={chatField} />
				))}
				{filteredChatFields.length == 0 && <p>No chats found...</p>}
			</div>
			<Link className="text-blue-500 mt-4" href={'/menu'}>
				Back to Menu
			</Link>
		</div>
	);
}
