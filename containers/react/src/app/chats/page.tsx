import React, { useState, useEffect } from 'react';

// Initial chat data
const initialChatFields = [
    {
        username: "Username 1",
        lastMessage: "Last message",
        time: new Date(new Date().getTime() - 60000), // 1 minute ago
        unreadMessages: "1",
        type: "dm"
    },
    {
        username: "Groupname 1",
        lastMessage: "This is a very long message that does not fit on a small screen therefore is not readable!",
        time: new Date(new Date().getTime() - 86400000), // 1 day ago
        unreadMessages: "3",
        type: "gm"
    },
    {
        username: "Username 2",
        lastMessage: "Last message",
        time: new Date(new Date().getTime() - 172800000), // 2 days ago
        unreadMessages: "",
        type: "dm"
    },
    {
        username: "Username 3",
        lastMessage: "Last message",
        time: new Date("2024-06-17T18:00:00"),
        unreadMessages: "",
        type: "dm"
    }
];

function SearchBar({ searchTerm, setSearchTerm }) {
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

function ChatField({ chatField }: { chatField: JSON }) {
    const defaultUserIcon = "https://static.vecteezy.com/system/resources/thumbnails/008/442/086/small_2x/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg";

    const formatTime = (time: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (time.toDateString() === today.toDateString()) {
            return time.toTimeString().slice(0, 5); // Only show the time
        } else if (time.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            const day = time.getDate();
            const month = time.toLocaleString('default', { month: 'short' }).toLowerCase();
            const year = time.getFullYear();
            return `${day}-${month}-${year}`;
        }
    };

    return (
        <div className="border border-gray-300 w-256 rounded-lg overflow-hidden">
            <div className="flex items-center space-x-4 p-4 justify-between">
                <button onClick={() => alert('Showing picture of ' + chatField.username)}>
                    <img src={defaultUserIcon} alt="User or Group" className="w-12 h-12 rounded-full" />
                </button>
                <button onClick={() => alert('Showing chat of ' + chatField.username)} className="flex-grow">
                    <div className="flex justify-between w-full">
                        <div>
                            <h3 className="font-bold text-left">{chatField.username}</h3>
                            <p className="max-w-xs overflow-ellipsis overflow-hidden whitespace-nowrap text-gray-500">{chatField.lastMessage}</p>
                        </div>
                        <div className="text-right">
                            <p>{formatTime(chatField.time)}</p>
                            {chatField.unreadMessages ? <p className="text-blue-500">{chatField.unreadMessages}</p> : <br />}
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}

export default function Chats({ navigateToMenu }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [chatFields, setChatFields] = useState(initialChatFields);

    useEffect(() => {
        // Sort the chatFields by time, with the newest messages at the top
        setChatFields(chatFields => {
            return [...chatFields].sort((a, b) => new Date(b.time) - new Date(a.time));
        });
    }, []);

    const filteredChatFields = chatFields.filter(chatField =>
        chatField.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <button className="text-blue-500 mt-4" onClick={navigateToMenu}>
                Back to Menu
            </button>
        </div>
    );
}
