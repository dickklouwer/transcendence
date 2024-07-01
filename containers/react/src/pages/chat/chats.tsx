// Desc: Chat page with a list of chats

var chatFields = [
    {
        username: "Username 1",
        lastMessage: "Last message",
        time: "14:29",
        unreadMessages: "1"
    },
    {
        username: "Groupname 1",
        lastMessage: "This is a very long message that does not fit on a small screen therefor is not readeble!",
        time: "11:42",
        unreadMessages: "3"
    },
    {
        username: "Username 2",
        lastMessage: "Last message",
        time: "19-07-2024",
        unreadMessages: ""
    },
    {
        username: "Username 3",
        lastMessage: "Last message",
        time: "19-07-2024",
        unreadMessages: ""
    }
];

function ChatField({ chatField }) {
    var defaultUserIcon = "https://static.vecteezy.com/system/resources/thumbnails/008/442/086/small_2x/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg";

    return (
        <div className="border border-gray-300 w-256 rounded-lg overflow-hidden">
            <div className="flex items-center space-x-4 p-4 justify-between">
                <button onClick={() => alert('Showing picture of ' + chatField.username)}>
                    <img src={defaultUserIcon} alt="User or Group" className="w-12 h-12 rounded-full" />
                </button>
                <button onClick={() => alert('Showing chat of ' + chatField.username)} className="flex-grow">
                    <div className="flex justify-between w-full ">
                        <div>
                            <h3 className="font-bold text-left">{chatField.username}</h3>
                            <p className="max-w-xs overflow-ellipsis overflow-hidden whitespace-nowrap text-gray-500">{chatField.lastMessage}</p>
                        </div>
                        <div className="text-right">
                            <p>{chatField.time}</p>
                            {chatField.unreadMessages ? <p className="text-blue-500">{chatField.unreadMessages}</p> : <br />}
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}

function SeacrhBar() {
    return (
        <div className="relative text-gray-600 focus-within:text-gray-400">
            <input
                type="search"
                name="q"
                className="py-2 text-sm text-white bg-gray-900 rounded-md pl-3 pr-10 focus:outline-none focus:bg-white focus:text-gray-900"
                placeholder="Search..."
                autoComplete="off"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button type="submit" className="p-1 focus:outline-none focus:shadow-outline">
                    <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        className="w-6 h-6"
                    >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </button>
            </span>
        </div>
    );
}

export default function Chats({navigateToMenu}) {
  
    return (
        <div className="flex flex-col items-center justify-center flex-grow space-y-4">
        <h2 className="text-2xl font-bold text-center">Chats</h2>
        <SeacrhBar />
        <div className="h-64 overflow-auto">
            {chatFields.map((chatField) => (
                <ChatField chatField={chatField} />
            ))}
        </div>
        <button className="text-blue-500 mt-4" onClick={navigateToMenu}>
            Back to Menu
        </button>
        </div>
    );
}
