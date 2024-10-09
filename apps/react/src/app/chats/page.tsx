"use client";

import { fetchGet, fetchPost } from '@/app/fetch_functions';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from "next/image";
import defaultUserImage from '@/app/images/defaltUserImage.jpg';
import { InvitedChats, UserChats } from '@repo/db';
import io from 'socket.io-client';

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
    const commonWidth = "500px";

    return (
        <div style={{ width: commonWidth }} className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="flex items-center space-x-4 p-4 justify-between">
                <button onClick={() => alert('Showing profile of ' + chatField.title)}>
                    <Image src={userImage} alt="User or Group" width={48} height={48} className="w-12 h-12 rounded-full" />
                </button>
                <Link className="flex-grow" href={{ pathname: '/messages', query: { chat_id: chatField.chatid } }}>
                    <div className="flex justify-between w-full">
                        <div>
                            <h3 className="font-bold text-left">{chatField.title}</h3>
                            <p className="max-w-xs overflow-ellipsis overflow-hidden whitespace-nowrap text-gray-500">{chatField.lastMessage ? chatField.lastMessage : <i>No messages yet...</i>}</p>
                        </div>
                        <div className="text-right px-4">
                            <p>{chatField.time.toString().slice(11, 16)}</p>
                            {chatField.unreadMessages ? <p className="text-blue-500">{chatField.unreadMessages}</p> : <br />}
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

function InvitedChatField({ chatField: invitedChatField, setInvitedChats, setUserChats }: {
    chatField: InvitedChats, 
    setUserChats: React.Dispatch<React.SetStateAction<UserChats[] | undefined>> 
    setInvitedChats: React.Dispatch<React.SetStateAction<InvitedChats[] | undefined>>

}) {
    const userImage = invitedChatField.image ? invitedChatField.image : defaultUserImage;
    const commonWidth = "500px";

    const joinChat = (chat_id: number) => {
        fetchGet<boolean>(`api/checkIfBanned?chat_id=${chat_id}`)
            .then((isBanned) => {
                if (isBanned) {
                    alert('You are banned from this chat');
                }
            })
            .catch((error) => {
                console.log('Error joining chat: ', error);
            });
        fetchPost('api/joinChat', { chat_id: chat_id })
                .then(() => {
                    setInvitedChats((prevChats) => (prevChats as InvitedChats[]).filter(chat => chat.chatid !== chat_id));
                    fetchGet<UserChats[]>('api/chats')
                        .then((data) => {
                            console.log('Received Chats Data: ', data);
                            setUserChats(data);
                        })
                        .catch((error) => {
                            console.log('Error fetching Chats: ', error);
                        });
            })
            .catch((error) => {
                console.log('Error checking if banned: ', error);
                return;
            });
    }

    return (
        <div style={{ width: commonWidth }} className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="flex items-center space-x-4 p-4 justify-between">
                <button onClick={() => alert('Showing image of ' + invitedChatField.title + ' groep')}>
                    <Image src={userImage} alt="User or Group" width={48} height={48} className="w-12 h-12 rounded-full" />
                </button>
                <div className="flex-grow">
                    <div className="flex justify-between w-full">
                        <div>
                            <h3 className="font-bold text-left">{invitedChatField.title}</h3>
                        </div>
                        <div className="text-right px-4">
                            <button className="text-blue-500" onClick={() => joinChat(invitedChatField.chatid)}>
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Chats() {
    const [userChats, setUserChats] = useState<UserChats[]>();
    const [invitedChats, setInvitedChats] = useState<InvitedChats[]>();
    const [searchTerm, setSearchTerm] = useState('');
    const [reload, setReload] = useState<boolean>(false);
    const socketRef = useRef<ReturnType<typeof io> | null>(null);

    function loadChats() {
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
    }


    useEffect(() => {
        loadChats();
        // userSocket.on('sendFriendRequestAccepted', () => {
        //     setReload(prev => !prev);
        //   });
        
    }, []);

    const validUserChats = Array.isArray(userChats) ? userChats : [];
    const filteredChatFields = validUserChats
        .filter((chatField) => chatField.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            return new Date(b.time).getTime() - new Date(a.time).getTime();
        }
        );

    const validInvitedChats = Array.isArray(invitedChats) ? invitedChats : [];
    const filteredInvitedChatFields = validInvitedChats
        .filter((chatField) => chatField.title.toLowerCase().includes(searchTerm.toLowerCase()));

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
            <h2 className="text-2xl font-bold text-center">Invited Chats</h2>
            <div className="h-64 overflow-auto">
                {filteredInvitedChatFields.map((chatField, index) => (
                    <InvitedChatField key={index} chatField={chatField} setUserChats={setUserChats} setInvitedChats={setInvitedChats} />
                ))}
                {filteredInvitedChatFields.length == 0 && <p>No invited chats found...</p>}
            </div>
            <Link className="text-blue-500 mt-4" href={'/menu'}>
                Back to Menu
            </Link>
        </div>
    );
}
