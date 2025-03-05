"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchPost } from "../../fetch_functions"

const TwoFactorAuth = () => {
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    if (!searchParams)
        throw new Error('SearchParams is undefined');

    type TwoFactorAuthParams = {
        tempToken: string | null;
        twoFactorCode: string;
    };
    const tempToken = searchParams.get('tempToken');

    useEffect(() => {
        if (tempToken === null) {
            router.push('/login');
        }
    }, [tempToken, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetchPost<TwoFactorAuthParams, string>(`http://${process.env.NEXT_PUBLIC_HOST_NAME}:4242/auth/2fa/login-verify`, 
                {
                    tempToken: tempToken,
                    twoFactorCode: twoFactorCode,
                }
            )         
            console.log('Token:', response);
            localStorage.setItem('token', response);
            router.push('/');      
        } catch (error) {
            console.error('Error during 2FA verification:', error);
            setMessage('Invalid 2FA code');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-96">
                <h1 className="text-2xl mb-4 text-center text-black">Two-Factor Authentication</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        placeholder="Enter 2FA code"
                        className="border p-2 w-full mb-4 rounded-lg text-black"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white w-full py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                        Verify
                    </button>
                </form>
                {message && <p className="text-center mt-4 text-red-500">{message}</p>}
            </div>
        </div>
    );
};

export default TwoFactorAuth;