"use client";

import React, { useState, useEffect, useRef, use, Fragment, cache } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, ChatMessages, MessageStatus, DmInfo, ExternalUser } from '@repo/db';
import { fetchGet, fetchPost } from '../fetch_functions';
import { useSearchParams } from 'next/navigation';
import { chatSocket } from '../chat_componens';
import defaultUserImage from '@/app/images/defaltUserImage.jpg';
import { renderDate } from '@/app/chat_componens';

import io, { Socket } from 'socket.io-client';
import { userSocket } from '../profile_headers';
import { DisplayUserStatus } from '../profile/page';

const multiplayerSocket = io(`http://${process.env.NEXT_PUBLIC_HOST_NAME}:4433/multiplayer`, {
    path: "/ws/socket.io",
    autoConnect: false, // Prevent automatic connection
});

const checkPassword: boolean = true;

function Message({ message, intra_id }: { message: ChatMessages, intra_id: number }) {
    const isMyMessage = message.sender_id === intra_id;
    const bubbleClass = isMyMessage ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black';
    const [fullStatus, setFullStatus] = useState<MessageStatus[] | null>(null);
    const [status, setStatus] = useState<String>('sent');
    const [showStatus, setShowStatus] = useState(false);
    const [reload, setReload] = useState<boolean>(false);

    const renderMessageWithLineBreaks = (text: string) => {
        return text.split('\n').map((str, index) => (
            <div key={index}>{str}</div>
        ));
    };

    useEffect(() => {
        chatSocket.on('statusUpdate', () => {
            setReload(prev => !prev);
        });
        return () => {
            chatSocket.off('statusUpdate');
        }
    }, [reload, fullStatus]);

    return (
        <button className='w-full'>
            <div className={`mb-2 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2 rounded-lg ${isMyMessage ? 'rounded-br-none' : 'rounded-bl-none'} ${bubbleClass} max-w-xs`}>
                    {!isMyMessage && <div className="text-xs text-gray-600">{message.sender_name}</div>}
                    {message.is_muted ? <div className="text-red-800">You are muted in this chat</div> : renderMessageWithLineBreaks(message.message)}
                    <div className="text-xs text-right text-gray-600">{renderDate(message.sent_at)}</div>
                    {isMyMessage && <div className="text-xs text-right text-gray-600">{status}</div>}
                 </div>
            </div>
         </button>
    );
}

function customTransparantToBlack() {
    return (
        <div className="
            absolute
            top-0 left-0
            right-0 h-10
            bg-gradient-to-b
            from-black via-black
            to-transparent
            opacity-100">
        </div>
    );
}

