import React, { useState, useEffect, useRef } from 'react';

// Assuming the current user's ID
const currentUser = 'current_user_id';

// Sample messages
const initialMessages = [
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
        sender: 'current_user_id',
        message: 'How are you?',
        sentAt: '13:05'
    },
    {
        sender: 'sender_id_1',
        message: 'Good',
        sentAt: '13:06'
    }
];

function Message({ message }) {
    const isCurrentUser = message.sender === currentUser;
    const bubbleClass = isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black';

    const renderMessageWithLineBreaks = (text) => {
        return text.split('\n').map((line, index) => (
            <div key={index}>
                {line}
                <br />
            </div>
        ));
    };

    return (
        <div className={`mb-2 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-2 rounded-lg ${isCurrentUser ? 'rounded-br-none' : 'rounded-bl-none'} ${bubbleClass} max-w-xs`}>
                <div>{renderMessageWithLineBreaks(message.message)}</div>
                <div className="text-xs text-gray-600">{message.sentAt}</div>
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

export default function DM() {
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); /* Auto scroll to last message */
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return;

        const message = {
            sender: currentUser,
            message: newMessage,
            sentAt: new Date().toLocaleTimeString()
        };

        setMessages([...messages, message]);
        setNewMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center flex-grow space-y-4">
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
                    className="border border-gray-300 rounded-lg p-2 w-full text-black"
                    placeholder="Type a message..."
                    rows="2"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                ></textarea>
                <button
                    className="bg-blue-500 text-black font-bold py-2 px-4 rounded self-end"
                    onClick={handleSendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
