"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import io from 'socket.io-client';

interface TMessage {
    message_id: number;
    sender_id: number;
    receiver_id: number | null;
    group_chat_id: number | null;
    message: string;
    sent_at: string;
}


const myId = 42; // Temporaty: Assuming the current user's ID
const socket = io(`http://localhost:4433/messages`, { path: "/ws/socket.io" });

socket.on('connect_error', (err) => {
    console.error('Connection error:', err);
});

const databaseMessages = [
    {
        message_id: 1,
        sender_id: 43,
        receiver_id: 42,
        group_chat_id: null,
        message: 'Hello',
        sent_at: '13:04'
    },
    {
        message_id: 2,
        sender_id: 42,
        receiver_id: 43,
        group_chat_id: null,
        message: 'Hi',
        sent_at: '13:05'
    },
    {
        message_id: 3,
        sender_id: 43,
        receiver_id: 42,
        group_chat_id: null,
        message: 'How are you?',
        sent_at: '13:06'
    },
    {
        message_id: 4,
        sender_id: 42,
        receiver_id: 43,
        group_chat_id: null,
        message: 'I am fine :)\nThanks for asking!',
        sent_at: '13:07'
    },
    {
        message_id: 5,
        sender_id: 42,
        receiver_id: 43,
        group_chat_id: null,
        message: 'How are you?',
        sent_at: '13:08'
    },
    {
        message_id: 6,
        sender_id: 43,
        receiver_id: 42,
        group_chat_id: null,
        message: 'Good',
        sent_at: '13:09'
    },
];

function Message({ message }: { message:TMessage }) {
    const isMyMessage = message.sender_id === myId;
    const bubbleClass = isMyMessage ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black';

    const renderMessageWithLineBreaks = (text:string) => {
        return text.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
        ));
    };

    return (
        <div className={`mb-2 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-2 rounded-lg ${isMyMessage ? 'rounded-br-none' : 'rounded-bl-none'} ${bubbleClass} max-w-xs`}>
                <div>{renderMessageWithLineBreaks(message.message)}</div>
                <div className="text-xs text-gray-600">{message.sent_at}</div>
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
    }, [messages]);
  
    const sendMessage = () => {
        console.log('Sending message: ' + newMessage);
        socket.emit('clientToServer', newMessage);
        // alert('Sending message: ' + newMessage);.
        setNewMessage('');
    };

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return;

        const message = {
            message_id: databaseMessages[databaseMessages.length - 1].message_id + 1,
            sender_id: myId,
            receiver_id: 43,
            group_chat_id: null,
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
