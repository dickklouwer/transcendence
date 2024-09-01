'use client';

import { useEffect, useState } from "react";
import { fetchGet } from "../fetch_functions";
import { ExternalUser, User } from "@repo/db";
import classNames from "classnames";
import Image from "next/image";

export default function MatchHistoryPage() {
    return (
    <div className="flex space-x-4">
        <LadderList />
        <MatchList />
    </div>
    );
}

function LadderList(){

    type ExtendedUser = ExternalUser | User;

    const [ladder, setLadder] = useState<ExtendedUser[]>([]);

    useEffect(() => {

        fetchGet<ExternalUser[]>('api/getExternalUsers')
        .then((res) => {
            setLadder(res);
        })
    }, []);

    useEffect(() => {
        fetchGet<User>('api/profile')
        .then((res) => {
            setLadder((prev) => prev.concat(res));
        })
    }, []);
    
    const sortedLadder = ladder?.sort((a, b) => b.wins - a.wins);


    return (
        <div className="bg-slate-800 p-2 flex-col items-center justify-center rounded-lg shadow-lg shadow-red-500">
            <div className="px-2 pt-3">
                <h1 className="flex items-center justify-center"> Leaderboard </h1>
                <p className="flex items-center justify-center pb-[0.6rem]"> &#60;-------------------&#62;</p>
            </div>
            <div className="h-[31rem] overflow-scroll">
                {sortedLadder?.map((user, idx) => {
                    let bgColor;
                    let shadowColor;
                    let borderColor;

                    switch (idx) {
                        case 0:
                            bgColor = 'bg-yellow-500';
                            shadowColor = 'shadow-yellow-500';
                            borderColor = 'border-yellow-600';
                            break;
                        case 1:
                            bgColor = 'bg-gray-500';
                            shadowColor = 'shadow-gray-500';
                            borderColor = 'border-gray-600';
                            break;
                        case 2:
                            bgColor = 'bg-yellow-800';
                            shadowColor = 'shadow-yellow-800';
                            borderColor = 'border-yellow-900';
                            break;
                        default:
                            bgColor = 'bg-black';
                            shadowColor = 'shadow-blue-500';
                            borderColor = 'border-black';
                            break;
                    }

                    const divClass = classNames(
                        'p-2 m-3 rounded-lg shadow-lg border-4',
                        bgColor,
                        shadowColor,
                        borderColor
                    )
                    return (
                    <div key={idx} className={divClass}>
                        <div className="flex items-center">
                            <p className=" text-white items-center">{idx + 1}.</p>
                            <div className="flex items-center justify-center w-full">
                                <div className="flex-col justify-center items-center">
                                    <div className="flex justify-center items-center space-x-2 p-1">
                                        <Image className='rounded-full w-10 h-10' src={user.image} alt="Profile Picture" width={100} height={100} />
                                        {user.nick_name === null ? 
                                        <p className="text-white whitespace-nowrap"> {user.user_name}</p>:
                                        <p className="text-white"> {user.nick_name}</p>}
                                    </div>
                                    <div className="flex items-center justify-center space-x-4">
                                        <p className="text-white">Wins: {user.wins}</p>
                                        <p className="text-white">Losses: {user.losses}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    );
                    
                })}
            </div>
        </div>
    );
}

function MatchList(){
    const [user, setUser] = useState<User>();
    const [matchHistory, setMatchHistory] = useState<any[]>();

    useEffect(() => {
        try {
            fetchGet<User>('api/profile')
            .then((res) => {
                setUser(res);
            })

            fetchGet<any[]>('api/getYourGames')
            .then((res) => {
                setMatchHistory(res);
            })
        } catch (error) {
            console.log('Error fetch data: ', error);
        }
        
    }, []);

    if (!user)
        return <div>Loading</div>;

    if (matchHistory)
        console.log(matchHistory);


    return (
        <div className="bg-slate-800 p-2 rounded-b-md rounded-lg shadow-lg shadow-blue-500">
            <div className='px-2 pt-3'>
                <h1 className="flex justify-center items-center ">Match History</h1>
                <p className="w-auto flex justify-center items-center whitespace-nowrap pb-4 ">&#60;-----------------------------&#62;</p>
            </div>
            <div className="h-[31rem] overflow-scroll">
                {matchHistory?.length === 0 && <p className="text-white text-center">No Matches Played</p>}
                {matchHistory?.map((opponent, idx) => (
                    <div className="bg-black p-2 m-1 rounded-lg " key={idx}>
                        <div className="flex items-center space-x-2">
                            <Image className='rounded-full w-14 h-14' src={user.image} alt="Profile Picture" width={100} height={100} />
                            {user.nick_name === null ? 
                            <p className="text-white"> {user.user_name}</p>:
                            <p className="text-white"> {user.nick_name}</p>}
                        </div>
                        {opponent.player1_id === user.intra_user_id && opponent.player1_score > opponent.player2_score || opponent.player2_id === user.intra_user_id && opponent.player2_score > opponent.player1_score ?
                        <div className="flex text-red-500 justify-center items-center">
                            <p>~~~~~~~~~~</p>
                            <p className=" text-2xl ">~ {opponent.player1_score} - {opponent.player2_score} ~</p>
                            <p>~~~~~~~~~~</p>
                        </div> :
                        <div className="flex text-green-500 justify-center items-center">
                            <p>~~~~~~~~~~</p>
                            <p className=" text-2xl ">~ {opponent.player1_score} - {opponent.player2_score} ~</p>
                            <p>~~~~~~~~~~</p>
                        </div>
                        }
                        <div className="flex items-center justify-end space-x-2">
                            {opponent.nick_name === null ? 
                            <p className="text-white"> {opponent.user_name}</p>:
                            <p className="text-white"> {opponent.nick_name}</p>}
                            <Image className='rounded-full w-14 h-14' src={opponent.image} alt="Profile Picture" width={100} height={100} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

