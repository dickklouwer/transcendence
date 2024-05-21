import { signIn } from 'next-auth/react';

export default function Login() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Login with 42</h2>
            <button
                onClick={() => signIn('42-school', { callbackUrl: 'http://localhost:2424/api/auth/signin' })}
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
            >
                Login with 42
            </button>
        </div>
    );
}
