"use client";


// import { signIn } from 'next-auth/react';
import { signIn, signOut } from 'next-auth/react';
//  { callbackUrl: 'http://localhost:2424/api/auth/signin'

export default function Login() {

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Login with 42</h2>
            <SignIn42 />
        </div>
    );
}

export function SignIn42() {


    return (
        <div className="flex flex-col items-center">
            <p> Would you like to sign in?</p>
            <button className="bg-blue-500 text-white font-bold py-2 px-4 mt-4 rounded"  onClick={() => signIn('FortyTwoProvider')}>Sign in with 42</button>
        </div>
    )

}
