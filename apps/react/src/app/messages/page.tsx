"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import io from 'socket.io-client';
import {User, Messages} from '@repo/db';
import { fetchGet } from '../fetch_functions';

function Message({ message, intra_id }: { message: Messages, intra_id: number }) {
    const isMyMessage = message.sender_id === intra_id;
    const bubbleClass = isMyMessage ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black';

    const renderMessageWithLineBreaks = (text:string) => {
        return (<div>{text}</div>);
        // return text.split('\n').map((line, index) => (
        //     <div key={index}>{line}</div>
        // ));

    };
    function renderDate(date: Date) {
        if (!date) 
            return 'no date';
        if (!(date instanceof Date))
            return 'not a date';
        return date ? date.toLocaleTimeString().slice(0,4) : '';
    }

    return (
        <div className={`mb-2 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-2 rounded-lg ${isMyMessage ? 'rounded-br-none' : 'rounded-bl-none'} ${bubbleClass} max-w-xs`}>
                <div>{renderMessageWithLineBreaks(message.message)}</div>
                <div className="text-xs text-gray-600">{renderDate(message.sent_at)}</div>
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

function SearchBar({ searchTerm, setSearchTerm }: {searchTerm: string, setSearchTerm: React.Dispatch<React.SetStateAction<string>>}) {
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

export default function DC() {
    const [user, setUser] = useState<User>();
    const [searchTerm, setSearchTerm] = useState('');
    const [messages, setMessages] = useState<Messages[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socket = io(`http://localhost:4433/messages`, { 
        path: "/ws/socket.io", 
        query: {
            intra_user_id: user?.intra_user_id
        }}
    );
    
    useEffect(() => {
        // TODO: check if chat has a password, that is stored in the database chats.password
        // if (chat.password) {
        //     // prompt for password
        //     // if (password is correct) {
        //     //     // connect to chat
        //     // } else {
        //     //     // show error message
        //     // }
        // }

        /* Load user info form database and store in const user */
        fetchGet<User>('api/profile')
        .then((user) => {
            setUser(user);
            console.log('intra_id', user.intra_user_id);
        })
        .catch((error) => {
            console.log('Error: ', error);
        });
        
        const chat_id = 1; // TODO: get chat_id from the URL
        /* Load messages form database form right chat, using query chat_id: number */
        fetchGet<Messages[]>(`api/messages?chat_id=${chat_id}`)
        .then((res) => {
            /* Set date type because the JSON parser does not automatically convert date strings to Date objects */
            const transformedMessages = res.map(message => ({
                ...message,
                sent_at: new Date(message.sent_at)
            }));
            console.log('Retrieved Messages: ', transformedMessages);
            setMessages(transformedMessages);
        })
        .catch((error) => {
            console.log('Error: ', error);
        });

        /* Get messages while online */
        socket.on('serverToClient', (message: Messages) => {
            /* Set date type because the JSON parser does not automatically convert date strings to Date objects */
            message.sent_at = new Date(message.sent_at);
            console.log('Received message: ' + message.message);
            setMessages((prevMessages) => [...prevMessages, message]);
            /* Auto scroll to last message */
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        });
    
        /* Auto scroll to last message */
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); // or instant
    
        return () => {
            socket.off('serverToClient');
        };
    }, []);

    const sendMessage = (message: Messages) => {
        console.log('Sending message: ' + message.message);
        socket.emit('clientToServer', message);
        setNewMessage('');
    };

    const handleSendMessage = (intra_id: number) => {
        if (newMessage.trim() === '') return;
        
        const message = {
            message_id: (messages[messages.length - 1]?.message_id ?? 0) + 1,
            sender_id: intra_id,
            chat_id: 1,
            message: newMessage,
            sent_at: new Date()
        };
        
        // setMessages([...messages, message]);
        sendMessage(message);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>, intra_id: number) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(intra_id);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center flex-grow space-y-4">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <div className="relative w-96 px-4 h-80">
                {customTransparantToBlack()}
                <div className="overflow-auto h-full">
                    <div className="h-10"></div> {/* making sure you can see the first message */}
                    {user && messages.map((message, index) => (
                        <Message key={index} message={message} intra_id={user.intra_user_id} />
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
                    onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleKeyPress(e, user?.intra_user_id ?? 0)}
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
            </div>
        </div>
    );
}