import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PongAnimation from './pong_animation';
import { fetchPost } from './fetch_functions';
interface TwoFactorVerificationProps {
  tempToken: string;
  onVerificationComplete: (token: string) => void;
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({ tempToken, onVerificationComplete }) => {
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    type TokenBody = {
      tempToken: string;
      twoFactorCode: string;
    };

    type TokenResponse = {
      jwt: string;
    };
    try {
    const result = await fetchPost<TokenBody, TokenResponse>(`http://${process.env.NEXT_PUBLIC_HOST_NAME}:4242/auth/2fa/login-verify`, {
      tempToken: tempToken,
      twoFactorCode: twoFactorCode,
    })
      const { jwt } = result;
      onVerificationComplete(jwt);
    } catch (error) {
      console.error('Error during 2FA verification:', error);
      setError('Invalid 2FA code');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="bg-white shadow-lg rounded-lg p-6 w-96">
        <h1 className="text-2xl mb-4 text-center text-black">Two-Factor Authentication</h1>
        <div className="mb-16">
          <PongAnimation />
        </div>
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
        {error && <p className="text-center mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
};


export default TwoFactorVerification;