export default function DC() {
    const searchParams = useSearchParams();
    const Router = useRouter();
    const [user, setUser] = useState<User>();
    const [messages, setMessages] = useState<ChatMessages[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [hasPassword, setHasPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [chatInfo, setDmInfo] = useState<DmInfo>({ isDm: false, intraId: null, nickName: null, chatId: null, title: null, image: null });
    const [isLoaded, setIsLoaded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const [pSock, setPSock] = useState<Socket | null>(null);
    const [recieveInvite, setRecieveInvite] = useState(false);
    const [friendStatus, setFriendStatus] = useState<"Online" | "Offline" | "In-Game">("Offline");
    const [reload, setReload] = useState<boolean>(false);

    const chat_id: number = Number(searchParams?.get('chat_id')) ?? -1;

    useEffect(() => {
        multiplayerSocket.connect();
        
        
        fetchGet<User>('api/profile')
        .then((user) => {
                setUser(user);
            })
            .catch((error) => {
                console.log('Error: ', error);
            });
            fetchGet<boolean>(`api/chatHasPassword?chat_id=${chat_id}`)
            .then((res) => {
                setHasPassword(res);
                setIsLoaded(true);
            })
            .catch((error) => {
                console.log('Error: ', error);
        });
    }, [chat_id]);
    
    useEffect(() => {
        chatSocket.on('gameInvite', (data: { sender_id: number, receiver_id: number }) => {
            if (data.receiver_id !== user?.intra_user_id) return;
            setRecieveInvite(true);
        });
        return () => {
            chatSocket.off('inviteForGame');
        }
    }, [user]);

    useEffect(() => {
        if (!user || !isLoaded) return;

        if (hasPassword === false) {
            fetchGet<ChatMessages[] | boolean>(`api/messages?chat_id=${chat_id}`)
            .then((res) => {
                    if (typeof res === 'boolean' && res === false) {
                        alert('You are not a member of this chat');
                        Router.push('/chats')
                        return;
                    }
                    
                    if (typeof res === 'boolean') return;
                
                    /* Set date type because the JSON parser does not automatically convert date strings to Date objects */
                    const transformedMessages = res.map(message => ({
                        ...message,
                        sent_at: new Date(message.sent_at)
                    }));
                    setMessages(transformedMessages);
                })
                .catch((error) => {
                    console.log('Error: ', error);
                });
            updateStatusReceivedMessages(chat_id, user.intra_user_id);
            fetchGet<DmInfo>(`api/getChatInfo?chat_id=${chat_id}`)
                .then((res) => {
                    setDmInfo(res);
                })
                .catch((error) => {
                    console.log('Error: ', error);
                });
            fetchGet<boolean>(`api/checkIfInvidedForGame?other_intra_id=${user.intra_user_id}`)
                .then((res) => {
                    if (res) {
                        setRecieveInvite(res);
                    }
                })
                .catch((error) => {
                    console.log('Error: ', error);
                });

            chatSocket.emit('joinChat', { chat_id: chat_id.toString(), intra_user_id: user.intra_user_id.toString() });
            
            chatSocket.on('messageFromServer', (message: ChatMessages) => {
                /* Set date type because the JSON parser does not automatically convert date strings to Date objects */
                message.sent_at = new Date(message.sent_at);
                setMessages((prevMessages) => [...prevMessages, message]);
                 updateStatusReceivedMessages(chat_id, user.intra_user_id);
            });

            chatSocket.on('statusUpdate', () => {
                setMessages((prevMessages) => [...prevMessages]);
            });
        }
        chatSocket.emit('inboxUpdate');

        return () => {
            chatSocket.emit('leaveChat', chat_id.toString());
            chatSocket.off('messageFromServer');
            chatSocket.off('statusUpdate');
        };
    }, [user, chat_id, hasPassword, isLoaded, Router]);

    useEffect(() => {
        try {
            fetchGet<ExternalUser[]>("/api/getApprovedFriends")
            .then((data) => {
                if (chatInfo.isDm && chatInfo.intraId) {
                    setFriendStatus(data.find((friend) => friend.intra_user_id === chatInfo.intraId)?.state ?? "Offline");
                }
            });

            userSocket.on('statusChange', () => {
                setReload(prev => !prev);
            });
        } catch (error) {
            console.log('Error: ', error);
        }

        return () => {
            userSocket.off('statusChange');
        }
    }, [reload, chatInfo]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    } , [messages]);

    useEffect(() => {
        if (!chatInfo.intraId) return;
        fetchGet<boolean>(`api/checkIfInvidedForGame?other_intra_id=${chatInfo.intraId}`)
        .then((res) => {
            if (res) {
                setRecieveInvite(res);
            }
        })
        .catch((error) => {
            console.log('Error: ', error);
        });
    }, [chatInfo]);

    const sendMessage = (message: ChatMessages) => {
        chatSocket.emit('messageToServer', message);
        setNewMessage('');
        chatSocket.emit('inboxUpdate');
    };

    const handleSendMessage = (intra_id: number) => {
        if (newMessage.trim() === '') return;
        if (newMessage.length > 1000) {
            alert('Message is too long');
            return;
        }
        if (newMessage === '#Invite for a game') {
            alert('You can not send this message');
            return;
        }

        const message: ChatMessages = {
            message_id: 0,          // auto generate in database
            chat_id: chat_id,
            sender_id: intra_id,
            sender_name: '',        // get from user database
            sender_image_url: '',   // get from user database
            message: newMessage,
            sent_at: new Date(),     // generate in the backend with instert returnig
            is_muted: false,
        };

        sendMessage(message);
    };


        function updateStatusReceivedMessages(chat_id: number, intra_user_id: number) {
        fetchPost('api/updateStatusReceivedMessages', { chat_id: chat_id, intra_user_id: intra_user_id })
            .then(() => {
                chatSocket.emit('inboxUpdate');
            })
            .catch((error) => {
                console.log('Error updating unread messages: ', error);
            });
    }

    const handlePasswordCheck = () => {
        fetchGet<{ chat_id: string, password: string }>(`api/isValidChatPassword?chat_id=${chat_id}&password=${password}`)
            .then((res) => {
                if (res) setHasPassword(false);
                else alert('Wrong password');
            })
            .catch((error) => {
                console.log('Error: ', error);
            });
    }

    const handleKeyPressPassword = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handlePasswordCheck();
        }
    }

    const handleKeyPressMessage = (e: React.KeyboardEvent<HTMLTextAreaElement>, intra_id: number) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const newMessage = e.currentTarget.value.replace(/\n/g, ''); // remove new line from message
            setNewMessage(newMessage);
            handleSendMessage(intra_id);
        }
    };

    if (hasPassword && checkPassword) {
        return (
            <div className="flex flex-col items-center justify-center flex-grow space-y-4">
                <h2 className="text-2xl font-bold text-center">Password Protected Chat</h2>
                <input
                    type="password"
                    className="bg-gray-900 focus:bg-white focus:outline-none rounded-lg p-2 w-96 text-black"
                    placeholder="Password"
                    autoFocus={true}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={handleKeyPressPassword}
                />
                <div className='flow-root w-96'>
                    <button
                        className="py-2 px-4 rounded bg-blue-500 text-black font-bold float-right"
                        onClick={handlePasswordCheck}
                    >Submit</button>
                    <Link href={'/chats'}>
                        <button className="py-2 px-2 text-blue-500 font-bold float-left">
                            Back
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    if (chat_id === -1) {
        return (
            <div className="flex flex-col items-center justify-center flex-grow space-y-4">
                <h2 className="text-2xl font-bold text-center">Chat not found</h2>
                <Link href={'/chats'}>
                    <button className="py-2 px-2 text-blue-500 font-bold">
                        Back
                    </button>
                </Link>
            </div>
        );
    }

    const image = chatInfo.image ? chatInfo.image : defaultUserImage;

    return (
        <div className="flex flex-col items-center justify-center">
            {chatInfo.isDm && chatInfo.intraId && chatInfo.nickName && (
                <Link href={{ pathname: '/profile_external', query: { id: chatInfo.intraId } }}>
                    <div className="flex items-center">
                        <div className="relative">
                            <Image
                                src={image}
                                alt="Profile Image"
                                className="w-11 h-11 rounded-full"
                                width={100}
                                height={100}
                            />
                            <DisplayUserStatus state={friendStatus} width={15} height={15} />
                         </div>
                        <button className="py-2 px-4 text-blue-500 font-bold">
                            {chatInfo.nickName}
                        </button>
                    </div>
                </Link>
            )}
            {!chatInfo.isDm && chatInfo.chatId && chatInfo.title && (
                <Link href={{ pathname: '/group_view', query: { id: chatInfo.chatId } }}>
                    <div className="flex items-center">
                        <Image
                            src={image}
                            alt="Profile Image"
                            className="w-11 h-11 rounded-full"
                             width={100}
                             height={100}
                        />
                         <button className="py-2 px-4 text-blue-500 font-bold">
                            {chatInfo.title}
                         </button>
                    </div>
                </Link>
            )}
            <div className="relative w-96 px-4 h-80">
                <div className="flex flex-col h-full">
                    {customTransparantToBlack()}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className='h-6'></div>
                        {user && messages.map((message, index) => (
                            <Message key={index} message={message} intra_id={user.intra_user_id} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>
            <div className="flex flex-col space-y-4 px-4 w-96">
                <textarea
                    className="bg-gray-900 focus:bg-white focus:outline-none rounded-lg p-2 w-full text-black"
                    placeholder="Type a message..."
                    id='newMessage'
                    rows={2}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleKeyPressMessage(e, user?.intra_user_id ?? 0)}
                 ></textarea>
                 <div className='flow-root'>
                    <Link className="float-left py-2 px-4" href={'/chats'}>
                        Back
                     </Link>
                    <button
                        className="float-right py-2 px-4 rounded bg-blue-500 text-black font-bold "
                        onClick={() => handleSendMessage(user?.intra_user_id ?? 0)}
                    >
                        Send
                    </button>
                </div>
                 {chatInfo.isDm && chatInfo.intraId && chatInfo.nickName && friendStatus === 'Online' && (
                    <div className="flex flex-col items-center justify-center flex-grow space-y-4">
                    <Link className="flex-grow" href={{ pathname: '/pong/multiplayer', query: { player_id: chatInfo.intraId, nick_name: chatInfo.nickName } }}>
                        {!recieveInvite && user?.intra_user_id && <button className="py-2 px-4 text-blue-500 font-bold" onClick={
                            () => {
                                chatSocket.emit('inviteForGame', { sender_id: user.intra_user_id, receiver_id: chatInfo.intraId, invite: true });
                            }
                        }>
                            Invite for a game
                        </button>}
                    </Link>
                     {recieveInvite && (
                        <div className="flex flex-col items-center space-y-4">
                            <h4 className="text-2xl font-bold text-center">Invite for a game</h4>
                            <div className="flex space-x-4">
                                <Link href={{ pathname: '/pong/multiplayer', query: { player_id: chatInfo.intraId, nick_name: chatInfo.nickName } }}>
                                    <button className="py-2 px-4 text-blue-500 font-bold" onClick={() => {
                                        if (user) {
                                            chatSocket.emit('inviteForGame', { sender_id: user.intra_user_id, receiver_id: chatInfo.intraId, invite: false });
                                        }
                                    }}>
                                       Accept
                                    </button>
                                </Link>
                                <button className="py-2 px-4 text-blue-500 font-bold" onClick={() => {
                                    setRecieveInvite(false);
                                    if (user && user.intra_user_id) {      
                                        console.log('user intra id: ', chatInfo.intraId);
                                        // multiplayerSocket.connect();
                                        console.log('decline emit');
                                        multiplayerSocket.emit('declineGameInvite', {intra_id: user.intra_user_id, opp_id: chatInfo.intraId});
                                        console.log('decline sent');
                                        multiplayerSocket.disconnect();
                                        chatSocket.emit('inviteForGame', { sender_id: user.intra_user_id, receiver_id: chatInfo.intraId, invite: false });
                                    } else {
                                        console.log('No user');
                                    }
                                }}>
                                    Decline
                                </button>
                            </div>
                         </div>
                     )}
                </div>
                )}
                {chatInfo.isDm && chatInfo.intraId && chatInfo.nickName && friendStatus === 'In-Game' && (
                    <div className="flex flex-col items-center justify-center flex-grow space-y-4">
                        <h4 className="text-center">The other player is in a game, you can not invite for a game</h4>
                    </div>
                )}
                 {chatInfo.isDm && chatInfo.intraId && chatInfo.nickName && friendStatus === 'Offline' && (
                     <div className="flex flex-col items-center justify-center flex-grow space-y-4">
                         <h4 className="text-center">The other player is offline, you can not invite for a game</h4>
                     </div>
                 )}
            </div>
         </div>
    );
}