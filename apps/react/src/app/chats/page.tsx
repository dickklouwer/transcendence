"use client";

import { fetchGet, fetchPost } from '@/app/fetch_functions';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from "next/image";
import defaultUserImage from '@/app/images/defaltUserImage.jpg';
import { DmInfo, InvitedChats, UserChats } from '@repo/db';
import { chatSocket } from '@/app/chat_componens';
import { renderDate } from '@/app/chat_componens';

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
    const [chatInfo, setDmInfo] = useState<DmInfo>({ isDm: false, intraId: null, nickName: null, chatId: null, title: null, image: null });
    const [gameInvite, setGameInvite] = useState<boolean>(false);

    useEffect(() => {
        fetchGet<DmInfo>(`api/getChatInfo?chat_id=${chatField.chatid}`)
        .then((res) => {
            setDmInfo(res);
        })
        .catch((error) => {
            console.log('Error: ', error);
        });
        console.log(`chatInfo.intraId: ${chatInfo.intraId}`);

        if (chatInfo.isDm) {
            fetchGet<boolean>(`api/checkIfInvidedForGame?other_intra_id=${chatInfo.intraId}`)
            .then((res) => {
                setGameInvite(res);
            })
            .catch((error) => {
                console.log('Error: ', error);
            });
        }

    }, [chatField, chatInfo.intraId, chatInfo.isDm]);

    return (
        <div style={{ width: commonWidth }} className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="flex items-center space-x-4 p-4 justify-between">
                {chatInfo.isDm ? (
                    <Link href={{ pathname: '/profile_view', query: { user_id: chatInfo.intraId } }}>
                        <div className="flex justify-center items-center w-12 h-12">
                            <Image src={userImage} alt="User or Group" width={48} height={48} className="rounded-full" />
                        </div>
                    </Link>
                ) : (
                    <Link href={{ pathname: '/group_view', query: { chat_id: chatField.chatid } }}>
                        <div className="flex justify-center items-center w-12 h-12">
                            <Image src={userImage} alt="User or Group" width={48} height={48} className="rounded-full" />
                        </div>
                    </Link>
                )}
                <Link className="flex-grow" href={{ pathname: '/messages', query: { chat_id: chatField.chatid } }}>
                    <div className="flex justify-between w-full">
                        <div>
                            <h3 className="font-bold text-left">{chatField.title}</h3>
                            <p className="max-w-xs overflow-ellipsis overflow-hidden text-gray-500 whitespace-nowrap text-sm">
                                {chatField.lastMessage && !chatField.hasPassword ? (
                                    <>
                                    {gameInvite ? (
                                        <span className="text-blue-500">{chatField.nickName} </span>
                                    ) : (
                                        <span className="text-white">{chatField.nickName} </span>
                                    )}
                                    {chatField.lastMessage.startsWith('#') ? (
                                        <i className="text-blue-500">Game invite</i>
                                    ) : (
                                        <span className="text-gray-500">{chatField.lastMessage}</span>
                                    )}
                                    </>
                                ) : chatField.hasPassword ? (
                                    <i className="text-gray-500">Password</i>
                                ) : (
                                    <i className="text-gray-500">No messages yet...</i>
                                )}
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <p>{renderDate(chatField.time)}</p>
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
                            const transformedMessages = data.map((chat) => {
                                return {
                                    ...chat,
                                    time: new Date(chat.time),
                                }
                            });
                            setUserChats(transformedMessages);
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

    function loadChats() {
        fetchGet<UserChats[]>('api/chats')
            .then((data) => {
                const transformedMessages = data.map((chat) => {
                    return {
                        ...chat,
                        time: new Date(chat.time),
                    }
                });
                setUserChats(transformedMessages);
            })
            .catch((error) => {
                console.log('Error fetching Chats: ', error);
            });

        fetchGet<UserChats[]>('api/invitedChats')
            .then((data) => {
                setInvitedChats(data);
            })
            .catch((error) => {
                console.log('Error fetching Invited Chats: ', error);
            });
    }

    useEffect(() => {
        loadChats();

        chatSocket.on('messageUpdate', () => {
            setReload(prev => !prev);
        });

        return () => {
            chatSocket.off('messageUpdate');
        }
    }, [reload]);

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
