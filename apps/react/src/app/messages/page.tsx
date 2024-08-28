"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import io from 'socket.io-client';
import {Messages} from '@repo/db';

const myId = 77718; // Temporaty: Assuming the current user's ID
const socket = io(`http://localhost:4433/messages`, { path: "/ws/socket.io" });

const databaseMessages: Messages[] = [
    {
        message_id: 1,
        sender_id: 278,
        chat_id: 1,
        message: 'Hello there!',
        sent_at: new Date('2024-08-28 13:43:17.825774')
    },
    {
        message_id: 2,
        sender_id: myId,
        chat_id: 1,
        message: 'Hi',
        sent_at: new Date('2024-08-28 13:44:17.825774')
    },
    {
        message_id: 3,
        sender_id: 278,
        chat_id: 1,
        message: 'How are you?',
        sent_at: new Date('2024-08-28 13:45:17.825774')
    },
];

function Message({ message }: { message:Messages }) {
    const isMyMessage = message.sender_id === myId;
    const bubbleClass = isMyMessage ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black';

    const renderMessageWithLineBreaks = (text:string) => {
        return (<div>{text}</div>);
        // return text.split('\n').map((line, index) => (
        //     <div key={index}>{line}</div>
        // ));
    };

    // function that convert the sent_at to a more readable format with 24 hour time, yesterday and older dates
    function renderDate(date: Date | undefined) {
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
    const [searchTerm, setSearchTerm] = useState('');
    const [messages, setMessages] = useState(databaseMessages);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
        socket.on('serverToClient', (message) => {
        alert('Received message: ' + message);
        setMessages([...messages, message]);
        });

        /* Auto scroll to last message */
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

        return () => {
            socket.off('serverToClient');
        };
    }, [messages]);
  
    const sendMessage = () => {
        console.log('Sending message: ' + newMessage);
        socket.emit('clientToServer', newMessage);
        setNewMessage('');
    };

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return;

        const message = {
            message_id: databaseMessages[databaseMessages.length - 1].message_id + 1,
            sender_id: myId,
            chat_id: 1,
            message: newMessage,
            sent_at: new Date().toLocaleTimeString()
        };

        setMessages([...messages, message]);
        sendMessage();
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center flex-grow space-y-4">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <div className="relative w-96 px-4 h-80">
                {customTransparantToBlack()}
                <div className="overflow-auto h-full">
                    <div className="h-10"></div> {/* making sure you can see the first message */}
                    {messages.map((message, index) => (
                        <Message key={index} message={message} />
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
                    onKeyPress={handleKeyPress}
                ></textarea>
                <div className='flow-root'>
                    <Link className="float-left py-2 px-4" href={'/chats'}>
                        Back
                    </Link>
                    <button
                        className="float-right py-2 px-4 rounded bg-blue-500 text-black font-bold "
                        onClick={handleSendMessage}
                        >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
