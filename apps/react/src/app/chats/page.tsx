"use client";

import { fetchProfile, fetchChats } from '@/app/page';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from "next/image";
import defaultUserImage from '@/app/images/defaltUserImage.jpg';
import {UserChats} from '../../../../nestjs/src/auth/auth.service';

/* notes for showing inbox

Show message in inbox when:
- messages.receiver_id === own_id (use fetchProfile() to get own_id)
  show:
  - users.user_name where users.intra_user_id === messages.sender_id
  - messages.message where (last send)
  - messages.sent_at where (last send)
  - (count where messages.message_id === message_status.message_id && message_status.read_at === null)
- group_chats_users.intra_user_id == own_id (use fetchProfile() to get own_id)
  show:
  - group_chats.group_name where group_chats_users
  - messages.message where (last send)
  - messages.sent_at where (last send)
  - (count where messages.message_id === message_status.message_id && message_status.read_at === null)

Back-end function for chats:
    get_chats() {
        return (
            {
                message_id,
                type: [dm | gm],
                titel: [users.user_name | group_chats.group_name],
                image: [users.image | group_chats.group_image],
                lastMessage: messages.message where (last send),
                time: messages.sent_at where (last send),
                unreadMessages: ''
            }
        );
    }

    

Back-end function for dm & gm:
custom functions:
    get_chat_info(message_id) {
        return (
            {
                titel: [users.user_name | group_chats.group_name],
                image: [users.image | group_chats.group_image],
                users: [
                    user_id,
                    user_name,
                    user_image
                ]
            }
        );
    }
    
    get_chat(message_id) {
        return (
            {
                message_id,
                sender_id,
                receiver_id,
                group_chat_id,
                message,
                sent_at
            }
        )
    }

    get_own_id() {
        return (own_id);
    }

*/

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
    // const formatTime = (time: Date) => {
    //     const today = new Date();
    //     const yesterday = new Date(today);
    //     yesterday.setDate(yesterday.getDate() - 1);

    //     if (time.toDateString() === today.toDateString()) {
    //         return time.toTimeString().slice(0, 5); // Only show the time
    //     } else if (time.toDateString() === yesterday.toDateString()) {
    //         return "Yesterday";
    //     } else {
    //         const day = time.getDate();
    //         const month = time.toLocaleString('default', { month: 'short' }).toLowerCase();
    //         const year = time.getFullYear();
    //         return `${day}-${month}-${year}`;
    //     }
    // };

    const userImage = chatField.image ? chatField.image : defaultUserImage;

    return (
        <div className="border border-gray-300 w-256 rounded-lg overflow-hidden">
            <div className="flex items-center space-x-4 p-4 justify-between">
                <button onClick={() => alert('Showing profile of ' + chatField.title)}>
                    <Image src={userImage} alt="User or Group" width={48} height={48} className="w-12 h-12 rounded-full" />
                </button>
                <Link className="flex-grow" href={'/dc'}>
                    <div className="flex justify-between w-full">
                        <div>
                            <h3 className="font-bold text-left">{chatField.title}</h3>
                            <p className="max-w-xs overflow-ellipsis overflow-hidden whitespace-nowrap text-gray-500">{chatField.lastMessage}</p>
                        </div>
                        <div className="text-right">
                            {/* <p>{formatTime(chatField.time)}</p> */}
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
    const [user , setUser] = useState<any>(null); // This Any needs to be replaced with the correct type that we will get from the backend
    const [userChats, setUserChats] = useState<UserChats[]>();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // load user data
        fetchProfile(localStorage.getItem('token'))
        .then((data) => {
            console.log('Retrieved Profile Data: ');
            setUser(data);
        })
        // Sort the chatFields by time, with the newest messages at the top
        setUserChats(userChats => {
            if (userChats) {
                return userChats.sort((a, b) => {
                    return b.time.getTime() - a.time.getTime();
                });
            }
            return userChats;
        });

        // load user chats
        fetchChats(localStorage.getItem('token'))
        .then((data) => {
            console.log('Received Chats Data: ');
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
                { filteredChatFields.length == 0 && <p>No chats found...</p> }
            </div>
            <Link className="text-blue-500 mt-4" href={'/menu'}>
                Back to Menu
            </Link>
            <p>----- Temporary -----</p>
            <Link className="bg-blue-500 text-white font-bold py-2 px-4 rounded" href={'/dc'}>
                DC
            </Link>
            <Link className="bg-blue-500 text-white font-bold py-2 px-4 rounded" href={'/gc'}>
                GC
            </Link>
        </div>
    );
}
