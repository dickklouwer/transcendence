"use client";

import React, { useState } from 'react';
import axios from 'axios';

const Enable2FA = () => {
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  const handleEnable2FA = async () => {
    try {
      console.log('Button clicked'); // Log to check if button click is detected

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      console.log('Token found:', token); // Log the token

      const response = await axios.post('http://localhost:4242/auth/2fa/enable', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Response received:', response); // Log the response
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
    } catch (error) {
      console.error('Error enabling 2FA', error.response ? error.response.data : error.message); // Improved error logging
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request data:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  const handleVerify2FA = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      console.log('Token found:', token); // Log the token

      const response = await axios.post('http://localhost:4242/auth/2fa/verify', { token: token }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage('2FA verification successful');
    } catch (error) {
      setMessage('Invalid 2FA token');
      console.error('Error verifying 2FA', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <h1>Enable Two-Factor Authentication</h1>
      <button onClick={handleEnable2FA}>Enable 2FA</button>
      {qrCode && (
        <div>
          <p>Scan this QR code with your 2FA app:</p>
          <img src={qrCode} alt="2FA QR Code" />
          <p>Secret: {secret}</p>
        </div>
      )}
      <h2>Verify Two-Factor Authentication</h2>
      <input 
        type="text" 
        value={token} 
        onChange={(e) => setToken(e.target.value)} 
        placeholder="Enter 2FA token" 
      />
      <button onClick={handleVerify2FA}>Verify 2FA</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Enable2FA;
