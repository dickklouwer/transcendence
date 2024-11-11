import React, { useState, useEffect } from 'react';

// Countdown Component
const Countdown = () => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown === 0) {
      return;
    }
    while (countdown > 1) {
      const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
      
      return () => clearTimeout(timerId);
    }

  }, [countdown]);

  if (countdown <= 0) {
    return null;
  }

  return (
    countdown > 0 && (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '4rem',
      }}>
        {countdown}
      </div>
    )
  );
};

export default Countdown;