import React, { useEffect, useRef } from 'react';


// Assuming the current user's ID
const currentUser = 'current_user_id';

// Sample messages
const messages = [
    {
        sender: 'sender_id_1',
        message: 'Hello',
        sentAt: '13:02'
    },
    {
        sender: 'current_user_id',
        message: 'Hi',
        sentAt: '13:03'
    },
    {
        sender: 'sender_id_1',
        message: 'How are you?',
        sentAt: '13:04'
    },
    {
        sender: 'current_user_id',
        message: 'I am fine',
        sentAt: '13:05'
    },
    {
        sender: 'sender_id_1',
        message: 'Good to hear that you are fine',
        sentAt: '13:06'
    },
    {
        sender: 'current_user_id',
        message: 'I have to go now',
        sentAt: '13:09'
    },
    {
        sender: 'sender_id_1',
        message: 'Bye',
        sentAt: '13:10'
    }
];

function Message({ message }) {
    const isCurrentUser = message.sender === currentUser;
    const alignClass = isCurrentUser ? 'text-right' : 'text-left';
    const bubbleClass = isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black';

    return (
        <div className={`mb-2 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-2 rounded-lg ${isCurrentUser ? 'rounded-br-none' : 'rounded-bl-none'} ${bubbleClass} max-w-xs`}>
                <div>{message.message}</div>
                <div className="text-xs text-gray-600">{message.sentAt}</div>
            </div>
        </div>
    );
}

export default function DM() {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex flex-col items-center justify-center flex-grow space-y-4">
            <div className="relative w-96 px-4 h-80">
                <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black via-black to-transparent opacity-100"></div>
                <div className="overflow-auto h-full">
                    <div className="h-10"></div>
                    {messages.map((message, index) => (
                        <Message key={index} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="flex flex-col space-y-4">
                <textarea className="border border-gray-300 rounded-lg p-2 w-full text-black" placeholder="Type a message..." rows="2"></textarea>
                <button className="bg-blue-500 text-black font-bold py-2 px-4 rounded self-end">Send</button>
            </div>
        </div>
    );
}
