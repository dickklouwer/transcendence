"use client";


// import { signIn } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { fetchPost } from '../page';
import { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';


export default function Login({children}:{children: React.ReactNode}) {



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

export function SignIn42() {


    return (
        <div className="flex flex-col items-center">
            <h3> Login with your 42 account </h3>
            <button className="bg-blue-500 text-white font-bold py-2 px-4 mt-4 rounded"  onClick={() => signIn('FortyTwoProvider')}>Sign in with 42</button>
        </div>
    )

}

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

