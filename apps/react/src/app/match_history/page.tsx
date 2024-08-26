'use client';

import { useEffect, useState } from "react";
import { fetchGet } from "../fetch_functions";
import { User } from "@repo/db";
import Image from "next/image";
import { match } from "assert";

export default function MatchHistoryPage() {
    return (
        <div className="flex space-x-4">
            <LadderList />
            <MatchList />
        </div>
    );
}

function LadderList(){
    return (
        <div className="bg-slate-700 p-4 rounded-lg shadow-lg shadow-red-500">
            <h1> Leaderboard </h1>
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
        <div className="bg-slate-800 rounded-b-md rounded-lg shadow-lg shadow-blue-500">
            <div className='px-2 pt-3'>
                <h1 className="flex justify-center items-center ">Match History</h1>
                <p className="w-auto whitespace-nowrap pb-4 ">&#60;----------------------------------&#62;</p>
            </div>
            <div className="">
                {matchHistory?.map((opponent, idx) => (
                    <div className="bg-black p-2 m-1 rounded-lg " key={idx}>

                        <div className="flex items-center space-x-2">
                            <Image className='rounded-full w-14 h-14' src={user.image} alt="Profile Picture" width={100} height={100} />
                            {user.nick_name === null ? 
                            <p className="text-white"> {user.user_name}</p>:
                            <p className="text-white"> {user.nick_name}</p>}
                        </div>
                        <div className="flex text-green-500 justify-center items-center">
                            <p>~~~~~~~~~~</p>
                            <p className=" text-2xl ">~ {opponent.player1_score} - {opponent.player2_score} ~</p>
                            <p>~~~~~~~~~~</p>
                        </div>
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

