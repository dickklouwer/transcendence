// PongGame.js
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4242'); // Update to your backend URL

const PongGame = () => {
  const [keysPressed, setKeysPressed] = useState({});
  const [rightPaddlePosition, setRightPaddlePosition] = useState(150);

  const canvasRef = useRef(null);

  const paddleWidth = 10;
  const paddleHeight = 100;
  const gameWidth = 400;
  const gameHeight = 400;
  const ballSize = 10;
  const borderWidth = 5;
  const ballPosition = { x: 200, y: 200 };
  const leftPaddlePosition = 150;
  const score = { leftPlayer: 0, rightPlayer: 0 };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    // Draw ball
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(ballPosition.x, ballPosition.y, ballSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw left paddle
    ctx.fillStyle = 'white';
    ctx.fillRect(10, leftPaddlePosition, paddleWidth, paddleHeight);

    // Draw right paddle
    ctx.fillStyle = 'white';
    ctx.fillRect(gameWidth - paddleWidth - 10, rightPaddlePosition, paddleWidth, paddleHeight);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      setKeysPressed((prevKeys) => ({ ...prevKeys, [event.key]: true }));
    };

    const handleKeyUp = (event) => {
      setKeysPressed((prevKeys) => ({ ...prevKeys, [event.key]: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('movement', (movement) => {
      setRightPaddlePosition((prevPosition) => {
        if (movement === 'ArrowUp') {
          return Math.max(0, prevPosition - 5);
        }
        if (movement === 'ArrowDown') {
          return Math.min(gameHeight - paddleHeight, prevPosition + 5);
        }
        return prevPosition;
      });
    });

    return () => {
      socket.off('connect');
      socket.off('movement');
    };
  }, []);

  useEffect(() => {
    if (keysPressed['ArrowUp']) {
      socket.emit('movement', 'ArrowUp');
    }
    if (keysPressed['ArrowDown']) {
      socket.emit('movement', 'ArrowDown');
    }
  }, [keysPressed]);

  useEffect(() => {
    draw();
  }, [rightPaddlePosition]);

  const sendMessage = () => {
    socket.emit('message', 'Hello from client');
  };

  return (
    <>
      <h1>Score: {score.leftPlayer}-{score.rightPlayer}</h1>
      <canvas
        ref={canvasRef}
        width={gameWidth}
        height={gameHeight}
        style={{ border: `${borderWidth}px solid white` }}
      />
      <div>
        <h1>Pong Game</h1>
        <button onClick={sendMessage}>Send Message</button>
      </div>
    </>
  );
};

export default PongGame;
