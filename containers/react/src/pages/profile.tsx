"use client";
import { FunctionRouter } from "@/app/page";
import { useState, useEffect } from "react";
import { fetchProfile } from "../app/page";


export default function Profile({ navigateToMenu }: { navigateToMenu: FunctionRouter }) {
    const [user, setUser] = useState<any>(null); // This Any needs to be replaced with the correct type that we will get from the backend
    
    useEffect(() => {
        fetchProfile(localStorage.getItem('token'))
        .then((data) => {
            console.log('Retrieved Data: ', data);
            setUser(data);
        })
    }, []);

    if (!user)
        return <div>Loading...</div>;
    return (

    <div>
      <h1>Profile: {user.user_name}</h1>
      <button className="bg-blue-500 text-white font-bold py-2 px-4 mt-4 rounded" onClick={navigateToMenu}>
        Back to Menu
        </button>
    </div>
  );
} 