"use client";

// import { signIn } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userSocket } from '../profile_headers';
import { fetchGet } from '../fetch_functions'
import { User } from '@repo/db'
import { chatSocket } from '../chat_componens';


export default function Login() {

    const router = useRouter();

    useEffect(() => {
        if (localStorage.getItem('token') !== null) {
        fetchGet<User>('/api/profile')
        .then((user) => {
            if (user) {
               router.push('/menu'); 
            }
        })
    }
        
}, [router]);

    if (userSocket.connected) {
        userSocket.disconnect();
        chatSocket.disconnect();
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl font-bold mb-4 underline">Would you like to sign in?</h2>
            <SignIn42 />
            <div className='p-6'>
                <SignInDevUser />
            </div>
        </div>
    );
}

const signInFortyTwo = async () => {
    await signIn('FortyTwoProvider')
    .then(() => {
        userSocket.connect();
        chatSocket.connect();
    });
}

export function SignIn42() {

    return (
        <div className="flex flex-col items-center">
            <h3> Login with your 42 account </h3>
            <button className="bg-blue-500 text-white font-bold py-2 px-4 mt-4 rounded"  onClick={signInFortyTwo}>Sign in with 42</button>
        </div>
    )
}

/**
 * The SignInDevUser function allows a user to sign in as a Dev User.
 * This works by sending a POST request to the server with the username.
 */
export function SignInDevUser() {
    const [tempUsername, setTempUsername] = useState<string>("");
    const Router = useRouter();

    async function devSignIn( username : string) {
        setTempUsername('');
        try {
            console.log("Creating Dev_User:", username);
            const response = await fetch( 'auth/dev_validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username }),
            });     
            if (response.ok)
                {
                    userSocket.connect();
                    chatSocket.connect();
                    Router.push(response.url);
                }
            }
        catch (error) {
            console.error("Error Creating Dev_User:", error);
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTempUsername(e.target.value);
      };

    return (
        <div className="flex flex-col items-center ">
            <p> Login as a Dev User </p>
         <div className="flex space-x-4 py-2">
                <input
                    type="text"
                    value={tempUsername}
                    onChange={handleChange}
                    placeholder="Enter your Username"
                    autoFocus={true}
                    onKeyUp={(e) => {e.code == "Enter" && devSignIn(tempUsername)}}
                    className={'w-full text-black py-2 px-4 border rounded '}
                    maxLength={15}
                />
                <button
                    className={` bg-green-500 hover:bg-green-700 disabled:bg-red-500 disabled:hover:bg-red-700 text-white px-2 py-2 rounded  transition-all duration-150`}
                    onClick={() => devSignIn(tempUsername)}
                    disabled={tempUsername.trim() === ""}
                >
                Login
                </button>
            </div>
        </div>
    )
}

