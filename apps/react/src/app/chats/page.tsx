"use client";

import {fetchGet } from '@/app/fetch_functions';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from "next/image";
import defaultUserImage from '@/app/images/defaltUserImage.jpg';
import {UserChats} from '@repo/db';

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

    return (
        <div className="border border-gray-300 w-256 rounded-lg overflow-hidden">
            <div className="flex items-center space-x-4 p-4 justify-between">
                <button onClick={() => alert('Showing profile of ' + chatField.title)}>
                    <Image src={userImage} alt="User or Group" width={48} height={48} className="w-12 h-12 rounded-full" />
                </button>
                <Link className="flex-grow" href={{ pathname: '/messages', query: { chat_id: chatField.chatid } }}>
                    <div className="flex justify-between w-full">
                        <div>
                            <h3 className="font-bold text-left">{chatField.title}</h3>
                            <p className="max-w-xs overflow-ellipsis overflow-hidden whitespace-nowrap text-gray-500">{chatField.lastMessage}</p>
                        </div>
                        <div className="text-right px-4">
                            <p>{chatField.time.toString().slice(11,16)}</p>
                            {chatField.unreadMessages ? <p className="text-blue-500">{chatField.unreadMessages}</p> : <br />}
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default function Chats() {
    const [userChats, setUserChats] = useState<UserChats[]>();
    const [invitedChats, setInvitedChats] = useState<UserChats[]>();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchGet<UserChats[]>('api/chats')
        .then((data) => {
            console.log('Received Chats Data: ', data);
            setUserChats(data);
        })
        .catch((error) => {
            console.log('Error fetching Chats: ', error);
        });

        fetchGet<UserChats[]>('api/invitedChats')
        .then((data) => {
            console.log('Received Invited Chats Data: ', data);
            setInvitedChats(data);
        })
        .catch((error) => {
            console.log('Error fetching Invited Chats: ', error);
        });
    }, []);

    const validUserChats = Array.isArray(userChats) ? userChats : [];
    const filteredChatFields = validUserChats
        .filter((chatField) => chatField.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            return new Date(b.time).getTime() - new Date(a.time).getTime();
        }
    );

    return (
        <div className="flex flex-col items-center justify-center flex-grow space-y-4">
            <h2 className="text-2xl font-bold text-center">Chats</h2>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <div className="h-64 overflow-auto">
                {filteredChatFields.map((chatField, index) => (
                    <ChatField key={index} chatField={chatField} />
                ))}
                { filteredChatFields.length == 0 && <p>No chats found...</p> }
            </div>
            <Link className="text-blue-500 mt-4" href={'/menu'}>
                Back to Menu
            </Link>
        </div>
    );
}
