"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const Enable2FA = () => {
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const router = useRouter();

  const handleEnable2FA = async () => {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        console.error('No auth token found');
        return;
      }

      const response = await axios.post('http://localhost:4242/auth/2fa/enable', {}, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
    } catch (error) {
      console.error('Error enabling 2FA', error.response ? error.response.data : error.message);
    }
  };

  const handleVerify2FA = async () => {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        console.error('No auth token found');
        return;
      }

      const response = await axios.post('http://localhost:4242/auth/2fa/verify', { token }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      setMessage('2FA verification successful');
      setIs2FAEnabled(true);
      setTimeout(() => {
        router.push('/profile'); // Redirect to profile page after a delay
      }, 2000);
    } catch (error) {
      setMessage('Invalid 2FA token');
      console.error('Error verifying 2FA', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="min-w-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 h-full max-h-md">
        <h1 className="text-2xl mb-4 text-center text-black">Two-Factor Authentication</h1>
        {!qrCode && (
          <button
            onClick={handleEnable2FA}
            className="bg-blue-500 text-white w-full py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Enable 2FA
          </button>
        )}
{qrCode && (
          <div className="mt-6">
            <p className="text-center mb-4 text-black">Scan this QR code with your 2FA app</p>
            <div className="flex justify-center">
              <img src={qrCode} alt="2FA QR Code" className="border p-2" />
            </div>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your 2FA token"
              className="border p-2 w-full mt-4 rounded-lg text-black"
            />
            <button
              onClick={handleVerify2FA}
              className="bg-green-500 text-white w-full py-2 mt-4 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Verify 2FA
            </button>
            {message && <p className="text-center mt-4 text-black">{message}</p>}
          </div>
        )}
        {is2FAEnabled && (
          <div className="mt-6">
            <p className="text-center mb-4 text-black">2FA Enabled</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Enable2FA;
