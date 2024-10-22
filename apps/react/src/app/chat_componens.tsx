"use client";

import { useState, useEffect, use } from 'react';
import io from 'socket.io-client';
import Link from 'next/link';
import { fetchGet, fetchPost } from './fetch_functions';

export const chatSocket = io(`http://${process.env.NEXT_PUBLIC_HOST_NAME}:4433/messages`,
    {
        path: "/ws/socket.io/messages",
        autoConnect: false,
    });

interface MessageInboxProps {
    user_intra_id: number;
}

const MessageInbox: React.FC<MessageInboxProps> = ({ user_intra_id }) => {
    const [numberOfUnreadChats, setNumberOfUnreadChats] = useState<number>(0);
    const [reload, setReload] = useState<boolean>(false);

    const getNumberOfUnreadChats = async () => {
        fetchGet<number>('api/getNumberOfUnreadChats')
            .then((res) => {
                setNumberOfUnreadChats(res);
            });
    }

    useEffect(() => {
        getNumberOfUnreadChats();

        chatSocket.on('chatUpdate', () => {
            setReload(prev => !prev);
        });

        return () => {
            chatSocket.off('chatUpdate');
        }
    }, [reload]);

    return (
        <div className='relative inline-block'>
        <Link href={'/chats'} className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-blue-700 transition-all duration-150">
            <svg className="w-8 h-8 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M4 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1v2a1 1 0 0 0 1.707.707L9.414 13H15a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4Z" clipRule="evenodd"/>
            <path fillRule="evenodd" d="M8.023 17.215c.033-.03.066-.062.098-.094L10.243 15H15a3 3 0 0 0 3-3V8h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1v2a1 1 0 0 1-1.707.707L14.586 18H9a1 1 0 0 1-.977-.785Z" clipRule="evenodd"/>
            </svg>
            {numberOfUnreadChats > 0 && <span className="absolute right-5 bottom-[-5px] inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{numberOfUnreadChats}</span>}
        </Link>
        </div>
    );
}

export default MessageInbox;
