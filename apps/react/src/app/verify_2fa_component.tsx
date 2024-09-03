import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import PongAnimation from './pong_animation';

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
    try {
      const response = await axios.post('http://localhost:4242/auth/2fa/login-verify', {
        tempToken,
        twoFactorCode
      });

      if (response.status === 200) {
        const { token } = response.data;
        onVerificationComplete(token);
      } else {
        setError('Invalid 2FA code');
      }
    } catch (error) {
      console.error('Error during 2FA verification:', error);
      setError('Error verifying 2FA code');
    }
  };

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