"use client";

import { fetchGet, fetchPost } from '@/app/fetch_functions';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from "next/image";
import defaultUserImage from '@/app/images/defaltUserImage.jpg';
import { DmInfo, InvitedChats, UserChats } from '@repo/db';
import { chatSocket } from '@/app/chat_componens';
import { renderDate } from '@/app/chat_componens';

function SearchBar({ searchTerm, setSearchTerm }: { searchTerm: string, setSearchTerm: React.Dispatch<React.SetStateAction<string>> }) {
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

function ChatField({ chatField }: { chatField: UserChats }) {
  const userImage = chatField.image ? chatField.image : defaultUserImage;
  const commonWidth = "500px";
  const [chatInfo, setDmInfo] = useState<DmInfo>({ isDm: false, intraId: null, nickName: null, chatId: null, title: null, image: null });
  const [gameInvite, setGameInvite] = useState<boolean>(false);

  useEffect(() => {
    fetchGet<DmInfo>(`api/getChatInfo?chat_id=${chatField.chatid}`)
      .then((res) => {
        setDmInfo(res);
      })
      .catch((error) => {
        console.log('Error: ', error);
      });

    if (chatInfo.isDm) {
      fetchGet<boolean>(`api/checkIfInvidedForGame?other_intra_id=${chatInfo.intraId}`)
        .then((res) => {
          setGameInvite(res);
        })
        .catch((error) => {
          console.log('Error: ', error);
        });
    }

  }, [chatField, chatInfo.intraId, chatInfo.isDm]);

  return (
    <div style={{ width: commonWidth }} className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex items-center space-x-4 p-4 justify-between">
        {chatInfo.isDm ? (
          <Link href={{ pathname: '/profile_external', query: { id: chatInfo.intraId } }}>
            <Image
              src={userImage}
              alt="Profile Image"
              className="w-11 h-11 rounded-full"
              width={100}
              height={100}
            />
          </Link>
        ) : (
          <Link href={{ pathname: '/group_view', query: { id: chatField.chatid } }}>
            <Image
              src={userImage}
              alt="Profile Image"
              className="w-11 h-11 rounded-full"
              width={100}
              height={100}
            />
          </Link>
        )}
        <Link className="flex-grow" href={{ pathname: '/messages', query: { chat_id: chatField.chatid } }}>
          <div className="flex justify-between w-full">
            <div>
              <h3 className="font-bold text-left">{chatField.title}</h3>
              <p className="max-w-xs overflow-ellipsis overflow-hidden text-gray-500 whitespace-nowrap text-sm">
                {chatField.lastMessage && !chatField.hasPassword ? (
                  <>
                    {gameInvite ? (
                      <span className="text-blue-500">{chatField.nickName} </span>
                    ) : (
                      <span className="text-white">{chatField.nickName} </span>
                    )}
                    {chatField.lastMessage.startsWith('#') ? (
                      <i className="text-blue-500">Game invite</i>
                    ) : (
                      <span className="text-gray-500">{chatField.lastMessage}</span>
                    )}
                  </>
                ) : chatField.hasPassword ? (
                  <i className="text-gray-500">Password</i>
                ) : (
                  <i className="text-gray-500">No messages yet...</i>
                )}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p>{renderDate(chatField.time)}</p>
              {chatField.unreadMessages ? <p className="text-blue-500">{chatField.unreadMessages}</p> : <br />}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

function InvitedChatField({ chatField: invitedChatField, setInvitedChats, setUserChats }: {
  chatField: InvitedChats,
  setUserChats: React.Dispatch<React.SetStateAction<UserChats[] | undefined>>
  setInvitedChats: React.Dispatch<React.SetStateAction<InvitedChats[] | undefined>>

}) {
  const userImage = invitedChatField.image ? invitedChatField.image : defaultUserImage;
  const commonWidth = "500px";

  const joinChat = (chat_id: number) => {
    fetchGet<boolean>(`api/checkIfBanned?chat_id=${chat_id}`)
      .then((isBanned) => {
        if (isBanned) {
          alert('You are banned from this chat');
        }
      })
      .catch((error) => {
        console.log('Error joining chat: ', error);
      });
    fetchPost('api/joinChat', { chat_id: chat_id })
      .then(() => {
        setInvitedChats((prevChats) => (prevChats as InvitedChats[]).filter(chat => chat.chatid !== chat_id));
        fetchGet<UserChats[]>('api/chats')
          .then((data) => {
            const transformedMessages = data.map((chat) => {
              return {
                ...chat,
                time: new Date(chat.time),
              }
            });
            setUserChats(transformedMessages);
          })
          .catch((error) => {
            console.log('Error fetching Chats: ', error);
          });
      })
      .catch((error) => {
        console.log('Error checking if banned: ', error);
        return;
      });
  }

  return (
    <div style={{ width: commonWidth }} className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex items-center space-x-4 p-4 justify-between">
        <button onClick={() => alert('Showing image of ' + invitedChatField.title + ' groep')}>
          <Image src={userImage} alt="User or Group" width={48} height={48} className="w-12 h-12 rounded-full" />
        </button>
        <div className="flex-grow">
          <div className="flex justify-between w-full">
            <div>
              <h3 className="font-bold text-left">{invitedChatField.title}</h3>
            </div>
            <div className="text-right px-4">
              <button className="text-blue-500" onClick={() => joinChat(invitedChatField.chatid)}>
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Chats() {
  const [userChats, setUserChats] = useState<UserChats[]>();
  const [invitedChats, setInvitedChats] = useState<InvitedChats[]>();
  const [searchTerm, setSearchTerm] = useState('');
  const [reload, setReload] = useState<boolean>(false);

  function loadChats() {
    fetchGet<UserChats[]>('api/chats')
      .then((data) => {
        const transformedMessages = data.map((chat) => {
          return {
            ...chat,
            time: new Date(chat.time),
          }
        });
        setUserChats(transformedMessages);
      })
      .catch((error) => {
        console.log('Error fetching Chats: ', error);
      });

    fetchGet<UserChats[]>('api/invitedChats')
      .then((data) => {
        setInvitedChats(data);
      })
      .catch((error) => {
        console.log('Error fetching Invited Chats: ', error);
      });
  }

  useEffect(() => {
    loadChats();

    chatSocket.on('messageUpdate', () => {
      setReload(prev => !prev);
    });

    return () => {
      chatSocket.off('messageUpdate');
    }
  }, [reload]);

  const validUserChats = Array.isArray(userChats) ? userChats : [];
  const filteredChatFields = validUserChats
    .filter((chatField) => chatField.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    }
    );

  const validInvitedChats = Array.isArray(invitedChats) ? invitedChats : [];
  const filteredInvitedChatFields = validInvitedChats
    .filter((chatField) => chatField.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col items-center justify-center flex-grow space-y-4">

      {/* Title Bar with inviteGroupChat Button */}
      <div className="flex items-center space-x-4 bg- p-4 rounded shadow">
        <h2 className="text-2xl font-bold text-center">Chats</h2>

        {/* Button with SVG */}
        <button className="flex items-end space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
          <svg className="w-8 h-8" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 40 40">
            <path d="M2.644,10.29c0-2.144,1.746-3.889,3.891-3.889s3.89,1.745,3.89,3.889c0,2.145-1.745,3.89-3.89,3.89 S2.644,12.435,2.644,10.29z M20.27,21.382c3.505,0,6.361-2.855,6.361-6.363s-2.854-6.361-6.361-6.36 c-3.507,0-6.361,2.853-6.361,6.36S16.764,21.382,20.27,21.382z M34.005,14.181c2.146,0,3.892-1.745,3.892-3.89 c0-2.144-1.746-3.89-3.892-3.89s-3.89,1.746-3.89,3.89C30.117,12.435,31.861,14.181,34.005,14.181z M13.017,18.764l0.052-0.063 l-0.012-0.081c-0.333-2.178-1.471-3.926-3.203-4.926L9.73,13.623l-0.098,0.103c-0.817,0.857-1.918,1.33-3.097,1.33 c-1.179,0-2.279-0.473-3.097-1.33l-0.099-0.104l-0.124,0.071c-1.731,1-2.869,2.748-3.203,4.926L0,18.7l0.052,0.063 c1.729,2.073,4.031,3.214,6.481,3.214C8.983,21.978,11.288,20.836,13.017,18.764z M40.527,18.621 c-0.332-2.178-1.471-3.926-3.202-4.926l-0.124-0.071l-0.098,0.103c-0.818,0.857-1.918,1.33-3.099,1.33 c-1.179,0-2.278-0.472-3.097-1.33l-0.1-0.103l-0.123,0.071c-1.731,1-2.869,2.748-3.203,4.926l-0.012,0.081l0.051,0.063 c1.729,2.073,4.031,3.215,6.481,3.215c2.451,0,4.752-1.144,6.481-3.215l0.052-0.063L40.527,18.621z M25.697,20.584l-0.201-0.116 l-0.161,0.168c-1.336,1.403-3.136,2.175-5.064,2.175c-1.928,0-3.728-0.771-5.064-2.175l-0.161-0.168l-0.202,0.116 c-2.832,1.636-4.692,4.494-5.237,8.056l-0.02,0.133l0.085,0.103c2.827,3.393,6.591,5.26,10.599,5.26 c4.008,0,7.772-1.867,10.599-5.26l0.085-0.103l-0.02-0.133C30.391,25.079,28.529,22.22,25.697,20.584z" />
          </svg>
        </button>
      </div>

      {/* SearchBar */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="h-64 overflow-auto">
        {filteredChatFields.map((chatField, index) => (
          <ChatField key={index} chatField={chatField} />
        ))}
        {filteredChatFields.length == 0 && <p>No chats found...</p>}
      </div>

      {/* Invited Chats */}
      <h2 className="text-2xl font-bold text-center">Invited Chats</h2>
      <div className="h-64 overflow-auto">
        {filteredInvitedChatFields.map((chatField, index) => (
          <InvitedChatField key={index} chatField={chatField} setUserChats={setUserChats} setInvitedChats={setInvitedChats} />
        ))}
        {filteredInvitedChatFields.length == 0 && <p>No invited chats found...</p>}
      </div>

      {/* Back To Manu */}
      <Link className="text-blue-500 mt-4" href={'/menu'}>
        Back to Menu
      </Link>
    </div>
  );
}
