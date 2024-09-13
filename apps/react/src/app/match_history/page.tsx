'use client';

import { useEffect, useState } from "react";
import { fetchGet } from "../fetch_functions";
import { ExternalUser, MultiplayerMatches, User } from "@repo/db";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";

export default function MatchHistoryPage() {
    return (
        <div>
            <div className="flex space-x-4">
                <LadderList />
                <MatchList />
            </div>
            <Link href="/menu" className="bg-blue-500 text-white flex justify-center items-center p-4 rounded-full hover:nm-inset-blue-600 nm-flat-blue-500-sm transition duration-1000 m-6"> Back to Menu </Link>
        </div>
    );
}

function LadderList(){

    const [ladder, setLadder] = useState<ExternalUser[]>([]);
    const [user, setUser] = useState<User>();

    useEffect(() => {

        fetchGet<ExternalUser[]>('api/getLeaderboard')
        .then((res) => {
            setLadder(res); 
        })

        fetchGet<User>('api/profile')
        .then((res) => {
            setUser(res);
        })
        
    }, []);


    if (!ladder || !user)
        return <div>Loading</div>;

    const position = ladder?.findIndex((search) => search.intra_user_id === user.intra_user_id);

    console.log("ultimate Ladder", ladder);

    return (
        <div className="bg-slate-800 p-2 flex-col items-center justify-center rounded-lg nm-inset-slate-800 border-slate-800 border-4">
            <div className="px-2 pt-3">
                <h1 className="flex items-center justify-center"> Leaderboard </h1>
                <p className="flex items-center justify-center pb-[0.6rem]"> &#60;-------------------&#62;</p>
            </div>
            <div className="h-[29rem] overflow-scroll">
                {ladder?.map((user, idx) => {
                    let bgColor;
                    let shadowColor;
                    let borderColor;

                    switch (idx) {
                        case 0:
                            shadowColor = 'nm-inset-yellow-500';
                            borderColor = 'border-yellow-600';
                            break;
                        case 1:
                            shadowColor = 'nm-inset-gray-500';
                            borderColor = 'border-gray-600';
                            break;
                        case 2:
                            shadowColor = 'nm-inset-yellow-800';
                            borderColor = 'border-yellow-900';
                            break;
                        default:
                            shadowColor = 'nm-inset-slate-900';
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
            <div className="flex justify-center items-center p-1">
                <p className="text-white">Your Position: {position + 1}</p>
            </div>
        </div>
    );
}

function MatchList(){

    type Match = {
        your_score: number;
        opponent_score: number;
        nick_name: string;
        image: string;
        user_name: string;
    }

    const [user, setUser] = useState<User>();
    const [matchHistory, setMatchHistory] = useState<MultiplayerMatches[]>();

    useEffect(() => {
        try {
            fetchGet<ExternalUser[]>(`api/getExternalUsers?id=${user?.intra_user_id}`)
            fetchGet<User>('api/profile')
            .then((res) => {
                setUser(res);
            })

            fetchGet<MultiplayerMatches[]>('api/getYourGames')
            .then((res) => {
                setMatchHistory(res);
            })
        } catch (error) {
            console.log('Error fetch data: ', error);
        }
        
    }, []);

    if (!user || !matchHistory)
        return <div>Loading</div>;

    let match: Match[] = [];

    matchHistory.forEach((opponent) => {
        if (opponent.player1_id === user.intra_user_id) {
            match.push({ your_score: opponent.player1_score, opponent_score: opponent.player2_score, nick_name: opponent.nick_name, image:  opponent.image, user_name:  opponent.user_name });
        } else {
            match.push({ your_score: opponent.player2_score, opponent_score: opponent.player1_score , nick_name: opponent.nick_name, image:  opponent.image, user_name:  opponent.user_name });
        }

    });


    return (
        <div className="bg-slate-800 p-2 rounded-b-md rounded-lg shadow-lg nm-inset-slate-800 border-slate-800 border-4">
            <div className='px-2 pt-3'>
                <h1 className="flex justify-center items-center ">Match History</h1>
                <p className="w-auto flex justify-center items-center whitespace-nowrap pb-4 ">&#60;-----------------------------&#62;</p>
            </div>
            <div className="h-[31rem] overflow-scroll">
                {matchHistory?.length === 0 && <p className="text-white text-center">No Matches Played</p>}
                {match.map((match, idx) => (
                    <div className="bg-black p-2 m-1 rounded-lg whitespace-nowrap nm-inset-slate-900" key={idx}>
                        <div className="flex items-center space-x-2">
                            <Image className='rounded-full w-12 h-12 m-1' src={user.image} alt="Profile Picture" width={100} height={100} />
                            {user.nick_name === null ? 
                            <p className="text-white"> {user.user_name}</p>:
                            <p className="text-white"> {user.nick_name}</p>}
                        </div>
                        {match.your_score > match.opponent_score ?
                        <div className="flex text-green-500 justify-center items-center">
                            <p>~~~~~~~~~~</p>
                            <p className=" text-2xl ">~ {match.your_score} - {match.opponent_score} ~</p>
                            <p>~~~~~~~~~~</p>
                        </div> :
                        <div className="flex text-red-500 justify-center items-center">
                            <p>~~~~~~~~~~</p>
                            <p className=" text-2xl ">~ {match.your_score} - {match.opponent_score} ~</p>
                            <p>~~~~~~~~~~</p>
                        </div>
                        }
                        <div className="flex items-center justify-end space-x-2">
                            {match.nick_name === null ? 
                            <p className="text-white"> {match.user_name}</p>:
                            <p className="text-white"> {match.nick_name}</p>}
                            <Image className='rounded-full w-12 h-12 m-1' src={match.image} alt="Profile Picture" width={100} height={100} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

