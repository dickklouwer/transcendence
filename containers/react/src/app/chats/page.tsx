'use client';
import Link from 'next/link';
// Desc: Chat page with a list of chats

function ChatField({ username, lastMessage, time, unreadMessages }) {
    var defaultUserIcon = "https://static.vecteezy.com/system/resources/thumbnails/008/442/086/small_2x/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg";

    return (
        <div className="border border-gray-300 w-256 rounded-lg overflow-hidden">
        <div className="flex items-center space-x-4 p-4 justify-between">
            <button onClick={() => alert('Showing picture of ' + username)}>
            <img src={defaultUserIcon} alt="User or Group" className="w-12 h-12 rounded-full" />
            </button>
            <button onClick={() => alert('Showing chat of ' + username)} className="flex-grow">
            <div className="flex justify-between w-full ">
                <div>
                <h3 className="font-bold text-left">{username}</h3>
                <p className="max-w-xs overflow-ellipsis overflow-hidden whitespace-nowrap text-gray-500">{lastMessage}</p>
                </div>
                <div className="text-right">
                <p>{time}</p> 
                {unreadMessages ? <p className="text-blue-500">{unreadMessages}</p> : <br />}
                </div>
            </div>
            </button>
        </div>
        </div>
    );
}

export default function Chats() {
  
    return (
        <div className="flex flex-col items-center justify-center flex-grow space-y-4">
        <h2 className="text-2xl font-bold text-center">Chats</h2>
        <div>
            <ChatField username="Username 1" lastMessage="Last message" time="14:29" unreadMessages="1" />
            <ChatField username="Groupname 1" lastMessage="This is a very long message that does not fit on a small screen therefor is not readeble!" time="11:42" unreadMessages="3" />
            <ChatField username="Username 2" lastMessage="Last message" time="19-07-2024" unreadMessages="" />
        </div>
        <Link className="text-blue-500 mt-4" href={'/menu'}>
            Back to Menu
        </Link>
        </div>
    );
}
