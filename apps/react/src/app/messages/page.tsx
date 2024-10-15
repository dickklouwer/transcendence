"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { User, Messages, ChatMessages, ExternalUser, MessageStatus, DmInfo } from '@repo/db';
import { fetchGet, fetchPost } from '../fetch_functions';
import { useSearchParams } from 'next/navigation';
import { chatSocket } from '../chat_componens';

const checkPassword: boolean = true;

function Message({ message, messageStatus, intra_id }: { message: ChatMessages, messageStatus: MessageStatus, intra_id: number }) {
    const isMyMessage = message.sender_id === intra_id;
    const bubbleClass = isMyMessage ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black';

    const renderMessageWithLineBreaks = (text: string) => {
        return text.split('\n').map((str, index) => (
            <div key={index}>{str}</div>
        ));
    };

    function renderMessageStatus(messageStatus: MessageStatus) {
        if (!messageStatus)
            return '';
        if (messageStatus.read_at)
            return 'read';
        if (messageStatus.receivet_at)
            return 'received';
        return 'sent';
    }

    function renderDate(date: Date) {
        if (!date)
            return 'no date';
        if (!(date instanceof Date))
            return 'not a date';
        return date ? date.toString().slice(16, 21) : '';
    }

    return (
        <div className={`mb-2 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-2 rounded-lg ${isMyMessage ? 'rounded-br-none' : 'rounded-bl-none'} ${bubbleClass} max-w-xs`}>
                {!isMyMessage && <div className="text-xs text-gray-600">{message.sender_name}</div>}
                <div>{renderMessageWithLineBreaks(message.message)}</div>
                <div className="text-xs text-right text-gray-600">{renderDate(message.sent_at)}</div>
                <div className="text-xs text-right text-gray-600">{renderMessageStatus(messageStatus)}</div>
            </div>
        </div>
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

function SearchBar({ searchTerm, setSearchTerm }: { searchTerm: string, setSearchTerm: React.Dispatch<React.SetStateAction<string>> }) {
    return (
        <div className="relative text-gray-600 focus-within:text-gray-400 w-96 px-3">
            <input
                type="search"
                name="q"
                className="py-2 text-sm w-full text-white bg-gray-900 rounded-md pl-3 pr-3 focus:outline-none focus:bg-white focus:text-gray-900"
                placeholder="Search..."
                autoComplete="off"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
    );
}

function InviteForGame({ intra_user_id, nick_name } : { intra_user_id: number, nick_name:string }) {
    return (
        <div className="flex flex-col items-center justify-center flex-grow space-y-4">
            <Link className="flex-grow" href={{ pathname: '/multiplayer_pong', query: { player_id: intra_user_id, nick_name: nick_name } }}>
                <button className="py-2 px-4 text-blue-500 font-bold">
                    Invite for a game
                </button>
            </Link>
        </div>
    );
}

export default function DC() {
    const searchParams = useSearchParams();
    const [user, setUser] = useState<User>();
    const [searchTerm, setSearchTerm] = useState('');
    const [messages, setMessages] = useState<ChatMessages[]>([]);
    const [messageStatus, setMessageStatus] = useState<MessageStatus[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [hasPassword, setHasPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [chatInfo, setDmInfo] = useState<DmInfo>({ isDm: false, intraId: null, nickName: null, chatId: null, title: null });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chat_id: number = Number(searchParams?.get('chat_id')) ?? -1;

    useEffect(() => {
        /* Load user info form database and store in const user */
        fetchGet<User>('api/profile')
            .then((user) => {
                setUser(user);
            })
            .catch((error) => {
                console.log('Error: ', error);
            });
    }, []);

    useEffect(() => {
        if (!user || !user.intra_user_id) return;

        fetchGet<boolean>(`api/chatHasPassword?chat_id=${chat_id}`)
            .then((res) => {
                setHasPassword(res);
            })
            .catch((error) => {
                console.log('Error: ', error);
        });

        fetchGet<ChatMessages[]>(`api/messages?chat_id=${chat_id}`)
        .then((res) => {
                /* Set date type because the JSON parser does not automatically convert date strings to Date objects */
                const transformedMessages = res.map(message => ({
                    ...message,
                    sent_at: new Date(message.sent_at)
                }));
                console.log('Retrieved Messages form db: ', transformedMessages);
                setMessages(transformedMessages);
            })
            .catch((error) => {
                console.log('Error: ', error);
            });
        updateUnreadMessages();

        fetchGet<DmInfo>(`api/getDmInfo?chat_id=${chat_id}`)
            .then((res) => {
                setDmInfo(res);
            })
            .catch((error) => {
                console.log('Error: ', error);
            });

        chatSocket.emit('joinChat', { chat_id: chat_id.toString(), intra_user_id: user.intra_user_id.toString() });

        chatSocket.on('messageFromServer', (message: ChatMessages) => {
            /* Set date type because the JSON parser does not automatically convert date strings to Date objects */
            message.sent_at = new Date(message.sent_at);
            console.log('Received message: ' + message.message);
            setMessages((prevMessages) => [...prevMessages, message]);
            updateUnreadMessages();
        });

        return () => {
            chatSocket.emit('leaveChat', chat_id.toString());
            chatSocket.off('messageFromServer');
        };
    }, [user, chat_id]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const updateUnreadMessages = () => {
        fetchPost('api/updateUnreadMessages', { chat_id: chat_id, intra_user_id: user?.intra_user_id ?? 0 })
            .then(() => {
                console.log('Updated unread messages');
            })
            .catch((error) => {
                console.log('Error updating unread messages: ', error);
            });
    }

    const sendMessage = (message: ChatMessages) => {
        console.log('Sending message: ' + message.message);
        chatSocket.emit('messageToServer', message);
        setNewMessage('');
    };

    const handleSendMessage = (intra_id: number) => {
        if (newMessage.trim() === '') return;

        const message: ChatMessages = {
            message_id: 0,          // auto generate in database
            chat_id: chat_id,
            sender_id: intra_id,
            sender_name: '',        // get from user database
            sender_image_url: '',   // get from user database
            message: newMessage,
            sent_at: new Date()     // generate in the backend with instert returnig
        };

        sendMessage(message);
    };

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

    return (
        <div className="flex flex-col items-center justify-center flex-grow space-y-4">
            {chatInfo.isDm && chatInfo.intraId && chatInfo.nickName && <Link href={{ pathname: '/profile_view', query: { id: chatInfo.intraId } }}>
                <button className="py-2 px-4 text-blue-500 font-bold">
                    {chatInfo.nickName}
                </button>
            </Link>}
            {!chatInfo.isDm && chatInfo.chatId && chatInfo.title && <Link href={{ pathname: '/group_view', query: { id: chatInfo.chatId } }}>
                <button className="py-2 px-4 text-blue-500 font-bold">
                    {chatInfo.title}
                </button>
            </Link>}
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <div className="relative w-96 px-4 h-80">
                {customTransparantToBlack()}
                <div className="overflow-auto h-full">
                    <div className="h-10"></div> {/* making sure you can see the first message */}
                    {user && messages.map((message, index) => (
                        console.log('Message: ', message),
                        console.log('MessageStatus: ', messageStatus[index]),
                        <Message key={index} message={message} messageStatus={messageStatus[index]} intra_id={user.intra_user_id} />
                    ))}
                    <div ref={messagesEndRef} /> {/* Used for auto scroll to last message */}
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
                {chatInfo.isDm && chatInfo.intraId  && chatInfo.nickName && <InviteForGame intra_user_id={chatInfo.intraId} nick_name={chatInfo.nickName} />}
            </div>
        </div>
    );
}
